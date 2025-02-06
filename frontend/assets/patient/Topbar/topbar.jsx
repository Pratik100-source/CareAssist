import Logo from "../../images/logo.png";
import "./topbar.css";
import { useNavigate } from "react-router-dom";
import { IoPersonOutline } from "react-icons/io5"



const Topbar = ({ onLoginClick, onSignupClick }) => {
  const navigate = useNavigate();

  const handleHomeReload = ()=>{
    localStorage.setItem("reload", "true");
    navigate("/patientHome", {state:{reload:true}});
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
            <section><p>Profile</p></section> 
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Topbar;
