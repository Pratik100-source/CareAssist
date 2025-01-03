import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Login from "./assets/Login/login";
import Signup from "./assets/Signup/signup";
import Home from "./assets/home/home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} /> {/* Redirect to signup by default */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        
        
      </Routes>
    </Router>
  );
}

export default App;
