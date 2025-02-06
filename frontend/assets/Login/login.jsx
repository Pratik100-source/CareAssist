import React, { useState } from "react";
import axios from "axios";
import photo from "../images/side_image.jpg"; 
import "./login.css";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import PropTypes from "prop-types";

const Login = ({redirectToSignup, crossLogin}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(""); 

    try {
      const response = await axios.post("http://localhost:3003/api/auth/login", formData);
    

      if (response.status === 200) {

        const {userType} = response.data;
        console.log(userType)
        if(userType === 'Patient'){
          localStorage.setItem("reload", "true");
          navigate("/patientHome", {state:{reload:true}});
        }
        else if(userType === 'Professional'){
          navigate("/professionalHome");
        }
      }
    } catch (error) {
      
      if (error.response) {
        setError(error.response.data.message);  
      } else {
        setError("Network or server error. Please try again."); 
      }
    }
  };

   const click_signup = ()=>{
           
    redirectToSignup();
   }

   const cross_clicked = ()=>{
    if (crossLogin) {
      crossLogin();
    } else {
      console.error("crossLogin function is undefined!");
    }
  }

  return (

    <>
    <RxCross2 className="login_cross"  onClick={cross_clicked}/>
    <div className="login_main">
      <div className="login_form">
        <h1>Login to CareAssist</h1>
        <p>Don't have an account?<span onClick={click_signup}>Signup</span></p>
        {error && <p className="error_message">{error}</p>}  
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <button type="submit" onClick={handleLogin}>Login</button>
      </div>
      <div className="login_image">
        <img src={photo} alt="Login Visual" />
      </div>
    </div>
    </>
    
  );
};

Login.propTypes = {
  redirectToSignup: PropTypes.func.isRequired,
  crossLogin: PropTypes.func.isRequired
}
export default Login;
