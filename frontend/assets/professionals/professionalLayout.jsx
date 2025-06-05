// src/components/Layout/Layout.js
import React from "react";
import ProfessionalTopbar from "./Topbar/professionalTopbar";
import Topbar from "../Topbar/topbar";
import FAQ from "../queries/queries"
import Footer from "../footer/footer"
import Login from "../Login/login"
import Signup from "../Signup/signup"

import { useState } from "react";
import { useNavigate } from "react-router-dom";
const ProfessionalLayout = ({ children }) => {

  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignupClicked, setIsSignupClicked] = useState(false);


    const [token, setToken] = useState(localStorage.getItem("accessToken"));
       
    const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/professionalhome", { state: { reload: true } });
    setIsLoginClicked(true);
    setIsSignupClicked(false);
  };
  
  const handleSignupClick = () => {
    navigate("/professionalhome", { state: { reload: true } });
    setIsSignupClicked(true);
    setIsLoginClicked(false);
  };
  
  const closeModal = () => {
    setIsLoginClicked(false);
    setIsSignupClicked(false);
    console.log("Cross button clicked! Closing Signup Modal...");
  };
  
  const handleProfileClick = () => {
    navigate("/professionalProfile");
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
    <div className="professional-app">
      {(isLoginClicked || isSignupClicked) && (
  <div className="overlay" onClick={closeModal}></div>
    )}
      <div className="top_head">
                {token ? (
                  <ProfessionalTopbar onProfileClick={handleProfileClick} />
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
      <main className="professional_content">{children}</main>
     
    </div>
  );
};

export default ProfessionalLayout;




    



