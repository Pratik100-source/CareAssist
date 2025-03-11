import "./profile.css";
import ProfessionalTopbar from "../Topbar/professionalTopbar";
import ProfessionalPersonalInfo from "./PersonalInfo";
import ProfessionalBookingHistory from "./BHistory";
import ProfessionalProfileRoutes from "../../../routes/professionalProfileRoutes";

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
       navigate("/professionalProfile/personalInformation")
  };

  const handleBclick = () => {
    navigate("/professionalProfile/bookingHistory")
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
          <ProfessionalProfileRoutes></ProfessionalProfileRoutes>

        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;
