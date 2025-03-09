import Logo from "../images/logo.png";
import "./topbar.css";
import { useNavigate } from "react-router-dom";
import { IoPersonOutline } from "react-icons/io5"
import propType from "prop-types";


const Topbar = ({ onLoginClick, onSignupClick}) => {
  const navigate = useNavigate();

  const handleHomeReload = ()=>{
    localStorage.setItem("reload", "true");
    navigate("/", {state:{reload:true}});
  }
  
  return (
    <div className="top_main">
      <div className="top_submain">
        <img className="logo" src={Logo} alt="Logo" onClick={handleHomeReload} />
        <nav className="top_nav">
          <ul className="inside_navigator">
            <li>Find Professionals</li>
            <li>Video Counselling</li>
            <li>How it Works?</li>
          </ul>
          <div className="outside_navigator">
            <section onClick={onLoginClick} className="login_interface"><icon><IoPersonOutline/></icon><p>Login</p></section>
            <section onClick={onSignupClick} className="signup_interface">Signup</section>
            <section onClick={onLoginClick}><p>Profile</p></section> 
          </div>
        </nav>
      </div>
    </div>
  );
};

Topbar.propTypes = {
  onLoginClick: propType.func.isRequired,
  onSignupClick: propType.func.isRequired,
}

export default Topbar;
