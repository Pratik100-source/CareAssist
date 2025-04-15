import Logo from "../../images/logo.png";
import "./professionalTopbar.css";
import { useNavigate } from "react-router-dom";
import propType from "prop-types";
import { IoIosNotifications } from "react-icons/io";
import { IoMdArrowDropdown, IoMdMenu, IoMdClose } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../../features/userSlice";
import { showLoader, hideLoader } from "../../../features/loaderSlice";
import { useSelector } from "react-redux";
const ProfessionalTopbar = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileToggleRef = useRef(null);

  // Get user data from token
  const token = localStorage.getItem('token');

  const user = useSelector((state)=>(state.user));
  const gender = user.gender;
  const name = user.firstname;

  const handleHomeReload = () => {
    navigate("/professionalHome", { state: { reload: true } });
  };

  const toggleProfile = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    dispatch(showLoader());
    try {
      localStorage.removeItem('token');
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch(logout());
      navigate("/", { state: { reload: true } });
    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicking outside of it and not on the toggle button
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !profileToggleRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      
      // Close mobile menu if clicking outside of it and not on the menu toggle
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
        <div className="topbar-container">
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
                  <button onClick={() => handleNavigation("/bookedAppointment")}>
                    Manage Booking
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation("/how-it-works")}>
                    How it Works?
                  </button>
                </li>
              </ul>
              
              <div className="user-controls">
                <button className="notification-btn" aria-label="Notifications">
                  <IoIosNotifications />
                </button>
                
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
                        <li><button onClick={() => handleNavigation("/change-password")}>Change Password</button></li>
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

ProfessionalTopbar.propTypes = {
  onProfileClick: propType.func.isRequired
};

export default ProfessionalTopbar;