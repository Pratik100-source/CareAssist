import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { NotAvailable } from "./features/professionalSlice";
import { ProfessionalSocketProvider, PatientSocketProvider, AdminSocketProvider, useSocket } from "./assets/professionals/context/SocketContext.jsx";
import { Navigate } from "react-router-dom";
import { authService } from "./services/authService";
import { toast } from 'react-toastify';

// Components
import Home from "./assets/home/home.jsx";
import PatientHome from "./assets/patient/home/home.jsx";
import PatientProfile from "./assets/patient/Profile/profile.jsx";
import ProfessionalHome from "./assets/professionals/home/home.jsx";
import ProfessionalProfile from "./assets/professionals/profile/profile.jsx";
import Loader from "./assets/loader/loader.jsx";
import Admindashboard from "./assets/admin/admindashboard.jsx";
import ProtectedRoute from "./protectedRoute.jsx";
import ShowDoctors from "./assets/patient/OnlineConsultation/showdoctors.jsx";
import MakeAppointment from "./assets/patient/OnlineConsultation/makeAppointment.jsx";
import OnlinePaymentSuccess from "./assets/patient/OnlineConsultation/paymentSuccess.jsx";
import BookedAppointment from "./assets/patient/bookedAppointments/bookedAppointment.jsx";
import ProfessionalNotification from "./assets/professionals/notification/notification.jsx";
import PatientNotification from "./assets/patient/notification/notification.jsx";
import ShowHomeDoctors from "./assets/patient/homeConsultation/showdoctors.jsx";
import ActiveBooking from "./assets/activeBooking/activeBooking.jsx";
import ChangePassword from "./assets/changePassword/changePassword.jsx";
import PageNotAvailable from "./assets/error/404/error.jsx";
import HomePaymentSuccess from "./assets/activeBooking/paymentSuccess.jsx";
import PayoutSuccess from "./assets/admin/payoutSuccess.jsx";

