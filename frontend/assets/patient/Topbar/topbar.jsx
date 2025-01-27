import Logo from "../../images/logo.png";
import "./topbar.css";
import { useNavigate } from "react-router-dom";



const Topbar = ({ onLoginClick, onSignupClick }) => {
  const navigate = useNavigate();

  const handleHomeReload = ()=>{
    localStorage.setItem("reload", "true");
    navigate("/home", {state:{reload:true}});
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
          <ul className="outside_navigator">
            <li onClick={onLoginClick}>Login</li>
            <li onClick={onSignupClick}>Signup</li>
            <li>Profile</li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Topbar;
