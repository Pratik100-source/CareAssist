import { Routes, Route } from "react-router-dom";
import Displaypatient from "./displaypatient";
import Displayprofessional from "./displayprofessional";
import Verifyprofessional from "./verifyprofessional";
import ManagePayments from "./managePayment"

function AdminRoutes() {
  return (
    <Routes>
      <Route path="displayPatient" element={<Displaypatient />} />
      <Route path="displayProfessional" element={<Displayprofessional />} />
      <Route path="verifyProfessional" element={<Verifyprofessional />} />
      <Route path="managePayment" element={<ManagePayments />} />
   
      <Route path="*" element={<Displaypatient />} />
    </Routes>
  );
}

export default AdminRoutes;
