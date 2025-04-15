import { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import "./home.css";
import Footer from "../../footer/footer"
import Services from "../../patient/services/services"
import Queries from "../../queries/queries"
import { useDispatch } from "react-redux";
import { showLoader} from "../../../features/loaderSlice"




const ProfessionalHome = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
     
    const handleTokenStorageChange = ()=>{
      setToken(localStorage.getItem('token'))
    }

    window.addEventListener("storage", handleTokenStorageChange)

    return(()=>{window.removeEventListener("storage", handleTokenStorageChange)});
  }, []);


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



  return (
    <>

    <div className="professional_home_main">
    

        <div className="professional_home_body" id="first_body">
          <div className="professional_home_body_content">
            <h1>Bringing Quality Healthcare <br />
              to Your Doorstep</h1>
              <p>Say goodbye to waiting rooms and long queues. With CareAssist, 
                hire trusted professionals who bring care to your home or connect with 
                you online when you need it most.</p>

                <button>Manage Booking</button>
          </div>
        </div>
      <div className="professional_second_body"><Services/></div>
      <div className="professional_third_body"><Queries/></div>
      <div className="professional_footer"><Footer/></div>
      </div>
    </>
  );
};

export default ProfessionalHome;
