import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import AdminRoutes from "./adminRoutes"; 
import "./admindashboard.css";
import { authService, api } from "../../services/authService";
import { toast } from "react-toastify";
import AdminNotificationBadge from "./AdminNotificationBadge";
import { IoIosNotifications } from "react-icons/io";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Verify authentication on component mount
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          toast.error("Authentication required. Please log in.");
          navigate("/");
          return;
        }

        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.userType?.toLowerCase() !== "admin") {
          toast.error("Admin privileges required to access this page.");
          navigate("/");
          return;
        }

        // Make a test request to verify the token works
        try {
          console.log("Testing admin authentication with a verification request...");
          // Use any endpoint that requires admin authentication
          await api.get("/display/getpatient");
          console.log("Admin authentication verified - token is valid");
        } catch (error) {
          console.error("Failed admin authentication test:", error);
          
          if (error.response?.status === 403 || error.response?.status === 401) {
            toast.error("Your session has expired. Please log in again.");
            authService.logout();
            navigate("/");
            return;
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (isLoading) {
    return <div>Verifying authentication...</div>;
  }

  const handlePatientClick = () => {
    navigate("/admindashboard/displayPatient");
  };

  const handleProfessionalClick = () => {
    navigate("/admindashboard/displayProfessional");
  };

  const handleVerificationClick = () => {
    navigate("/admindashboard/verifyProfessional");
  };
  const handlePaymentClick = ()=>{
    navigate("/admindashboard/managePayment");
    
  }
  const handleBookingClick = ()=>{
    navigate("/admindashboard/manageBooking");
    
  }

  const handleCancellationClick = ()=>{
    navigate("/admindashboard/manageCancellation");
  }
  const handlePasswordChangeClick = ()=>{
    navigate("/admindashboard/passwordChange");
  }
  const handleNotificationClick = ()=>{
    navigate("/admindashboard/notifications");
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
          <li onClick={handlePaymentClick}>Payments</li>
          <li onClick={handleBookingClick}>Bookings</li>
          <li onClick={handleCancellationClick}>Cancellation</li>
          <li onClick={handlePasswordChangeClick}>Password Change</li>
          <li onClick={handleNotificationClick} className="notification-menu-item">
            <div className="notification-content-icon">
              <IoIosNotifications className="notification-icon" />
              <span>Notifications</span>
            </div>
            <AdminNotificationBadge />
          </li>
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