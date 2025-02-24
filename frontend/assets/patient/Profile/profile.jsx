import "../Profile/profile.css";
import PatientTopbar from "../Topbar/topbar";
import PatientPersonalInfo from "../Profile/PersonalInfo";
import PatientBookingHistory from "../Profile/BHistory";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PatientProfile = () => {
  const [pClicked, setpClicked] = useState(false);
  const [bClicked, setbClicked] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/patientProfile");
  };

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
      <div className="profile_top_head">
        <PatientTopbar onProfileClick={handleProfileClick}></PatientTopbar>
      </div>

      <div className="patient_profile_submain">
        <div className="patient_dashboard">
          <ul>
            <li onClick={handlePclick}>Personal Information</li>
            <li onClick={handleBclick}>Booking Information</li>
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
      {/* <div className="third_section"></div> */}
    </div>
  );
};

export default PatientProfile;
