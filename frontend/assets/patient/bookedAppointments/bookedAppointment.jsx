import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaCog, FaTimes } from "react-icons/fa";
import "./bookedAppointment.css"

const BookedAppointment = () => {
  const user = useSelector((state) => state.user); 
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:3003/api/booking/get-every-booking");
        if (!response.ok) {
          throw new Error("Failed to fetch booking data");
        }
        const data = await response.json();

        // Filter for bookings with status "PENDING"
        const pendingBookings = data.filter( booking=>booking.patientEmail===`${user.email}` && booking.status === "Pending");

       
        const formattedBookings = pendingBookings.map((booking, index) => {

          return {
            id: index + 1,
            urgency: booking.bookingType,
            appNo: booking.token,
            doctor: booking.professional|| "Unknown Doctor", 
            department: "General", 
            patient: booking.patient,
            apptDate: booking.date,
            appStart: booking.startTime,
            type: booking.meetLink ? "Telemedicine" : "In-Person",
            cost: "Free",
          };
        });

        setBookingHistory(formattedBookings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ongoing_booking_container">
      
      {bookingHistory.length === 0 ? (
        <p>No pending bookings found.</p>
      ) : (
        <div className="booking_cards_grid">
          {bookingHistory.map((booking) => (
            <div key={booking.id} className="booking_card">
              {/* Top Section */}
              <div className="top_section">
                <div className="urgency">{booking.urgency}</div>
                <div className="app_no">Token : {booking.appNo}</div>
              </div>

              {/* Middle Section */}
              <div className="middle_section">
                <div className="doctor">{booking.doctor}</div>
                <div className="department">{booking.department}</div>
                <div className="patient">Patient: {booking.patient}</div>
                <div className="appt_date">Appt. Date: {booking.apptDate}</div>
                <div className="bs_date">Appt. Time: {booking.appStart}</div>
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
      )}
    </div>
  );
};

export default BookedAppointment;