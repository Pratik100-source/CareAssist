import "./profile.css";
import ProfessionalTopbar from "../Topbar/professionalTopbar";
import ProfessionalPersonalInfo from "./PersonalInfo";
import ProfessionalBookingHistory from "./BHistory";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

 

const ProfessionalProfile = () => {
  const [pClicked, setpClicked] = useState(false);
  const [bClicked, setbClicked] = useState(false);
  const navigate = useNavigate();

  const user = useSelector((state) => state.user); // Access the 'user' state slice
  const gender = user.gender;

  const handleProfileClick = () => {
    navigate("/professionalProfile");
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
    <div className="professional_profile_main">
      <div className="profile_top_head">
        <ProfessionalTopbar onProfileClick={handleProfileClick}></ProfessionalTopbar>
      </div>

      <div className="professional_profile_submain">
        <div className="professional_dashboard">
          <ul>
            <li><div className={gender==="male"?"profile_picture_male":"profile_picture_female"}></div></li>
            <li onClick={handlePclick}>Personal Information</li>
            <li onClick={handleBclick}>Booking History</li>
          </ul>
        </div>
        <div className="professional_dashboard_content">
          {pClicked}

          {pClicked && (
            <div className="professional_info_content">
              <ProfessionalPersonalInfo />
            </div>
          )}

          {bClicked && (
            <div className="booking_history_content">
              <ProfessionalBookingHistory />
            </div>
          )}
        </div>
      </div>
      {/* <div className="third_section"></div> */}
    </div>
  );
};

export default ProfessionalProfile;
