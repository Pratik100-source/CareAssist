import "../Profile/profile.css";
import PatientPersonalInfo from "../Profile/PersonalInfo";
import PatientBookingHistory from "../Profile/BHistory";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

 

const PatientProfile = () => {
  const [pClicked, setpClicked] = useState(false);
  const [bClicked, setbClicked] = useState(false);

  const user = useSelector((state) => state.user); // Access the 'user' state slice
  const gender = user.gender;


  const handlePclick = () => {
    setbClicked(false);
    setpClicked(true);
    console.log(pClicked);
  };

  const handleBclick = () => {
    setpClicked(false);
    setbClicked(true);
    console.log(bClicked);
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
          {pClicked}

          {pClicked && (
            <div className="patient_info_content">
              <PatientPersonalInfo />
            </div>
          )}

          {bClicked && (
            <div className="booking_history_content">
              <PatientBookingHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
