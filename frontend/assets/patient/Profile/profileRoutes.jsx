import { Routes, Route } from "react-router-dom";
import PersonalInformation from "./PersonalInfo";
import BookingHistory from "./BHistory";

function ProfileRoutes() {
  return (
    <Routes>
      <Route path="personalInformation" element={<PersonalInformation />} />
      <Route path="bookingHistory" element={<BookingHistory />} />
      <Route path="*" element={<PersonalInformation />} />
    </Routes>
  );
}

export default ProfileRoutes;