/* Layouts */
import PatientLayout from "./assets/patient/patientLayout.jsx";
import ProfessionalLayout from "./assets/professionals/professionalLayout.jsx";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const userType = user?.userType?.toLowerCase();

  const userDashboard = {
    professional: <ProfessionalLayout><ProfessionalHome /></ProfessionalLayout>,
    patient: <PatientLayout><PatientHome /></PatientLayout>,
    admin: <Admindashboard />
  };

  // Handle force logout from socket
  const handleForceLogout = (data) => {
    toast.error(data.message);
    authService.logout();
    navigate('/');
  };

  // Check token validity and setup socket listeners
  useEffect(() => {
    // Check token validity on app load
    if (authService.isAuthenticated() && !user.userType) {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        authService.logout();
      }
    }

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [user]);

  // Reset booking availability when navigating away from booking pages
  useEffect(() => {
    if (location.pathname !== "/bookAppointment" && location.pathname !== "/onlinePaymentSuccess") {
      dispatch(NotAvailable());
    }
  }, [location.pathname, dispatch]);

  // Socket-dependent components
  const ProfessionalRoutesWithSocket = () => {
    const { socket, joinAsProfessional } = useSocket();
    
    useEffect(() => {
      if (userType === "professional" && user?.email) {
        joinAsProfessional(user.email);
        
        // Setup force logout listener
        socket?.on('forceLogout', handleForceLogout);
      }

      return () => {
        socket?.off('forceLogout', handleForceLogout);
      };
    }, [userType, user?.email, socket, joinAsProfessional]);

    return null;
  };

  const PatientRoutesWithSocket = () => {
    const { socket, joinAsPatient } = useSocket();
    
    useEffect(() => {
      if (userType === "patient" && user?.email) {
        joinAsPatient(user.email);
        
        // Setup force logout listener
        socket?.on('forceLogout', handleForceLogout);
      }

      return () => {
        socket?.off('forceLogout', handleForceLogout);
      };
    }, [userType, user?.email, socket, joinAsPatient]);

    return null;
  };

  const AdminRoutesWithSocket = () => {
    const { socket, joinAsAdmin } = useSocket();
    
    useEffect(() => {
      if (userType === "admin" && user?.email) {
        joinAsAdmin(user.email);
        
        // Setup force logout listener
        socket?.on('forceLogout', handleForceLogout);
      }

      return () => {
        socket?.off('forceLogout', handleForceLogout);
      };
    }, [userType, user?.email, socket, joinAsAdmin]);

    return null;
  };

  const renderRoutes = () => (
    <Routes>
      <Route path="/" element={userType ? userDashboard[userType] : <Home />} />
      
      {/* Patient Routes */}
      <Route element={<ProtectedRoute allowedRole="patient" />}>
        <Route path="/patientHome" element={<PatientLayout><PatientHome /></PatientLayout>} />
        <Route path="/patientProfile/*" element={<PatientLayout><PatientProfile /></PatientLayout>} />
        <Route path="/showdoctors" element={<PatientLayout><ShowDoctors /></PatientLayout>} />
        <Route path="/bookAppointment" element={<PatientLayout><MakeAppointment /></PatientLayout>} />
        <Route path="/onlinePaymentSuccess" element={<PatientLayout><OnlinePaymentSuccess /></PatientLayout>} />
        <Route path="/homePaymentSuccess" element={<PatientLayout><HomePaymentSuccess /></PatientLayout>} />
        <Route path="/showhomedoctors" element={<PatientLayout><ShowHomeDoctors /></PatientLayout>} />
        <Route path="/patientnotification" element={<PatientLayout><PatientNotification /></PatientLayout>} />
      </Route>
      
      {/* Professional Routes */}
      <Route element={<ProtectedRoute allowedRole="professional" />}>
        <Route path="/professionalHome" element={<ProfessionalLayout><ProfessionalHome /></ProfessionalLayout>} />
        <Route path="/professionalProfile/*" element={<ProfessionalLayout><ProfessionalProfile /></ProfessionalLayout>} />
        <Route path="/professionalnotification" element={<ProfessionalLayout><ProfessionalNotification /></ProfessionalLayout>} />
      </Route>
    
      {/* Shared Routes */}
      <Route
        path="/active-booking/:bookingId"
        element={
          userType === "patient" ? (
            <PatientLayout><ActiveBooking /></PatientLayout>
          ) : userType === "professional" ? (
            <ProfessionalLayout><ActiveBooking /></ProfessionalLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      
      <Route
        path="/bookedAppointment"
        element={
          userType === "patient" ? (
            <PatientLayout><BookedAppointment /></PatientLayout>
          ) : userType === "professional" ? (
            <ProfessionalLayout><BookedAppointment /></ProfessionalLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      
      <Route
        path="/changePassword"
        element={
          userType === "patient" ? (
            <PatientLayout><ChangePassword /></PatientLayout>
          ) : userType === "professional" ? (
            <ProfessionalLayout><ChangePassword /></ProfessionalLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      
      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/admindashboard/*" element={<Admindashboard />} />
        <Route path="/payoutSuccess" element={<PayoutSuccess />} />
      </Route>
      
      {/* Fallback Route */}
      <Route path="*" element={<PageNotAvailable />} />
    </Routes>
  );

  return (
    <>
      <Loader />
      <ToastContainer />
      {userType === "patient" ? (
        <PatientSocketProvider>
          <PatientRoutesWithSocket />
          {renderRoutes()}
        </PatientSocketProvider>
      ) : userType === "professional" ? (
        <ProfessionalSocketProvider professionalEmail={user?.email}>
          <ProfessionalRoutesWithSocket />
          {renderRoutes()}
        </ProfessionalSocketProvider>
      ) : userType === "admin" ? (
        <AdminSocketProvider adminEmail={user?.email}>
          <AdminRoutesWithSocket />
          {renderRoutes()}
        </AdminSocketProvider>
      ) : (
        renderRoutes()
      )}
    </>
  );
}

export default App;