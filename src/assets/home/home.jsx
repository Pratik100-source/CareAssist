import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Topbar from "../Topbar/topbar";
import "./home.css";
import Footer from "../footer/footer"
import Login from "../Login/login"
import Signup from "../Signup/signup"




const Home = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignupClicked, setIsSignupClicked] = useState(false);

  const handleLoginClick = () => {
    setIsLoginClicked(true);
    setIsSignupClicked(false);
  };

  const handleSignupClick = () => {
    setIsSignupClicked(true);
    setIsLoginClicked(false);
  };

  return (
    <>
    <div className="home_main">
      <div className="top_head">
        <Topbar
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
      </div>
      {isLoginClicked && <div className="login_show"><Login/></div>}
        {isSignupClicked && <div className="signup_show"><Signup/></div>}
      <div className="home_body" id="first_body"></div>
      <div className="second_body">How it works</div>
      <div className="third_body"></div>
      <div className="footer"><Footer/></div>
             
     

    </div>
    
    
    
    
    </>
  );
};

export default Home;
