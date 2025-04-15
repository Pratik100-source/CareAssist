import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { NotAvailable } from "./features/professionalSlice";
import { ProfessionalSocketProvider, PatientSocketProvider, useSocket } from "./assets/professionals/context/SocketContext.jsx";
import { Navigate } from "react-router-dom";


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
import PaymentSuccess from "./assets/patient/OnlineConsultation/paymentSuccess.jsx";
import BookedAppointment from "./assets/patient/bookedAppointments/bookedAppointment.jsx";
import ProfessionalNotification from "./assets/professionals/notification/notification.jsx";
import PatientNotification from "./assets/patient/notification/notification.jsx";
import ShowHomeDoctors from "./assets/patient/homeConsultation/showdoctors.jsx";
import ActiveBooking from "./assets/activeBooking/activeBooking.jsx";

/* Layouts */
import PatientLayout from "./assets/patient/patientLayout.jsx";
import ProfessionalLayout from "./assets/professionals/professionalLayout.jsx";

/*error pages*/
import PageNotAvailable from "./assets/error/404/error.jsx";



function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const userType = user?.userType?.toLowerCase();

  const userDashboard = {
    professional: <ProfessionalLayout><ProfessionalHome /></ProfessionalLayout>,
    patient: <PatientLayout><PatientHome /></PatientLayout>,
  };

  useEffect(() => {
    if (location.pathname !== "/bookAppointment" && location.pathname !== "/paymentSuccess") {
      dispatch(NotAvailable());
    }
  }, [location.pathname, dispatch]);

  const ProfessionalRoutesWithSocket = () => {
    const { joinAsProfessional } = useSocket();
    useEffect(() => {
      if (userType === "professional" && user?.email) joinAsProfessional(user.email);
    }, [joinAsProfessional]);
    return null;
  };

  const PatientRoutesWithSocket = () => {
    const { joinAsPatient } = useSocket();
    useEffect(() => {
      if (userType === "patient" && user?.email) joinAsPatient(user.email);
    }, [joinAsPatient]);
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
        <Route path="/paymentSuccess" element={<PatientLayout><PaymentSuccess /></PatientLayout>} />
        <Route path="/showhomedoctors" element={<PatientLayout><ShowHomeDoctors /></PatientLayout>} />
        <Route path="/patientnotification" element={<PatientLayout><PatientNotification /></PatientLayout>} />
      </Route>
      {/* Professional Routes */}
      <Route element={<ProtectedRoute allowedRole="professional" />}>
        <Route path="/professionalHome" element={<ProfessionalLayout><ProfessionalHome /></ProfessionalLayout>} />
        <Route path="/professionalProfile/*" element={<ProfessionalLayout><ProfessionalProfile /></ProfessionalLayout>} />
        <Route path="/professionalnotification" element={<ProfessionalLayout><ProfessionalNotification /></ProfessionalLayout>} />
      </Route>
      {/* Shared Route */}
      <Route
        path="/active-booking/:bookingId"
        element={
          userType === "patient" || userType === "professional" ? (
           (userType === "patient")?<PatientLayout><ActiveBooking /></PatientLayout> : <ProfessionalLayout><ActiveBooking /></ProfessionalLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
        
      />
       <Route
        path="/bookedAppointment"
        element={
          userType === "patient" || userType === "professional" ? (
           (userType === "patient")?<PatientLayout><BookedAppointment /></PatientLayout> : <ProfessionalLayout><BookedAppointment /></ProfessionalLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
        
      />
      
      <Route element={<ProtectedRoute allowedRole="admin" />}>
      <Route path="/admindashboard/*" element={<Admindashboard />} />
      </Route>

     
    
      <Route path="*" element={<PageNotAvailable></PageNotAvailable>} />
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
      ) : (
        renderRoutes()
      )}
    </>
  );
}

export default App;