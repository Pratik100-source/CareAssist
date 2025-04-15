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
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

const Login = ({ redirectToSignup, crossLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleLogin = async (e) => {
    e.preventDefault(); 

    if (!validate_input()) { 
      return; 
    }

    try {
      dispatch(showLoader());
      const response = await axios.post("http://localhost:3003/api/auth/login", formData);
      console.log("API Response:", response);
    
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
        console.log(error.response.data.message);
      } else {
        toast.error("Network or server error. Please try again.", { position: "top-right", autoClose: 3000 });
        console.log("Network or server error. Please try again.");
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
          <button type="submit" className="login_submit">
            Login
          </button>
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