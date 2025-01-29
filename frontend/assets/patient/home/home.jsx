import { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import Topbar from "../Topbar/topbar";
import "./home.css";
import Footer from "../../footer/footer"
import Login from "../../Login/login"
import Signup from "../../Signup/signup"
import Services from "../services/services"
import Queries from "../../queries/queries"




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
    console.log("Cross button clicked! Closing Signup Modal...");
    
  };

  const handlecross = () =>{
        
   
   
    setTimeout(() => {
      setIsSignupClicked(false);
    }, 400);

    setTimeout(() => {
      setIsLoginClicked(false);
    }, 400);
  }


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
      {isLoginClicked && <div className={isLoginClicked?"login_show":"login_hide"}><Login redirectToSignup = {handleSignupClick} /></div>}
        {isSignupClicked && <div className={isSignupClicked?"signup_show":"signup_hide"}><Signup redirectToLogin = {handleLoginClick} crossSignup = {handlecross} /></div>}
        <div className="home_body" id="first_body">
          <div className="home_body_content">
            <h1>Bringing Quality Healthcare <br />
              to Your Doorstep</h1>
              <p>Say goodbye to waiting rooms and long queues. With CareAssist, 
                hire trusted professionals who bring care to your home or connect with 
                you online when you need it most.</p>

                <button>Consult now</button>
          </div>
        </div>
      <div className="second_body"><Services/></div>
      <div className="third_body"><Queries/></div>
      <div className="footer"><Footer/></div>
             
     

    </div>
    
    
    
    
    </>
  );
};

export default Home;
