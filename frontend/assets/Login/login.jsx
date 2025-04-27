import React, { useState } from "react";
import axios from "axios";
import photo from "../images/side_image.jpg";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../features/userSlice";
import { hideLoader, showLoader } from "../../features/loaderSlice";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

const Login = ({ redirectToSignup, crossLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Strong password regex
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData({ ...forgotPasswordData, [name]: value });

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

  const validate_input = () => {
    if (!formData.email) { 
      toast.error("Email is required", { position: "top-right", autoClose: 3000 });
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required", { position: "top-right", autoClose: 3000 });
      return false;
    }
    return true; 
  };

  const validateForgotPassword = () => {
    if (forgotPasswordStep === 1) {
      if (!forgotPasswordData.email) {
        toast.error("Email is required", { position: "top-right", autoClose: 3000 });
        return false;
      }
      return true;
    } else if (forgotPasswordStep === 2) {
      if (!forgotPasswordData.otp) {
        toast.error("OTP is required", { position: "top-right", autoClose: 3000 });
        return false;
      }
      return true;
    } else if (forgotPasswordStep === 3) {
      const { newPassword, confirmPassword } = forgotPasswordData;
      if (!newPassword) {
        toast.error("New password is required", { position: "top-right", autoClose: 3000 });
        return false;
      }
      if (!strongPasswordRegex.test(newPassword)) {
        toast.error("Password must be at least 8 characters with uppercase, lowercase, number, and special character", { position: "top-right", autoClose: 5000 });
        return false;
      }
      if (!confirmPassword) {
        toast.error("Please confirm your new password", { position: "top-right", autoClose: 3000 });
        return false;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match", { position: "top-right", autoClose: 3000 });
        return false;
      }
      return true;
    }
    return false;
  };

  const handleSendOtp = async () => {
    if (!validateForgotPassword()) return;
    
    try {
      dispatch(showLoader());
      const response = await axios.post("http://localhost:3003/api/otp/send-forget-otp", {
        email: forgotPasswordData.email
      });
      
      if (response.data.success) {
        toast.success("OTP sent to your email", { position: "top-right", autoClose: 3000 });
        setForgotPasswordStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP", { position: "top-right", autoClose: 3000 });
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateForgotPassword()) return;
    
    try {
      dispatch(showLoader());
      const response = await axios.post("http://localhost:3003/api/otp/verify-forget-otp", {
        otp: forgotPasswordData.otp
      });
      
      if (response.data.success) {
        toast.success("OTP verified", { position: "top-right", autoClose: 3000 });
        setForgotPasswordStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP", { position: "top-right", autoClose: 3000 });
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleResetPassword = async () => {
    if (!validateForgotPassword()) return;
    
    try {
      dispatch(showLoader());
      const response = await axios.post("http://localhost:3003/api/auth/reset-password", {
        email: forgotPasswordData.email,
        newPassword: forgotPasswordData.newPassword
      });
      
      if (response.data.success) {
        toast.success("Password reset successfully", { position: "top-right", autoClose: 3000 });
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setForgotPasswordData({
          email: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password", { position: "top-right", autoClose: 3000 });
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 
    if (!validate_input()) return; 

    try {
      dispatch(showLoader());
      const response = await axios.post("http://localhost:3003/api/auth/login", formData);
    
      if (response.status === 200) {
        const { userType, token, user } = response.data;
        localStorage.setItem("token", token);
        dispatch(setUserInfo({ userType, token, basic_info: user }));

        setTimeout(async () => {
          if (userType === "Patient") {
            dispatch(hideLoader());
            localStorage.setItem("reload", "true");
            navigate("/patientHome", { state: { reload: true } });
          } else if (userType === "Professional") {
            dispatch(hideLoader());
            localStorage.setItem("reload", "true");
            navigate("/professionalHome", { state: { reload: true } });
          }
          else if (userType === "Admin") {
            dispatch(hideLoader());
            localStorage.setItem("reload", "true");
            navigate("/admindashboard", { state: { reload: true } });
          }
        }, 3000);
      }
    } catch (error) {
      dispatch(hideLoader());
      if (error.response) {
        toast.error(error.response.data.message || "Login failed", { position: "top-right", autoClose: 3000 });
      } else {
        toast.error("Network or server error. Please try again.", { position: "top-right", autoClose: 3000 });
      }
    }
  };

  const click_signup = () => {
    redirectToSignup();
  };

  const cross_clicked = () => {
    if (crossLogin) {
      crossLogin();
    } else {
      console.error("crossLogin function is undefined!");
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep(1);
    setForgotPasswordData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
  };

  return (
    <form onSubmit={handleLogin}> 
      <RxCross2 className="login_cross" onClick={cross_clicked} />
      <div className="login_main">
        <div className="login_form">
          <h1>Login to CareAssist</h1>
          <p>
            Don't have an account? <span onClick={click_signup}>Signup</span>
          </p>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="off"
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <p className="forgot-password" onClick={handleForgotPasswordClick}>
            Forgot Password?
          </p>
          <button type="submit" className="login_submit">
            Login
          </button>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="forgot-password-modal">
              <div className="forgot-password-content">
                <RxCross2 className="close-modal" onClick={closeForgotPassword} />
                <h2>Reset Password</h2>
                
                {forgotPasswordStep === 1 && (
                  <div className="forgot-password-step">
                    <p>Enter your email to receive a verification code</p>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      required
                    />
                    <button 
                      type="button" 
                      className="forgot-password-btn"
                      onClick={handleSendOtp}
                    >
                      Send OTP
                    </button>
                  </div>
                )}

                {forgotPasswordStep === 2 && (
                  <div className="forgot-password-step">
                    <p>Enter the OTP sent to your email</p>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={forgotPasswordData.otp}
                      onChange={handleForgotPasswordChange}
                      required
                    />
                    <button 
                      type="button" 
                      className="forgot-password-btn"
                      onClick={handleVerifyOtp}
                    >
                      Verify OTP
                    </button>
                  </div>
                )}

                {forgotPasswordStep === 3 && (
                  <div className="forgot-password-step">
                    <p>Enter your new password</p>
                    <div className="password-field">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="New Password"
                        value={forgotPasswordData.newPassword}
                        onChange={handleForgotPasswordChange}
                        required
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
                        strongPasswordRegex.test(forgotPasswordData.newPassword) ? "valid" : "invalid"
                      }`}>
                        {passwordFeedback}
                      </p>
                    )}
                    <div className="password-field">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={forgotPasswordData.confirmPassword}
                        onChange={handleForgotPasswordChange}
                        required
                      />
                      <span
                        className="eye-icon"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="forgot-password-btn"
                      onClick={handleResetPassword}
                    >
                      Reset Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="login_image">
          <img src={photo} alt="Login Visual" />
        </div>
      </div>
    </form>
  );
};

Login.propTypes = {
  redirectToSignup: PropTypes.func.isRequired,
  crossLogin: PropTypes.func.isRequired,
};

export default Login;