import { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import Topbar from "../Topbar/topbar";
import "./home.css";
import Footer from "../../footer/footer"
import Login from "../../Login/login"
import Signup from "../../Signup/signup"
import Services from "../services/services"
import Video from "../../images/background_video.mp4"



const Home = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignupClicked, setIsSignupClicked] = useState(false);

  const location= useLocation();

  useEffect(() => {
  
    const shouldReload = localStorage.getItem("reload");
    if (shouldReload === "true") {
      localStorage.removeItem("reload"); 
      window.location.reload();
    } else {
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.state]);


  const handleLoginClick = () => {  
    navigate("/home", {state:{reload:true}});
    setIsLoginClicked(true);
    setIsSignupClicked(false);
    

  };

  const handleSignupClick = () => {
    navigate("/home",{state:{reload:true}});
    setIsSignupClicked(true);
    setIsLoginClicked(false);
  };

  const closeModal = () => {
    setIsLoginClicked(false);
    setIsSignupClicked(false);
  };

  return (
    <>

    {/* Overlay for Freezing the Page */}
    {(isLoginClicked || isSignupClicked) && (
        <div className="overlay" onClick={closeModal}></div>
      )}
    <div className="home_main">
      <div className="top_head">
        <Topbar
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
      </div>
      {isLoginClicked && <div className="login_show"><Login redirectToSignup = {handleSignupClick}/></div>}
        {isSignupClicked && <div className="signup_show"><Signup redirectToLogin = {handleLoginClick} /></div>}
        <div className="home_body" id="first_body">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="background-video"
          >
            <source src={Video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="home_body_content">
            <h1>Welcome to CareAssist</h1>
            <p>Bringing personalized healthcare to your doorstep.</p>
          </div>
        </div>
      <div className="second_body"><Services/></div>
      <div className="third_body">FAQ section</div>
      <div className="footer"><Footer/></div>
             
     

    </div>
    
    
    
    
    </>
  );
};

export default Home;
