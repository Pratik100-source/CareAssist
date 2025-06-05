import Logo from "../../images/logo.png";
import "./topbar.css";
import { useNavigate } from "react-router-dom";
import propType from "prop-types";
import { IoIosNotifications } from "react-icons/io";
import { IoMdArrowDropdown, IoMdMenu, IoMdClose } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../../features/userSlice";
import { showLoader, hideLoader } from "../../../features/loaderSlice";
import { useSelector } from "react-redux";
import PatientNotification from "../notification/notification";
import NotificationBadge from "../notification/NotificationBadge";
import { useSocket } from "../../professionals/context/SocketContext";

const Topbar = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wasNotificationOpen, setWasNotificationOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true); // Change based on actual notifications
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileToggleRef = useRef(null);
  const notificationToggleRef = useRef(null);
  const { joinUserRoom, markAllAsRead } = useSocket();

  // Get user data from token
  const token = localStorage.getItem('accessToken');
  const user = useSelector((state) => state.user);
  const gender = user.gender;
  const name = user.firstname;

  const handleHomeReload = () => {
    localStorage.setItem("reload", "true");
    navigate("/", { state: { reload: true } });
  };

  const toggleProfile = (e) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleNotification = (e) => {
    e.stopPropagation();
    setIsNotificationOpen(!isNotificationOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    dispatch(showLoader());
    try {
      localStorage.removeItem('accessToken');
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch(logout());
      navigate("/", { state: { reload: true } });
    } finally {
      dispatch(hideLoader());
    }
  };

  // Initialize socket connection for notifications
  useEffect(() => {
    if (user && user.email) {
      joinUserRoom(user.email, 'patient');
    }
  }, [user, joinUserRoom]);
  
  // Track when notification panel is opened
  useEffect(() => {
    if (isNotificationOpen) {
      setWasNotificationOpen(true);
    }
  }, [isNotificationOpen]);
  
  // Handle marking notifications as read when the dropdown is closed
  useEffect(() => {
    // Only mark as read if the notification was previously open and is now closed
    if (wasNotificationOpen && !isNotificationOpen && user?.email) {
      const markNotificationsAsRead = async () => {
        try {
          await markAllAsRead(user.email);
          console.log('Marked all notifications as read on dropdown close');
          // Reset the tracking flag after successfully marking as read
          setWasNotificationOpen(false);
        } catch (error) {
          console.error('Error marking notifications as read:', error);
        }
      };
      
      // Add a small delay to ensure the dropdown is fully closed first
      const timeoutId = setTimeout(() => {
        markNotificationsAsRead();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isNotificationOpen, wasNotificationOpen, user?.email, markAllAsRead]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicking outside
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !profileToggleRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      
      // Close notification dropdown if clicking outside
      if (notificationRef.current && 
          !notificationRef.current.contains(event.target) &&
          !notificationToggleRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      
      // Close mobile menu if clicking outside
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest(".mobile-menu-toggle")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="patient-topbar-container">
        <img 
          className="logo" 
          src={Logo} 
          alt="CareAssist Logo" 
          onClick={handleHomeReload} 
        />
        
        <div className="right_topbar">
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <IoMdClose size={24} /> : <IoMdMenu size={24} />}
          </button>
          
          <nav 
            className={`topbar-nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`} 
            ref={mobileMenuRef}
            aria-hidden={!isMobileMenuOpen}
          >
            <ul className="nav-links">
              <li>
                <button onClick={() => handleNavigation("/showhomedoctors")}>
                  Home Appointment
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/showdoctors")}>
                  Video Counselling
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/patientHome#services")}>
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/patientHome#footer")}>
                  Contact Us
                </button>
              </li>
            </ul>
            
            <div className="user-controls">
              <div className="notification-dropdown">
                <button 
                  ref={notificationToggleRef}
                  className="notification-btn" 
                  onClick={toggleNotification}
                  aria-expanded={isNotificationOpen}
                  aria-label="Notifications"
                >
                  <IoIosNotifications />
                  <NotificationBadge />
                </button>
                
                {isNotificationOpen && (
                  <div className="notification-menu" ref={notificationRef}>
                    <PatientNotification isDropdown={true} />
                  </div>
                )}
              </div>
              
              <div className="profile-dropdown">
                <button 
                  ref={profileToggleRef}
                  className="profile-toggle" 
                  onClick={toggleProfile}
                  aria-expanded={isProfileOpen}
                  aria-label="User profile"
                >
                  <div className={`profile-picture ${gender === 'male' ? 'male' : 'female'}`}></div>
                  <span className="username">{name}</span>
                  <IoMdArrowDropdown className={`dropdown-icon ${isProfileOpen ? 'open' : ''}`} />
                </button>
                
                {isProfileOpen && (
                  <div className="dropdown-menu" ref={dropdownRef}>
                    <ul>
                      <li><button onClick={onProfileClick}>My Profile</button></li>
                      <li><button onClick={() => handleNavigation("/bookedAppointment")}>My Appointments</button></li>
                      <li><button onClick={() => handleNavigation("/changePassword")}>Change Password</button></li>
                      <li><button onClick={handleLogout}>Logout</button></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

Topbar.propTypes = {
  onProfileClick: propType.func.isRequired
};

export default Topbar;