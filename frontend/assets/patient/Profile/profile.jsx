import "../Profile/profile.css";
import PatientPersonalInfo from "../Profile/PersonalInfo";
import PatientBookingHistory from "../Profile/BHistory";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import ProfileRoutes from "./profileRoutes";

 

const PatientProfile = () => {
  

  const user = useSelector((state) => state.user); // Access the 'user' state slice
  const gender = user.gender;
  
  const navigate = useNavigate();

  const handlePclick = () => {
    navigate("/patientProfile/personalInformation")
  };

  const handleBclick = () => {
     navigate("/patientProfile/bookingHistory")
  };

  return (
    <div className="patient_profile_main">
      <div className="patient_profile_submain">
        <div className="patient_dashboard">
          <ul>
            <li><div className={gender==="male"?"profile_picture_male":"profile_picture_female"}></div></li>
            <li onClick={handlePclick}>Personal Information</li>
            <li onClick={handleBclick}>Booking History</li>
          </ul>
        </div>
        <div className="patient_dashboard_content">
          <ProfileRoutes/>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
