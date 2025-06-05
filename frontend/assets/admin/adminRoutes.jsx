import { Routes, Route } from "react-router-dom";
import Displaypatient from "./displaypatient";
import Displayprofessional from "./displayprofessional";
import Verifyprofessional from "./verifyprofessional";
import ManagePayments from "./managePayment"
import ManageBooking from "./manageBooking"
import ManageCancellation from "./manageCancellation";
import PasswordChange from "../changePassword/changePassword";
import AdminNotification from "./adminNotification";

function AdminRoutes() {
  return (
    <Routes>
      <Route path="displayPatient" element={<Displaypatient />} />
      <Route path="displayProfessional" element={<Displayprofessional />} />
      <Route path="verifyProfessional" element={<Verifyprofessional />} />
      <Route path="managePayment" element={<ManagePayments />} />
      <Route path="manageBooking" element={<ManageBooking />} />
      <Route path="manageCancellation" element={<ManageCancellation/>} />
      <Route path="passwordChange" element={<PasswordChange/>} />
      <Route path="notifications" element={<AdminNotification/>} />
      <Route path="*" element={<Displaypatient />} />
    </Routes>
  );
}

export default AdminRoutes;
