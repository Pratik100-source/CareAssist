import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Home from "./assets/home/home";
import PatientHome from "./assets/patient/home/home";
import PatientProfile from "./assets/patient/Profile/profile";
import ProfessionalHome from "./assets/professionals/home/home";
import ProfessionalProfile from "./assets/professionals/profile/profile";
import Loader from "./assets/loader/loader"
import Admindashboard from "./assets/admin/admindashboard";
import ProtectedRoute from "./protectedRoute";
import ShowDoctors from "./assets/patient/OnlineConsultation/showdoctors";
import MakeAppointment from "./assets/patient/OnlineConsultation/makeAppointment";
import PaymentSuccess from "./assets/patient/OnlineConsultation/paymentSuccess";
/*Layouts*/
import PatientLayout from "./assets/patient/patientLayout"

import { useSelector } from "react-redux";


function App() {
  const user = useSelector((state)=>state.user)
  const userType = user?.userType?.toLowerCase();
  const userDashboard = {
    professional:<ProfessionalHome />,
    patient:<PatientLayout> <PatientHome /></PatientLayout>,
  };
  return (
    <Router>
      <Loader></Loader>
      <Routes>
      <Route path="/" element={userType ? userDashboard[userType] : <Home />} />

        <Route element={<ProtectedRoute allowedRole="patient" />}>
        <Route path="/patientHome" element={<PatientLayout><PatientHome/></PatientLayout>} />
        <Route path = "/patientProfile" element={<PatientLayout><PatientProfile/></PatientLayout>}/>
        <Route path="/showdoctors" element={<PatientLayout><ShowDoctors/></PatientLayout>}/>
        <Route path="/bookAppointment" element={<PatientLayout><MakeAppointment/></PatientLayout>}/>
        <Route path="/paymentSuccess" element={<PatientLayout><PaymentSuccess/></PatientLayout>}/>

        </Route>

        <Route element={<ProtectedRoute allowedRole="professional" />}>
        <Route path="/professionalHome" element={<ProfessionalHome/>} />
        <Route path = "/professionalProfile" element={<ProfessionalProfile/>}/>
        </Route>

        <Route path = "/admindashboard/*" element={<Admindashboard/>}/>
        
        
      </Routes>
    </Router>
  );
}

export default App;
