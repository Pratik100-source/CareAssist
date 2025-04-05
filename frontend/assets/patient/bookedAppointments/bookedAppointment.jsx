import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaCog, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./bookedAppointment.css";
import NoBookingHistory from "../../error/notAvailable/noBookingHistory";
import ViewMore from "../../viewMore/viewMore"; // Import the ViewMore component

const BookedAppointment = () => {
  const user = useSelector((state) => state.user);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null); // State for overlay
  const navigate = useNavigate();

  const userType = user.userType.toLowerCase();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:3003/api/booking/get-every-booking");
        if (!response.ok) {
          throw new Error("Failed to fetch booking data");
        }
        const data = await response.json();

        const pendingBookings = data.filter(booking => 
          ((userType === "patient" ? booking.patientEmail : booking.professionalEmail) === user.email) && 
          (booking.status === "Pending" || booking.status === "ongoing")
        );

        const formattedBookings = pendingBookings.map((booking, index) => ({
          _id: booking._id, // Add _id for booking details fetch
          id: index + 1,
          urgency: booking.bookingType,
          appNo: booking.token,
          doctor: booking.professional || "Unknown Doctor",
          department: "General",
          patient: booking.patient,
          apptDate: booking.date,
          appStart: booking.startTime,
          type: booking.meetLink ? "Telemedicine" : "In-Person",
          cost: booking.charge,
          patientEmail: booking.patientEmail,
          professionalEmail: booking.professionalEmail,
        }));

        setBookingHistory(formattedBookings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user.email, userType]);

  const handleSettingsClick = (booking) => {
    if (booking.urgency === "Online") {
      setSelectedBooking(booking); // Open overlay for online bookings
    } else {
      navigate('/hero'); // Navigate to /hero for home bookings
    }
  };

  const closeOverlay = () => {
    setSelectedBooking(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="ongoing_booking_container">
      {bookingHistory.length === 0 ? (
        <div><NoBookingHistory message="Sorry no current appointments found" /></div>
      ) : (
        <div className="booking_cards_grid">
          {bookingHistory.map((booking) => (
            <div key={booking.id} className="booking_card">
              <div className="top_section">
                <div className="urgency">{booking.urgency}</div>
                <div className="app_no">Token: {booking.appNo}</div>
              </div>
              <div className="middle_section">
                <div className="doctor">{booking.doctor}</div>
                <div className="department">{booking.department}</div>
                <div className="patient">Patient: {booking.patient}</div>
                <div className="appt_date">Appt. Date: {booking.apptDate}</div>
                <div className="bs_date">Appt. Time: {booking.appStart}</div>
              </div>
              <div className="bottom_section">
                <div className="cost">Cost: {booking.cost}</div>
                <div className="settings_icon" onClick={() => handleSettingsClick(booking)}>
                  <FaCog className="icon" />
                  <FaTimes className="icon hover_icon" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedBooking && (
        <ViewMore booking={selectedBooking} onClose={closeOverlay} />
      )}
    </div>
  );
};

export default BookedAppointment;