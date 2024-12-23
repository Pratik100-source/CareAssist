import React, { useState } from "react";
import axios from "axios";
import photo from "../images/side_image.jpg";
import { useNavigate } from "react-router-dom"; 
import "./signup.css"

const Signup = () => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate(); 
  const [isOtpSent, setIsOtpSent] = useState(false); 

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:3003/send-otp", { email: formData.email });
      setIsOtpSent(true);
      setStep(2); 
    } catch (error) {
      alert("Error sending OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post("http://localhost:3003/verify-otp", { otp });
      setStep(3); // Proceed to registration form
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axios.post("http://localhost:3003/signup", formData);
      alert("Signup successful");
      // Redirect to login or other page
      navigate("/login");
    } catch (error) {
      alert("Error signing up");
    }
  };

  const click_login =() =>{

    navigate("/login")
  }

  return (
    <div className="signup_main">
      <div className="signup_image">
        <img src={photo} alt="Signup Visual" />
      </div>
      <div className="signup_form">
        {step === 1 && (
          <div className="signup_first">
            <h1>Signup to CareAssist</h1>
            <p>Already have an account? <span onClick={click_login}>login</span></p>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isOtpSent}
            />
            <button onClick={handleSendOtp} disabled={isOtpSent} className="first_signup_submit">Submit</button>
          </div>
        )}
        {step === 2 && (
          <div className="signup_second">
            <h1>Signup to CareAssist</h1>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp} className="second_signup_submit">Submit</button>
          </div>
        )}
        {step === 3 && (
          <div className="signup_third">
            <h1>Signup to CareAssist</h1>
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            <button onClick={handleSignup} className="third_signup_submit">Submit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
