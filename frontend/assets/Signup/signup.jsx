import React, { useState } from "react";
import axios from "axios";
import photo from "../images/side_image.jpg";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import { RxCross2 } from "react-icons/rx";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";

const Signup = ({ redirectToLogin, crossSignup }) => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [finalsubmit, setfinalsubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");
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

  // Strong password regex
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  // Calculate max date (today - 18 years)
  const today = new Date();
  const maxDate = new Date(today.setFullYear(today.getFullYear() - 18)).toISOString().split("T")[0];
  const minDate = new Date(today.setFullYear(today.getFullYear() - 60)).toISOString().split("T")[0];

  const check_email_format = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      if (!strongPasswordRegex.test(value) && value !== "") {
        setPasswordFeedback(
          "Strength: Weak"
        );
      } else if (value === "") {
        setPasswordFeedback("");
      } else {
        setPasswordFeedback("Strength: Strong");
      }
    }
  };

  const handleSendOtp = async () => {
    try {
      const email = formData.email;

      if (!email) {
        toast.error("Email is required", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (check_email_format(email)) {
        const response = await axios.post(
          "http://localhost:3003/api/otp/sendOtp",
          {
            email: email,
          }
        );
        if (response.data.message === "Email already registered") {
          toast.error("Email is already registered", {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (response.data.message === "Check your email for the OTP") {
          setIsOtpSent(true);
          setStep(2);
          toast.success("OTP sent successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.error("Error while sending the OTP", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        toast.error("Please enter the correct email format", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Failed to send OTP"}`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("OTP is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3003/api/otp/verifyOtp",
        { otp }
      );

      if (response.data.message === "OTP verified successfully") {
        setStep(3);
        toast.success("OTP verified", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Failed to verify OTP"}`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    }
  };

  const validateForm = () => {
    const { firstname, lastname, mobile, birthdate, password, confirmPassword } = formData;

    if (!firstname) {
      toast.error("First Name is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    if (!lastname) {
      toast.error("Last Name is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    if (!mobile) {
      toast.error("Mobile Number is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    if (!birthdate) {
      toast.error("Birthdate is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    if (!password) {
      toast.error("Password is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    if (!strongPasswordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)."
        ,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      return false;
    }

    if (!confirmPassword) {
      toast.error("Confirm Password is required", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSignup = async (role) => {
    if (validateForm()) {
      try {
        const url =
          role === "patient"
            ? "http://localhost:3003/api/auth/patientSignup"
            : "http://localhost:3003/api/auth/professionalSignup";

        await axios.post(url, formData);
        toast.success("Signup successful", {
          position: "top-right",
          autoClose: 3000,
        });
        redirectToLogin();
      } catch (error) {
        toast.error("Error signing up", {
          position: "top-right",
          autoClose: 3000,
        });
        console.error("Signup error:", error);
      }
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
    if (validateForm()) {
      setfinalsubmit(true);
    }
  };

  const handle_user_prompt_cross = () =>{
    setfinalsubmit(false);
  }

  return (
    <>
      {finalsubmit && (
        <div className="user_prompt">
          <span className="user_prompt_cross" onClick={handle_user_prompt_cross}><RxCross2></RxCross2></span>
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
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                required
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
                required
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
            <form
              className="signup_third"
              onSubmit={(e) => {
                e.preventDefault();
                open_prompt();
              }}
            >
              <h1>Signup to CareAssist</h1>
              <section className="first_row">
                <input
                  type="text"
                  name="firstname"
                  placeholder="First Name"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last Name"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                />
              </section>

              <section className="second_row">
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
                <select
                  name="gender"
                  id="gender"
                  onChange={handleInputChange}
                  value={formData.gender}
                  required
                >
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </section>
              <section className="third_row">
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
              </section>
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
              {passwordFeedback && (
                <p
                  className={`password-feedback ${
                    strongPasswordRegex.test(formData.password) ? "valid" : "invalid"
                  }` }
                >
                  {passwordFeedback}
                </p>
              )}
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button type="submit" className="third_signup_submit">
                Submit
              </button>
            </form>
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