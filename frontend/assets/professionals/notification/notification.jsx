import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProfessionalNotification() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const professionalEmail = user?.email || "unknown@example.com";
  const { notifications, joinAsProfessional, acceptBooking, declineBooking, socket } = useSocket();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    joinAsProfessional(professionalEmail);
  }, [joinAsProfessional, professionalEmail]);

  useEffect(() => {
    if (!socket) return;

    socket.on("bookingAccepted", (data) => {
      console.log("Booking accepted event:", data);
      if (data.professionalEmail === professionalEmail && !isNavigating) {
        setIsNavigating(true);
        const targetPath = `/active-booking/${data.bookingId}`;
        console.log("Attempting to navigate to:", targetPath);
        navigate(targetPath, { replace: true });
        console.log("Navigate function executed");
        setTimeout(() => {
          console.log("Current path after 500ms:", window.location.pathname);
          if (window.location.pathname !== targetPath) {
            console.log("Navigation failed, forcing redirect");
            window.location.href = targetPath;
          } else {
            console.log("Navigation succeeded");
          }
          setIsNavigating(false);
        }, 500);
        toast.success("Booking accepted, starting session!");
      }
    });

    const fetchPendingBookings = async () => {
      try {
        const response = await fetch(`http://localhost:3003/api/booking/pending/${professionalEmail}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch pending bookings");
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchPendingBookings();

    return () => socket.off("bookingAccepted");
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
    
      let professionalLocation;
      while (!professionalLocation) {
        try {
          professionalLocation = await requestLocationPermission(bookingId);
        } catch (error) {
          toast.error("Location is necessary to initiate the booking");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    
      try {
        const response = await fetch(`http://localhost:3003/api/booking/update-location/${bookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ professionalLocation }),
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to update professional location");
        console.log("Professional location updated:", professionalLocation);
    
        acceptBooking(bookingId, professionalEmail);
      } catch (error) {
        console.error("Error updating location:", error);
        toast.error("Failed to proceed with booking");
      }
    };

  const handleDecline = (bookingId) => {
    declineBooking(bookingId, professionalEmail);
    toast.info("Booking declined.");
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Professional Dashboard</h2>
      <p>Email: {professionalEmail}</p>
      {notifications.length > 0 ? (
        notifications.map((booking) => (
          <div key={booking.id} style={{ padding: "10px", backgroundColor: "#e0ffe0", marginBottom: "10px" }}>
            <strong>Notification:</strong> {booking.message}
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handleAccept(booking.id)}
                style={{ marginRight: "10px", backgroundColor: "#4CAF50", color: "white", padding: "5px 10px" }}
                disabled={isNavigating || !socket}
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