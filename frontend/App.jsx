import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Home from "./assets/patient/home/home";
import Profile from "./assets/patient/Profile/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} /> {/* Redirect to signup by default */}
        <Route path="/home" element={<Home />} />
        <Route path = "/profile" element={<Profile/>}/>
        
        
      </Routes>
    </Router>
  );
}

export default App;
