import React, { useState } from "react";
import "./professionalVerification.css";
import { useSelector } from "react-redux";
import { showLoader, hideLoader } from "../../../features/loaderSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../services/authService";
import { useSocket } from '../../professionals/context/SocketContext';

const ProfessionalVerification = ({handleVerifyClick, handleVerificationTrigger}) => {
  const [selectedProfession, setSelectedProfession] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i < 10 ? `0${i}:00` : `${i}:00`;
    return hour;
  });

  const [startTime, setStartTime] = useState(timeOptions[0]);
  const [endTime, setEndTime] = useState(timeOptions[1]);
  
  const professional = useSelector((state) => state.user);
  const professional_email = professional.email;

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const doctorSpecializations = [
    "Gynecologist",
    "Orthopedist",
    "Dietician",
    "Dermatologist",
    "General Physician",
    "Pediatrician",
    "Cardiologist",
    "Neurologist",
  ];

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "verificationDocument");
    formData.append("folder", "careassist/verification");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dxs8fzo1y/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const saveToMongoDB = async (photoUrl, documentUrl, formData) => {
    console.log(formData);
    const response = await api.post(`/verification/saveVerification`, {email: professional_email, photoUrl, documentUrl, ...formData});

    if (!response.ok) throw new Error("Failed to save profile data");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(showLoader());
    setIsSubmitting(true);
    const form = e.target.elements;

    const formData = {
      experience: form.experience.value,
      charge: form.charge.value,
      khalti_wallet: form.khalti_wallet.value,
      profession: form.profession.value,
      specialization: form.specialization?.value || "",
      consultationMethod: form.consultationMethod.value,
      startTime: startTime,
      endTime: endTime,
      availableDays: Array.from(form["availableDays"])
        .filter((input) => input.checked)
        .map((input) => input.value),
    };

    if (!photoFile || !documentFile || !formData.availableDays.length) {
      setIsSubmitting(false);
      dispatch(hideLoader());
     
      return;
    }

    try {
      const photoUrl = await uploadToCloudinary(photoFile);
      const documentUrl = await uploadToCloudinary(documentFile);
      await saveToMongoDB(photoUrl, documentUrl, formData);
    } catch (error) {
      dispatch(hideLoader());
      console.error("Error submitting profile:", error);
  
    } finally {
      setIsSubmitting(false);
      handleVerifyClick();  
      navigate("/professionalProfile");
      handleVerificationTrigger();
      dispatch(hideLoader());
      toast.success("Verification has been submitted", {position:"top-right", autoClose:3000})

       // Emit socket event for booking cancellation
       if (socket) {
        socket.emit("VerificationUpdate", {
          professionalEmail: professional_email,
        });
      }
    
    }
  };

  return (
    <form className="professional-verification" onSubmit={handleSubmit}>
      <div className="form-sections">
        <div className="form-section left-section">
          <div className="form-group">
            <label htmlFor="experience">Experience (yrs) *</label>
            <input
              type="number"
              name="experience"
              className="form-control"
              placeholder="Years"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profession">Profession *</label>
            <select
              name="profession"
              className="form-control"
              required
              disabled={isSubmitting}
              onChange={(e) => setSelectedProfession(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Physiotherapist">Physiotherapist</option>
            </select>
          </div>

          {selectedProfession === "Doctor" && (
            <div className="form-group">
              <label htmlFor="specialization">Specialization *</label>
              <select
                name="specialization"
                className="form-control"
                required
                disabled={isSubmitting}
              >
                <option value="">Select</option>
                {doctorSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="consultationMethod">Consultation *</label>
            <select
              name="consultationMethod"
              className="form-control"
              required
              disabled={isSubmitting}
            >
              <option value="">Select</option>
              <option value="online">Online</option>
              <option value="home">Home Visit</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="form-group">
            <label>Profile Photo *</label>
            <input
              type="file"
              accept="image/*"
              required
              disabled={isSubmitting}
              onChange={(e) => setPhotoFile(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label>Medical License *</label>
            <input
              type="file"
              accept="image/*"
              required
              disabled={isSubmitting}
              onChange={(e) => setDocumentFile(e.target.files[0])}
            />
          </div>
        </div>

        <div className="form-section right-section">
          <div className="form-group">
            <label>Availability Time *</label>
            <div className="time-range">
              <select
                name="startTime"
                className="form-control"
                required
                disabled={isSubmitting}
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  // Reset endTime if it's now invalid
                  const startIdx = timeOptions.indexOf(e.target.value);
                  const endIdx = timeOptions.indexOf(endTime);
                  if (endIdx <= startIdx) {
                    setEndTime(timeOptions[startIdx + 1] || "");
                  }
                }}
              >
                {timeOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <span>to</span>
              <select
                name="endTime"
                className="form-control"
                required
                disabled={isSubmitting}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {timeOptions
                  .filter((time) => timeOptions.indexOf(time) > timeOptions.indexOf(startTime))
                  .map((time) => (
                    <option key={`end-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Available Days *</label>
            <div className="days-grid">
              {daysOfWeek.map((day) => (
                <label key={day} className="day-checkbox">
                  <input
                    type="checkbox"
                    name="availableDays"
                    value={day}
                    disabled={isSubmitting}
                  />
                  <span>{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Charge per hour/session</label>
            <div className="fill_charge">
              <input
                type="number"
                name="charge"
                className="form-control"
                placeholder="Ruppee"
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Khalti Wallet Number</label>
            <div className="number_input">
              <input
                type="text"
                name="khalti_wallet"
                className="form-control"
                placeholder="Enter your Khalti Wallet Number"
                minLength={10}
                maxLength={10}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Complete Profile"}
      </button>
    </form>
  );
};

export default ProfessionalVerification;
