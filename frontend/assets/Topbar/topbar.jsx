import Logo from "../images/logo.png";
import "./topbar.css";
import { useNavigate } from "react-router-dom";
import { IoPersonOutline } from "react-icons/io5";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import propType from "prop-types";
import { useState, useRef } from "react";

const Topbar = ({ onLoginClick, onSignupClick }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleHomeReload = () => {
    localStorage.setItem("reload", "true");
    navigate("/", { state: { reload: true } });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (action) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="common-topbar-container">
      <img 
        className="logo" 
        src={Logo} 
        alt="Logo" 
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
              <button onClick={() => handleNavigation(() => navigate("/"))}>
                Home Appointment
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation(() => navigate("/"))}>
                Video Counselling
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation(() => navigate("/#services"))}>
                Services
              </button>
            </li>
            <li>
              <button onClick={() => handleNavigation(() => navigate("/#footer"))}>
                Contact Us
              </button>
            </li>
          </ul>
          
          <div className="user-controls">
            <button 
              className="login-btn" 
              onClick={() => handleNavigation(onLoginClick)}
            >
              <IoPersonOutline />
              <span>Login</span>
            </button>
            <button 
              className="signup-btn" 
              onClick={() => handleNavigation(onSignupClick)}
            >
              Signup
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

Topbar.propTypes = {
  onLoginClick: propType.func.isRequired,
  onSignupClick: propType.func.isRequired,
};

export default Topbar;