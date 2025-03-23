import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { NotAvailable } from "./features/professionalSlice";
import { ProfessionalSocketProvider, useSocket } from "./assets/professionals/context/SocketContext.jsx"; // Corrected import

/* Components */
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

/* Layouts */
import PatientLayout from "./assets/patient/patientLayout.jsx";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const userType = user?.userType?.toLowerCase();

  const userDashboard = {
    professional: <ProfessionalHome />,
    patient: (
      <PatientLayout>
        <PatientHome />
      </PatientLayout>
    ),
  };

  useEffect(() => {
    if (location.pathname !== "/bookAppointment" && location.pathname !== "/paymentSuccess") {
      dispatch(NotAvailable());
    }
  }, [location.pathname, dispatch]);

  const ProfessionalRoutesWithSocket = () => {
    const { joinAsProfessional } = useSocket();
    useEffect(() => {
      if (userType === "professional" && user?.email) {
        joinAsProfessional(user.email);
      }
    }, [joinAsProfessional]);

    return (
      <Routes>
        <Route element={<ProtectedRoute allowedRole="professional" />}>
          <Route path="/professionalHome" element={<ProfessionalHome />} />
          <Route path="/professionalProfile/*" element={<ProfessionalProfile />} />
          <Route path="/professionalnotification" element={<ProfessionalNotification />} />
        </Route>
      </Routes>
    );
  };

  return (
    <>
      <Loader />
      <ToastContainer />
      <Routes>
        <Route path="/" element={userType ? userDashboard[userType] : <Home />} />
        <Route element={<ProtectedRoute allowedRole="patient" />}>
          <Route path="/patientHome" element={<PatientLayout><PatientHome /></PatientLayout>} />
          <Route path="/patientProfile" element={<PatientLayout><PatientProfile /></PatientLayout>} />
          <Route path="/showdoctors" element={<PatientLayout><ShowDoctors /></PatientLayout>} />
          <Route path="/bookAppointment" element={<PatientLayout><MakeAppointment /></PatientLayout>} />
          <Route path="/paymentSuccess" element={<PatientLayout><PaymentSuccess /></PatientLayout>} />
          <Route path="/bookedAppointment" element={<PatientLayout><BookedAppointment /></PatientLayout>} />
          <Route path="/showhomedoctors" element={<PatientLayout><ShowHomeDoctors /></PatientLayout>} />
          <Route path="/patientnotification" element={<PatientLayout><PatientNotification /></PatientLayout>} />
        </Route>
        <Route
          path="/*"
          element={
            <ProfessionalSocketProvider>
              <ProfessionalRoutesWithSocket />
            </ProfessionalSocketProvider>
          }
        />
        <Route path="/admindashboard/*" element={<Admindashboard />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;