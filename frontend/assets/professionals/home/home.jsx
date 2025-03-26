import { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import "./home.css";
import Footer from "../../footer/footer"
import Login from "../../Login/login"
import Signup from "../../Signup/signup"
import Queries from "../../queries/queries"
import { useDispatch } from "react-redux";
import { showLoader} from "../../../features/loaderSlice"




const ProfessionalHome = () => {
  const navigate = useNavigate(); 
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignupClicked, setIsSignupClicked] = useState(false);

 
  const location= useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const reload_window = () => {
      const shouldReload = localStorage.getItem("reload");
      if (shouldReload === "true") {
       
        dispatch(showLoader());
        window.scrollTo({ top: 0, behavior: "auto" });
  
       
        setTimeout(() => {
          localStorage.removeItem("reload"); 
          window.location.reload();
        }, 500);
      } 
    };
  
    reload_window();
  }, [location.state]);


  const handleLoginClick = () => {  
    navigate("/", {state:{reload:true}});
    setIsLoginClicked(true);
    setIsSignupClicked(false);
    

  };

  const handleSignupClick = () => {
    navigate("/",{state:{reload:true}});
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

    {(isLoginClicked || isSignupClicked) && (
        <div className="overlay" onClick={closeModal}></div>
      )}
    <div className="home_main">
      {isLoginClicked && <div className={isLoginClicked?"login_show":"login_hide"}><Login redirectToSignup = {handleSignupClick} crossLogin = {handlecross} /></div>}
        {isSignupClicked && <div className={isSignupClicked?"signup_show":"signup_hide"}><Signup redirectToLogin = {handleLoginClick} crossSignup = {handlecross} /></div>}
        <div className="home_body" id="first_body">
          <div className="home_body_content">
            <h1>Bringing Quality Healthcare <br />
              to Your Doorstep</h1>
              <p>Say goodbye to waiting rooms and long queues. With CareAssist, 
                hire trusted professionals who bring care to your home or connect with 
                you online when you need it most.</p>

          </div>
        </div>
      <div className="third_body"><Queries/></div>
      <div className="footer"><Footer/></div>
             
     

    </div>
    
    
    
    
    </>
  );
};

export default ProfessionalHome;
