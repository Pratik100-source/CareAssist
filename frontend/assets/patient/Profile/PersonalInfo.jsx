import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import "./PersonalInfo.css";
import { FaEdit } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setUserInfo } from "../../../features/userSlice";
import { showLoader, hideLoader } from "../../../features/loaderSlice";
import { api } from "../../../services/authService";
const PersonalInfo = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
 
  const [patientDetails, setPatientDetails] = useState(null);

  const [formData, setFormData] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    number: user.number || "", 
    gender: user.gender || "",
    birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
  });

  // Calculate max date (today - 18 years)
  const today = new Date();
  const maxDate = new Date(today.setFullYear(today.getFullYear() - 18))
    .toISOString()
    .split("T")[0];
  const minDate = new Date(today.setFullYear(today.getFullYear() - 60))
    .toISOString()
    .split("T")[0];

  // Fetch patient details when the component mounts
  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!user.email) {
        console.error("User email is not available");
        toast.error("User email is not available");
        return;
      }

      try {
        dispatch(showLoader()); // Show loader
        const response = await api.post(`/display/getpatientInfo`, {email: user.email});
        
        // With axios/api, we directly access response.data
        setPatientDetails(response.data.result);

        // Update Redux store with the fetched patient details
        dispatch(
          setUserInfo({
            userType: user.userType,
            token: user.token,
            basic_info: response.data.result,
          })
        );
      } catch (error) {
        console.error("Error fetching patient information:", error);
        toast.error("Failed to load patient information");
      } finally {
        dispatch(hideLoader()); // Hide loader
      }
    };


    // Fetch patient details only if user.email is available
    if (user.email) {
      fetchPatientDetails();
    }
  }, [user.email, user.token, user.userType, dispatch]); // Add dependencies

  // Update formData when patientDetails changes
  useEffect(() => {
    if (patientDetails) {
      setFormData({
        firstname: patientDetails.firstname || "",
        lastname: patientDetails.lastname || "",
        number: patientDetails.number || "",
        gender: patientDetails.gender || "",
        birthdate: patientDetails.birthdate
          ? patientDetails.birthdate.split("T")[0]
          : "",
      });
    }
  }, [patientDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    try {
      dispatch(showLoader()); // Show loader
      const response = await api.put(`/edit/edit-patient`, {email: user.email, ...formData});
      
      // With axios/api, we directly access response.data
      // Update Redux store with the updated patient details
      dispatch(
        setUserInfo({
          userType: user.userType,
          token: user.token,
          basic_info: response.data.data, // Assuming the backend returns the updated patient in `data.data`
        })
      );

      toast.success("Profile updated successfully!");
      setTimeout(() => {
  
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setShowConfirmation(false);
      setShowEditForm(false);
      dispatch(hideLoader()); // Hide loader
    }
  };

  const formattedBirthdate = user.birthdate ? user.birthdate.split("T")[0] : null;

  return (
    <div className="personal-info">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="personal-info-header">
        <h2>Personal Information</h2>
        <button
          className="edit-button"
          onClick={() => setShowEditForm(true)}
          aria-label="Edit personal information"
        >
          <FaEdit className="edit-icon" />
          <span>Edit</span>
        </button>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Full Name</span>
          <span className="info-value">
            {user.firstname ? `${user.firstname} ${user.lastname}` : "Not provided"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Phone</span>
          <span className="info-value">{user.number || "Not provided"}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Gender</span>
          <span className="info-value">
            {user.gender
              ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
              : "Not provided"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Birthdate</span>
          <span className="info-value">{formattedBirthdate || "Not provided"}</span>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Personal Information</h3>
              <button
                className="close-button"
                onClick={() => setShowEditForm(false)}
                aria-label="Close modal"
              >
                <IoClose />
              </button>
            </div>

            <form className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstname">First Name</label>
                  <input
                    id="firstname"
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastname">Last Name</label>
                  <input
                    id="lastname"
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="number">Phone Number</label>
                <input
                  id="number"
                  type="tel"
                  name="number" // Match the formData key
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="birthdate">Birthdate</label>
                  <input
                    type="date"
                    name="birthdate"
                    id="birthdate"
                    onChange={handleInputChange}
                    value={formData.birthdate}
                    max={maxDate}
                    min={minDate}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-button"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Changes</h3>
            <p>Are you sure you want to update your personal information?</p>

            <div className="confirmation-actions">
              <button className="confirm-button" onClick={handleConfirmSave}>
                Yes, Update
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowConfirmation(false)}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;