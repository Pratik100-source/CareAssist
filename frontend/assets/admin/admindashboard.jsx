import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import AdminRoutes from "./adminRoutes"; 
import "./admindashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const handlePatientClick = () => {
    navigate("/admindashboard/displayPatient");
  };

  const handleProfessionalClick = () => {
    navigate("/admindashboard/displayProfessional");
  };

  const handleVerificationClick = () => {
    navigate("/admindashboard/verifyProfessional");
  };

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
        </ul>
      </div>
      <div className="content">
        <Header />
        <AdminRoutes />
      </div>
    </div>
  );
}

export default AdminDashboard;