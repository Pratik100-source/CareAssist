import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import PatientHome from "./assets/patient/home/home";
import PatientProfile from "./assets/patient/Profile/profile";
import ProfessionalHome from "./assets/professionals/home/home";
import ProfessionalProfile from "./assets/professionals/profile/profile";
import Loader from "./assets/loader/loader"
import Admindashboard from "./assets/admin/admindashboard";


function App() {
  return (
    <Router>
      <Loader></Loader>
      <Routes>
        <Route path="/" element={<Navigate to="/patientHome" />} />
        <Route path="/patientHome" element={<PatientHome/>} />
        <Route path = "/patientProfile" element={<PatientProfile/>}/>
        <Route path="/professionalHome" element={<ProfessionalHome/>} />
        <Route path = "/professionalProfile" element={<ProfessionalProfile/>}/>
        {/* <Route path="/admindashboard" element={<AdminDashboard></AdminDashboard>}></Route> */}

        <Route path = "/admindashboard/*" element={<Admindashboard/>}/>
        
        
      </Routes>
    </Router>
  );
}

export default App;
