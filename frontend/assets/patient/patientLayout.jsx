// src/components/Layout/Layout.js
import React from "react";
import PatientTopbar from "./Topbar/topbar";
import Topbar from "../Topbar/topbar";
import Services from "./services/services"
import FAQ from "../queries/queries"
import Footer from "../footer/footer"
import Login from "../Login/login"
import Signup from "../Signup/signup"

import { useState } from "react";
import { useNavigate } from "react-router-dom";
const PatientLayout = ({ children }) => {

  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignupClicked, setIsSignupClicked] = useState(false);


    const [token, setToken] = useState(localStorage.getItem("token"));
       
    const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/patienthome", { state: { reload: true } });
    setIsLoginClicked(true);
    setIsSignupClicked(false);
  };
  
  const handleSignupClick = () => {
    navigate("/patienthome", { state: { reload: true } });
    setIsSignupClicked(true);
    setIsLoginClicked(false);
  };
  
  const closeModal = () => {
    setIsLoginClicked(false);
    setIsSignupClicked(false);
    console.log("Cross button clicked! Closing Signup Modal...");
  };
  
  const handleProfileClick = () => {
    navigate("/patientProfile");
    // setIsprofileClicked(true);
  };
  
  const handlecross = () => {
    setTimeout(() => {
      setIsSignupClicked(false);
    }, 400);
  
    setTimeout(() => {
      setIsLoginClicked(false);
    }, 400);
  };


  return (
    <div className="patient-app">
      {(isLoginClicked || isSignupClicked) && (
  <div className="overlay" onClick={closeModal}></div>
    )}
      <div className="patient_top_head">
                {token ? (
                  <PatientTopbar onProfileClick={handleProfileClick} />
                ) : (
                  <Topbar
                    onLoginClick={handleLoginClick}
                    onSignupClick={handleSignupClick}
                    onProfileClick={handleLoginClick}
                  />
                )}
              </div>
       {isLoginClicked && (
                <div className={isLoginClicked ? "login_show" : "login_hide"}>
                  <Login
                    redirectToSignup={handleSignupClick}
                    crossLogin={handlecross}
                  />
                </div>
              )}
              {isSignupClicked && (
                <div className={isSignupClicked ? "signup_show" : "signup_hide"}>
                  <Signup
                    redirectToLogin={handleLoginClick}
                    crossSignup={handlecross}
                  />
                </div>
              )}
      <main className="patient_content">{children}</main>
     
    </div>
  );
};

export default PatientLayout;




    



