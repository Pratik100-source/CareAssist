import React, { useState } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import axios from "axios";
import "./changePassword.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../services/authService";
import {logout} from "../../features/userSlice"
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../features/loaderSlice";
import { useNavigate } from "react-router-dom";
const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const dispatch = useDispatch();

  const user = useSelector((state)=>state.user);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Strong password regex (same as Signup component)
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Password strength feedback
    if (name === "newPassword") {
      if (!value) {
        setPasswordFeedback("");
      } else if (!strongPasswordRegex.test(value)) {
        setPasswordFeedback("Strength: Weak");
      } else {
        setPasswordFeedback("Strength: Strong");
      }
    }
  };

  const validateForm = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;
    let valid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (!strongPasswordRegex.test(newPassword)) {
      newErrors.newPassword = "Password doesn't meet requirements";
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
      valid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords is not matching";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(showLoader());;
    try {
      const response = await api.put(`/edit/edit-password`, { 
        email: user.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword 
      });
      
      dispatch(logout());
      toast.success("Password changed successfully", { 
        position: "top-right", 
        autoClose: 3000 
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordFeedback("");
      dispatch(hideLoader());
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "An error occurred during password change", { 
        position: "top-right", 
        autoClose: 3000 
      });
      dispatch(hideLoader());
    } finally {
      setIsLoading(false);
      dispatch(hideLoader());
    }
  };

  return (
    <div className="change-password-container">
      <h1>Change Password</h1>
      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="password-field">
          <label>Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              autoComplete="current-password"
              className={errors.currentPassword ? "error" : ""}
            />
            <span
              className="eye-icon"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.currentPassword && (
            <p className="error-message">{errors.currentPassword}</p>
          )}
        </div>

        <div className="password-field">
          <label>New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              className={errors.newPassword ? "error" : ""}
            />
            <span
              className="eye-icon"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {passwordFeedback && (
            <p className={`password-feedback ${
              strongPasswordRegex.test(formData.newPassword) ? "valid" : "invalid"
            }`}>
              {passwordFeedback}
            </p>
          )}
          {errors.newPassword && (
            <p className="error-message">{errors.newPassword}</p>
          )}
        </div>

        <div className="password-field">
          <label>Confirm New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              className={errors.confirmPassword ? "error" : ""}
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="change-password-button"
          disabled={isLoading}
        >
          {isLoading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;