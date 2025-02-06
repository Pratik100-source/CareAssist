import React, { useState } from "react";
import axios from "axios";
import photo from "../images/side_image.jpg";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import { RxCross2 } from "react-icons/rx";
import PropTypes from "prop-types";

const Signup = ({ redirectToLogin, crossSignup }) => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [finalsubmit, setfinalsubmit] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    mobile: "",
    gender: "0",
    birthdate: "",
    password: "",
    confirmPassword: "",
  });

  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:3003/api/otp/sendOtp", {
        email: formData.email,
      });
      setIsOtpSent(true);
      setStep(2);
    } catch (error) {
      alert("Error sending OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post("http://localhost:3003/api/otp/verifyOtp", { otp });
      setStep(3); // Proceed to registration form
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  const handleSignup = async (role) => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const url =
        role === "patient"
          ? "http://localhost:3003/api/auth/patientSignup"
          : "http://localhost:3003/api/auth/professionalSignup";

      await axios.post(url, formData);
      alert("Signup successful");
      redirectToLogin();
    } catch {
      alert("Error signing up");
    }
  };

  const click_login = () => {
    redirectToLogin();
  };

  const cross_clicked = () => {
    if (crossSignup) {
      crossSignup();
    } else {
      console.error("crossSignup function is undefined!");
    }
  };

  const open_prompt = () => {
    setfinalsubmit(true);
  };

  return (
    <>
      {finalsubmit && (
        <div className="user_prompt">
          <h1>Signup as?</h1>
          <button onClick={() => handleSignup("patient")}>Patient</button>
          <button onClick={() => handleSignup("professional")}>
            Professional
          </button>
        </div>
      )}

      <RxCross2 className="signup_cross" onClick={cross_clicked} />
      <div className="signup_main">
        <div className="signup_image">
          <img src={photo} alt="Signup Visual" />
        </div>
        <div className="signup_form">
          {step === 1 && (
            <div className="signup_first">
              <h1>Signup to CareAssist</h1>
              <p>
                Already have an account?{" "}
                <span onClick={click_login}>login</span>
              </p>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isOtpSent}
              />
              <button
                onClick={handleSendOtp}
                disabled={isOtpSent}
                className="first_signup_submit"
              >
                Submit
              </button>
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
              <button
                onClick={handleVerifyOtp}
                className="second_signup_submit"
              >
                Submit
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="signup_third">
              <h1>Signup to CareAssist</h1>

              <section className="first_row">
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
              </section>

              <section className="second_row">
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                />

                <select
                  name="gender"
                  id="gender"
                  onChange={handleInputChange}
                  value={formData.gender}
                >
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                  <option value="2">Others</option>
                </select>
              </section>

              <input
                type="date"
                name="birthdate"
                id="birthdate"
                onChange={handleInputChange}
                value={formData.birthdate}
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
              <button onClick={open_prompt} className="third_signup_submit">
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

Signup.propTypes = {
  redirectToLogin: PropTypes.func.isRequired,
  crossSignup: PropTypes.func.isRequired,
};

export default Signup;
