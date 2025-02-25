import React from "react";
import { useSelector } from "react-redux";
import { FaCog, FaTimes } from "react-icons/fa"; // Import icons for settings and cross
import "./BHistory.css";

const BHistory = () => {
  const user = useSelector((state) => state.user); // Access the 'user' state slice

  // Dummy data for booking history
  const bookingHistory = [
    {
      id: 1,
      urgency: "URGENT",
      appNo: "426504002",
      doctor: "Dr. Saujan Putuwar",
      department: "Lab Department",
      patient: "Prafik Panihi",
      apptDate: "2024/11/30 AD 07:42 AM",
      bsDate: "2081/08/15 BS SATURDAY",
      type: "Telemedicine",
      cost: "Free",
    },
    {
      id: 2,
      urgency: "Normal",
      appNo: "426504003",
      doctor: "Dr. John Doe",
      department: "Cardiology",
      patient: "Jane Smith",
      apptDate: "2024/12/01 AD 10:00 AM",
      bsDate: "2081/08/16 BS SUNDAY",
      type: "In-Person",
      cost: "$50",
    },
    {
      id: 3,
      urgency: "URGENT",
      appNo: "426504004",
      doctor: "Dr. Jane Smith",
      department: "Pediatrics",
      patient: "John Doe",
      apptDate: "2024/12/02 AD 09:00 AM",
      bsDate: "2081/08/17 BS MONDAY",
      type: "Telemedicine",
      cost: "Free",
    },
    {
      id: 4,
      urgency: "Normal",
      appNo: "426504005",
      doctor: "Dr. Alice Johnson",
      department: "Dermatology",
      patient: "Bob Brown",
      apptDate: "2024/12/03 AD 11:00 AM",
      bsDate: "2081/08/18 BS TUESDAY",
      type: "In-Person",
      cost: "$75",
    },
  ];

  return (
    <div className="booking_history_container">
      <h2>Booking History</h2>
      <div className="booking_cards_grid">
        {bookingHistory.map((booking) => (
          <div key={booking.id} className="booking_card">
            {/* Top Section */}
            <div className="top_section">
              <div className="urgency">{booking.urgency}</div>
              <div className="app_no">App no: {booking.appNo}</div>
            </div>

            {/* Middle Section */}
            <div className="middle_section">
              <div className="doctor">{booking.doctor}</div>
              <div className="department">{booking.department}</div>
              <div className="patient">Patient: {booking.patient}</div>
              <div className="appt_date">Appt. Date: {booking.apptDate}</div>
              <div className="bs_date">BS Date: {booking.bsDate}</div>
              <div className="type">Type: {booking.type}</div>
            </div>

            {/* Bottom Section */}
            <div className="bottom_section">
              <div className="cost">Cost: {booking.cost}</div>
              <div className="settings_icon">
                <FaCog className="icon" />
                <FaTimes className="icon hover_icon" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BHistory;