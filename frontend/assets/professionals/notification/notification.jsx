import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./notification.css"; // New CSS file for styling

function ProfessionalNotification() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const professionalEmail = user?.email || "unknown@example.com";
  const { notifications, joinAsProfessional, acceptBooking, declineBooking, socket } = useSocket();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    joinAsProfessional(professionalEmail);
  }, [joinAsProfessional, professionalEmail]);

  useEffect(() => {
    if (!socket) return;

    const handleBookingAccepted = (data) => {
      if (data.professionalEmail === professionalEmail && !isNavigating) {
        setIsNavigating(true);
        const targetPath = `/active-booking/${data.bookingId}`;
        navigate(targetPath, { replace: true });
        toast.success("Booking accepted, starting session!");
      }
    };

    socket.on("bookingAccepted", handleBookingAccepted);

    const fetchPendingBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:3003/api/booking/pending/${professionalEmail}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch pending bookings");
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingBookings();

    return () => {
      socket.off("bookingAccepted", handleBookingAccepted);
    };
  }, [professionalEmail, socket, navigate, isNavigating]);

  const requestLocationPermission = (bookingId) =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const professionalLocation = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`;
          resolve(professionalLocation);
        },
        (error) => {
          console.error("Geolocation error:", error);
          reject(error);
        }
      );
    });

  const handleAccept = async (bookingId) => {
    if (isNavigating || !socket) return;
    
    setIsLoading(true);
    let professionalLocation;
    
    try {
      professionalLocation = await requestLocationPermission(bookingId);
      const response = await fetch(`http://localhost:3003/api/booking/update-location/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalLocation }),
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to update professional location");
      acceptBooking(bookingId, professionalEmail);
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error(error.message || "Failed to proceed with booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = (bookingId) => {
    declineBooking(bookingId, professionalEmail);
    toast.info("Booking declined.");
  };

  return (
    <div className="notification-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <header className="notification-header">
      </header>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((booking) => (
            <div key={booking.id} className="notification-card">
              <div className="notification-content">
                <div className="notification-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"/>
                  </svg>
                </div>
                <div className="notification-details">
                  <h3>New Booking Request</h3>
                  <p className="notification-message">{booking.message}</p>
                  <p className="notification-time">{new Date(booking.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="notification-actions">
                <button
                  onClick={() => handleAccept(booking.id)}
                  className="accept-button"
                  disabled={isNavigating || !socket || isLoading}
                >
                  {isLoading ? 'Processing...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleDecline(booking.id)}
                  className="decline-button"
                  disabled={isLoading}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" className="empty-icon">
            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>
          </svg>
          <h3>No booking requests yet</h3>
          <p>You'll see new booking requests here when they come in</p>
        </div>
      )}
    </div>
  );
}

export default ProfessionalNotification;