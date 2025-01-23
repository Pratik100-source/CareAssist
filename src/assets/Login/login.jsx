import React, { useState } from "react";
import axios from "axios";
import photo from "../images/side_image.jpg"; 
import "./login.css";
import { useNavigate } from "react-router-dom";

const Login = ({redirectToSignup}) => {
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
      const response = await axios.post("http://localhost:3003/login", formData);


      if (response.status === 200) {
        navigate("/profile"); 
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

  return (
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
  );
};

export default Login;
