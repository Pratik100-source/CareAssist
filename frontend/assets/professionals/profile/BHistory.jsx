import React from "react";
import { useSelector } from "react-redux";
import { FaCog, FaTimes } from "react-icons/fa";
import "./BHistory.css";
import { useState, useEffect } from "react";
import NoBookingHistory from "../../error/notAvailable/noBookingHistory";
import { api } from "../../../services/authService";

const BHistory = () => {
  const user = useSelector((state) => state.user);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Completed"); // Default to showing completed bookings

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get(`/booking/get-every-booking`);
        const data = response.data;

        // Filter for bookings with status "completed" or "cancelled"
        const userBookings = data.filter(
          (booking) =>
            booking.professionalEmail === `${user.email}` &&
            (booking.status === "Completed" || booking.status === "Cancelled")
        );

        const formattedBookings = userBookings.map((booking, index) => {
          return {
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
            status: booking.status // Include status in the formatted data
          };
        });

        setBookingHistory(formattedBookings);
        // Initially filter for completed bookings
        setFilteredHistory(formattedBookings.filter(booking => booking.status === "Completed"));
      } catch (err) {
        setError(err.message || "Failed to fetch booking data");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    // Filter bookings whenever activeFilter changes
    if (activeFilter === "all") {
      setFilteredHistory(bookingHistory);
    } else {
      setFilteredHistory(bookingHistory.filter(booking => booking.status === activeFilter));
    }
  }, [activeFilter, bookingHistory]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="booking_history_container">
      <h2 className="section_header">Booking History</h2>
      
      {/* Toggle filter bar */}
      <div className="filter_toggle">
        <button
          className={`toggle_button ${activeFilter === "Completed" ? "active" : ""}`}
          onClick={() => setActiveFilter("Completed")}
        >
          Completed
        </button>
        <button
          className={`toggle_button ${activeFilter === "Cancelled" ? "active" : ""}`}
          onClick={() => setActiveFilter("Cancelled")}
        >
          Cancelled
        </button>
        <button
          className={`toggle_button ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All
        </button>
      </div>
      
      {filteredHistory.length === 0 ? (
        <div><NoBookingHistory message={`Sorry, there are no ${activeFilter} bookings`} /></div>
      ) : (
        <div className="booking_cards_grid">
          {filteredHistory.map((booking) => (
            <div key={booking.id} className="booking_card">
              <div className="top_section">
                <div className={`urgency ${booking.status === "Cancelled" ? "cancelled" : ""}`}>
                  {booking.urgency} {booking.status === "Cancelled" ? "(Cancelled)" : ""}
                </div>
                <div className="app_no">Token : {booking.appNo}</div>
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
                <div className="settings_icon"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BHistory;