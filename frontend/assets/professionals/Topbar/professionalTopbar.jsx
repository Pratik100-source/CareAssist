import Logo from "../../images/logo.png";
import "./professionalTopbar.css";
import { useNavigate } from "react-router-dom";
import propType from "prop-types";
import { IoIosNotifications } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { useState, useEffect, useRef } from "react";

import { useDispatch } from "react-redux";
import { logout } from "../../../features/userSlice";

import Notification from "./notification";

import { showLoader, hideLoader } from "../../../features/loaderSlice";

const ProfessionalTopbar = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ProfileClick, setProfileClick] = useState(false);
  const [notificationClick, setNotificationClick] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null); // Reference for the dropdown

  const handleHomeReload = () => {
    dispatch(showLoader());
    setTimeout(() => {
      localStorage.setItem("reload", "true");
      navigate("/professionalHome", { state: { reload: true } });
    }, 700);
  };

  const token = localStorage.getItem("token");
  let gender = "";
  let name = "";
  if (token) {
    try {
      const tokenParts = token.split(".");

      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        gender = payload.gender;
        name = payload.name;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const handle_profile_click = () => {
    if (ProfileClick === true) {
      setProfileClick(false);
    } else {
      setProfileClick(true);
    }
  };

  const handle_notification_click = () => {
    notificationClick
      ? setNotificationClick(false)
      : setNotificationClick(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        !event.target.closest(".notification")
      ) {
        setNotificationClick(false);
      }

      else if(
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !event.target.closest(".after_login_profile") 
      ) {
        setProfileClick(false);
      }
    };

    if (notificationClick) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    else if(ProfileClick){
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationClick, ProfileClick]);

  const handlelogout = async () => {
    dispatch(showLoader());
    localStorage.removeItem("token");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(logout());

    localStorage.setItem("reload", "true");
    navigate("/professionalHome", { state: { reload: true } });

    dispatch(hideLoader());
  };

  return (
    <>
      <div className="top_main">
        <div className="top_submain">
          <img
            className="logo"
            src={Logo}
            alt="Logo"
            onClick={handleHomeReload}
          />
          <nav className="top_nav">
            <ul className="inside_navigator">
              <li>Manage Bookings</li>
              <li>How it Works?</li>
            </ul>
            <div className="outside_navigator">
              <div className="notification" onClick={handle_notification_click}>
                <IoIosNotifications />
              </div>

              <div
                onClick={handle_profile_click}
                className="after_login_profile"
              >
                <div
                  className={
                    gender === "male"
                      ? "profile_picture_male"
                      : "profile_picture_female"
                  }
                ></div>
                <div className="display_username">
                  <p>{name}</p>
                  <IoMdArrowDropdown className="dropdown_icon" />
                </div>
                {ProfileClick && (
                  <div className="dropdown_profile" ref={profileDropdownRef}>
                    <ul className="drop_ul">
                      <li onClick={onProfileClick}>My Profile</li>
                      <li>Appointments</li>
                      <li>Change Password</li>
                      <li onClick={handlelogout}>Logout</li>
                    </ul>
                  </div>
                )}
                {notificationClick && <div className="dropdown_notification" ref={notificationDropdownRef}><Notification/></div>}
              </div>
              <p></p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

ProfessionalTopbar.propTypes = {
  onProfileClick: propType.func.isRequired,
};

export default ProfessionalTopbar;
