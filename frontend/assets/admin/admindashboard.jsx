import React from 'react';
import Header from './header';
import Displaypatient from './displaypatient';
import Displayprofessional from "./displayprofessional";
import Verifyprofessional from './verifyprofessional';
import './admindashboard.css';
import { useState } from 'react';

function App() {
   
    const [patientClick, setpatientClick]= useState(true);
    const [professionalClick, setprofessionalClick] = useState(false);
    const [verificationClick, setverificationClick] = useState(false);
    const handlePatientClick = ()=>{
        
        setprofessionalClick(false);
        setverificationClick(false);
        (patientClick)?setpatientClick(false):setpatientClick(true);
        console.log(patientClick);
    }
    const handleProfessionalClick = ()=>{
        
        setpatientClick(false);
        setverificationClick(false);
        (professionalClick)?setprofessionalClick(false):setprofessionalClick(true)
    }
    const handleVerificationClick = ()=>{
        
        setpatientClick(false);
        setprofessionalClick(false);
        (verificationClick)?setverificationClick(false):setverificationClick(true)
    }
  return (
    <div className="main_admin_dashboard">
      <div className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
      </div>
      <ul className="sidebar-menu">
        <li onClick={handlePatientClick}>Patients</li>
        <li onClick={handleProfessionalClick}>Professionals</li>
        <li onClick={handleVerificationClick}>Verification</li>
        <li></li>
      </ul>
    </div>
      <div className="content">
        <Header />
        {(patientClick) && <Displaypatient/>}
        {(professionalClick && <Displayprofessional/>)}
        {(verificationClick && <Verifyprofessional/>)}
      </div>
    </div>
  );
}

export default App;