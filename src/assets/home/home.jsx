import { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import Topbar from "../Topbar/topbar";
import "./home.css";
import Footer from "../footer/footer"
import Login from "../Login/login"
import Signup from "../Signup/signup"




const Home = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignupClicked, setIsSignupClicked] = useState(false);

  const location= useLocation();

  useEffect(() => {
    
    if(location.state?.reload){

    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.state]);


  const handleLoginClick = () => {
    // window.location.reload()
    navigate("/home", {state:{reload:true}});
    setIsLoginClicked(true);
    setIsSignupClicked(false);
    

  };

  const handleSignupClick = () => {
    
    navigate("/home",{state:{reload:true}});
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
      {isLoginClicked && <div className="login_show"><Login redirectToSignup = {handleSignupClick}/></div>}
        {isSignupClicked && <div className="signup_show"><Signup redirectToLogin = {handleLoginClick} /></div>}
      <div className="home_body" id="first_body"></div>
      <div className="second_body">How it works</div>
      <div className="third_body"></div>
      <div className="footer"><Footer/></div>
             
     

    </div>
    
    
    
    
    </>
  );
};

export default Home;
