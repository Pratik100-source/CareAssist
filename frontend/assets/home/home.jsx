import { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import Topbar from "../Topbar/topbar";
import "./home.css";
import Footer from "../footer/footer"
import Login from "../Login/login"
import Signup from "../Signup/signup"
import Guide from "../Guide/guide"




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
      <div className="home_body" id="first_body"></div>
      <div className="second_body"><Guide/></div>
      <div className="third_body">FAQ section</div>
      <div className="footer"><Footer/></div>
             
     

    </div>
    
    
    
    
    </>
  );
};

export default Home;
