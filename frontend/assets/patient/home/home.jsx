import { useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import "./home.css";
import Footer from "../../footer/footer"
import Services from "../services/services"
import Queries from "../../queries/queries"
import { useDispatch } from "react-redux";
import { showLoader} from "../../../features/loaderSlice"




const PatientHome = () => {

  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate();
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

      if (location.hash) {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
  
    reload_window();
  }, [location]);



  return (
    <>

    <div className="patient_home_main">
    

        <div className="patient_home_body" id="first_body">
          <div className="patient_home_body_content">
            <h1>Bringing Quality Healthcare <br />
              to Your Doorstep</h1>
              <p>Say goodbye to waiting rooms and long queues. With CareAssist, 
                hire trusted professionals who bring care to your home or connect with 
                you online when you need it most.</p>

                <button className="consult-now-button" onClick={()=>{navigate("/showdoctors")}}>Consult now</button>
          </div>
        </div>
      <div className="patient_second_body" id="services"><Services/></div>
      <div className="patient_third_body"><Queries/></div>
      <div className="patient_footer" id="footer"><Footer/></div>
      </div>
    </>
  );
};

export default PatientHome;
