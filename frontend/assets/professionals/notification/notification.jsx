import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProfessionalNotification() {
  const [bookings, setBookings] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const professionalEmail = user?.email || "unknown@example.com";

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        const response = await fetch(
          `http://localhost:3003/api/booking/pending/${professionalEmail}`
        );
        if (!response.ok) throw new Error("Failed to fetch pending bookings");
        const data = await response.json();
        setBookings(
          data.map((booking) => ({
            id: booking._id,
            message: `A booking has been made for ${booking.location} by ${booking.patientEmail}`,
          }))
        );
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchPendingBookings();

    const newSocket = io("http://localhost:3003");
    setSocket(newSocket);

    newSocket.emit("professionalJoin", professionalEmail);

    newSocket.on("receiveBooking", (data) => {
      setBookings((prevBookings) => [
        ...prevBookings,
        {
          id: data.bookingId,
          message: `A booking has been made for ${data.location} by ${data.patientEmail}`,
        },
      ]);
    });

    newSocket.on("navigateToProfile", ({ path }) => {
      navigate(path);
    });

    newSocket.on("bookingRemoved", (data) => {
      setBookings((prev) => prev.filter((b) => b.id !== data.bookingId));
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [professionalEmail, navigate]);

  const handleAccept = (bookingId) => {
    socket.emit("acceptBooking", { bookingId, professionalEmail });
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleDecline = (bookingId) => {
    socket.emit("declineBooking", { bookingId, professionalEmail });
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Professional Dashboard</h2>
      <p>Email: {professionalEmail}</p>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div
            key={booking.id}
            style={{ padding: "10px", backgroundColor: "#e0ffe0", marginBottom: "10px" }}
          >
            <strong>Notification:</strong> {booking.message}
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handleAccept(booking.id)}
                style={{ marginRight: "10px", backgroundColor: "#4CAF50", color: "white", padding: "5px 10px" }}
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(booking.id)}
                style={{ backgroundColor: "#f44336", color: "white", padding: "5px 10px" }}
              >
                Decline
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No booking requests yet</p>
      )}
    </div>
  );
}

export default ProfessionalNotification;