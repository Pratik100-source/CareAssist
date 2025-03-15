import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./assets/home/home";
import PatientHome from "./assets/patient/home/home";
import PatientProfile from "./assets/patient/Profile/profile";
import ProfessionalHome from "./assets/professionals/home/home";
import ProfessionalProfile from "./assets/professionals/profile/profile";
import Loader from "./assets/loader/loader";
import Admindashboard from "./assets/admin/admindashboard";
import ProtectedRoute from "./protectedRoute";
import ShowDoctors from "./assets/patient/OnlineConsultation/showdoctors";
import MakeAppointment from "./assets/patient/OnlineConsultation/makeAppointment";
import PaymentSuccess from "./assets/patient/OnlineConsultation/paymentSuccess";
import BookedAppointment from "./assets/patient/bookedAppointments/bookedAppointment";

/* Layouts */
import PatientLayout from "./assets/patient/patientLayout";

import { useSelector, useDispatch } from "react-redux";
import { NotAvailable } from "./features/professionalSlice";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const userType = user?.userType?.toLowerCase();

  const userDashboard = {
    professional: <ProfessionalHome />,
    patient: <PatientLayout><PatientHome /></PatientLayout>,
  };

  useEffect(() => {
    if (location.pathname !== "/bookAppointment" && location.pathname !== "/paymentSuccess") {
      dispatch(NotAvailable());
    }
  }, [location.pathname, dispatch]);

  return (
    <>
      <Loader />
      <ToastContainer />
      <Routes>
        <Route path="/" element={userType ? userDashboard[userType] : <Home />} />

        <Route element={<ProtectedRoute allowedRole="patient" />}>
          <Route path="/patientHome" element={<PatientLayout><PatientHome/></PatientLayout>} />
          <Route path="/patientProfile" element={<PatientLayout><PatientProfile/></PatientLayout>} />
          <Route path="/showdoctors" element={<PatientLayout><ShowDoctors/></PatientLayout>} />
          <Route path="/bookAppointment" element={<PatientLayout><MakeAppointment/></PatientLayout>} />
          <Route path="/paymentSuccess" element={<PatientLayout><PaymentSuccess/></PatientLayout>} />
          <Route path="/bookedAppointment" element={<PatientLayout><BookedAppointment/></PatientLayout>} />
        </Route>


        <Route element={<ProtectedRoute allowedRole="professional" />}>
          <Route path="/professionalHome" element={<ProfessionalHome />} />
          <Route path="/professionalProfile/*" element={<ProfessionalProfile />} />
        </Route>


        <Route path="/admindashboard/*" element={<Admindashboard />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
