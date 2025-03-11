import { Routes, Route } from "react-router-dom";
import PersonalInformation from "../assets/professionals/profile/PersonalInfo";
import BookingHistory from "../assets/professionals/profile/BHistory";

function ProfessionalProfileRoutes() {
  return (
    <Routes>
      <Route path="personalInformation" element={<PersonalInformation/>} />
      <Route path="bookingHistory" element={<BookingHistory />} />
   
      <Route path="*" element={<PersonalInformation />} />
    </Routes>
  );
}

export default ProfessionalProfileRoutes;
