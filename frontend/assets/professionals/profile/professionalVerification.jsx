import React, { useState } from "react";
import "./professionalVerification.css";
import { useSelector } from "react-redux";
import { showLoader, hideLoader } from "../../../features/loaderSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const ProfessionalVerification = ({handleVerifyClick, handleVerificationTrigger}) => {
  const [selectedProfession, setSelectedProfession] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const professional = useSelector((state) => state.user);
  const professional_email = professional.email;

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
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

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i < 10 ? `0${i}:00` : `${i}:00`;
    return hour;
  });

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
    const response = await fetch(
      "http://localhost:3003/api/verification/saveVerification",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: professional_email,
          photoUrl,
          documentUrl,
          ...formData,
        }),
      }
    );

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
      profession: form.profession.value,
      specialization: form.specialization?.value || "",
      consultationMethod: form.consultationMethod.value,
      startTime: form.startTime.value,
      endTime: form.endTime.value,
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
      toast.error(
        "Failed to submit verification information. Please try later",
        { position: "top-right", autoClose: 3000 }
      );
  
    } finally {
      setIsSubmitting(false);
      handleVerifyClick();  
      navigate("/professionalProfile");
      handleVerificationTrigger();
      dispatch(hideLoader());
      toast.success("Verification has been submitted", {position:"top-right", autoClose:3000})
    
    }
  };

  return (
    <form className="professional-verification" onSubmit={handleSubmit}>
      <h2 className="profile-title">Professional Profile Setup</h2>
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
              >
                {timeOptions.map((time) => (
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
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Complete Profile"}
      </button>
    </form>
  );
};

export default ProfessionalVerification;
