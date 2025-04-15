import "./profile.css";
import ProfessionalTopbar from "../Topbar/professionalTopbar";
import ProfessionalPersonalInfo from "./PersonalInfo";
import ProfessionalBookingHistory from "./BHistory";
import ProfessionalProfileRoutes from "../../../routes/professionalProfileRoutes";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const ProfessionalProfile = () => {
  const [pClicked, setpClicked] = useState(false);
  const [bClicked, setbClicked] = useState(false);
  const [professionalInfo, setProfessionalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const gender = user.gender;

  useEffect(() => {
    const fetchProfessionalInfo = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/api/display/getprofessionalInfo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email }),
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch professional info");
        }
        
        const data = await response.json();
        setProfessionalInfo(data.result);
      } catch (error) {
        console.error("Error fetching professional info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionalInfo();
  }, [user.email]);

  const handleProfileClick = () => {
    navigate("/professionalProfile");
  };

  const handlePclick = () => {
    navigate("/professionalProfile/personalInformation");
  };

  const handleBclick = () => {
    navigate("/professionalProfile/bookingHistory");
  };

  // Render profile picture based on fetched data
  const renderProfilePicture = () => {
    if (loading) {
      return <div className="profile-picture-loading">Loading...</div>;
    }

    if (professionalInfo?.document?.photoUrl) {
      return (
        <img 
          src={professionalInfo.document.photoUrl} 
          alt="Profile" 
          className="profile-picture-image"
        />
      );
    }

    return (
      <div className={gender === "male" ? "profile_picture_male" : "profile_picture_female"}></div>
    );
  };

  return (
    <div className="professional_profile_main">
      <div className="professional_profile_submain">
        <div className="professional_dashboard">
          <ul>
            <li>{renderProfilePicture()}</li>
            <li onClick={handlePclick}>Personal Information</li>
            <li onClick={handleBclick}>Booking History</li>
          </ul>
        </div>
        <div className="professional_dashboard_content">
          <ProfessionalProfileRoutes />
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;