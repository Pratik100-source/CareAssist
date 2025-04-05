import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../professionals/context/SocketContext";
import "./activeBooking.css";
import { Navigate } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import MalePhoto from "../images/male.jpg";
import FemalePhoto from "../images/female.jpg";

// Define custom icons for patient and professional
const patientIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const professionalIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const ActiveBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const userType = user?.userType?.toLowerCase();
  const userEmail = user?.email;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [booking, setBooking] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const [professionalLocation, setProfessionalLocation] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [professionalDetails, setProfessionalDetails] = useState(null);
  const { socket } = useSocket();

  // Function to format YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Function to format Unix timestamp to HH:mm
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Fetch chat messages when the component mounts
  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3003/api/chat/${bookingId}`, {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch chat messages");
        const data = await response.json();

        if (data && data.messages) {
          // Sort messages by timestamp
          const sortedMessages = data.messages
            .map((msg) => ({
              senderEmail: msg.senderEmail,
              receiverEmail: data.participants.find((p) => p !== msg.senderEmail),
              message: msg.message,
              timestamp: msg.timestamp,
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setMessages(sortedMessages);
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        toast.error("Failed to load chat messages");
      }
    };

    if (bookingId) {
      fetchChatMessages();
    }
  }, [bookingId]);

  // Prevent window reload by showing a confirmation dialog
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (newMessage.trim()) {
        event.preventDefault();
        event.returnValue = "You have an unsaved message. Are you sure you want to leave?";
        return "You have an unsaved message. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [newMessage]);

  useEffect(() => {
    if (!userType || !userEmail) {
      console.log("ActiveBooking - missing user data, redirecting to /");
      navigate("/", { replace: true });
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(
          `http://localhost:3003/api/booking/${bookingId}`,
          {
            // credentials: "include",
          }
        );
        if (response.status===404){throw new Error(`Failed to fetch booking: ${response.status}`);}
        else if(response.status===403){throw new Error("The booking is already completed")};
          
        const data = await response.json();
        console.log("Booking data:", data);
        setBooking(data);
        setPatientLocation(parseLocation(data.location.patientLocation));
        setProfessionalLocation(parseLocation(data.location.professionalLocation));
      } catch (error) {
        console.error("Error loading booking details:", error.message);
        setFetchError(error.message);
        toast.error("Error loading booking details");
      }
    };
    fetchBooking();

    if (!socket) {
      console.log("Socket not ready yet, skipping socket setup");
      return;
    }

    console.log("Socket ready, setting up events");
    socket.emit(
      userType === "patient" ? "patientJoin" : "professionalJoin",
      userEmail
    );
    socket.emit("joinChat", { bookingId, userEmail });

    socket.on("chatMessage", (data) => {
      setMessages((prev) => {
        const updatedMessages = [...prev, data];
        // Sort messages by timestamp
        return updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    socket.on("showPayment", () => {
      if (userType === "patient") setShowPayment(true);
    });

    socket.on("bookingCompleted", () => {
      toast.success("Booking completed!");
      navigate("/bookedAppointment", { replace: true });
    });

    return () => {
      if (socket) {
        socket.off("chatMessage");
        socket.off("showPayment");
        socket.off("bookingCompleted");
      }
    };
  }, [bookingId, userType, userEmail, socket, navigate]);

  useEffect(() => {
    if (!booking) return;

    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/api/display/getpatientInfo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: booking.patientEmail }),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch patient details");
        const data = await response.json();
        setPatientDetails(data.result);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        toast.error("Failed to load patient details");
      }
    };

    const fetchProfessionalDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/api/display/getprofessionalInfo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: booking.professionalEmail }),
          }
        );
        if (!response.ok)
          throw new Error("Failed to fetch professional details");
        const data = await response.json();
        setProfessionalDetails(data.result);
      } catch (error) {
        console.error("Error fetching professional details:", error);
        toast.error("Failed to load professional details");
      }
    };

    fetchPatientDetails();
    fetchProfessionalDetails();
  }, [booking]);

  const parseLocation = (locationString) => {
    const match =
      locationString?.match(/Latitude: ([\d.-]+), Longitude: ([\d.-]+)/) || [];
    return match.length ? [parseFloat(match[1]), parseFloat(match[2])] : [0, 0];
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    const messageData = {
      bookingId,
      senderEmail: userEmail,
      receiverEmail:
        booking?.[userType === "patient" ? "professionalEmail" : "patientEmail"],
      message: newMessage,
    };
    socket.emit("chatMessage", messageData);
    setNewMessage("");
  };

  const finishBooking = () => {
    if (socket) {
      socket.emit("finishBooking", { bookingId });
    } else {
      toast.error("Socket not connected, cannot finish booking");
    }
  };

  const handlePayment = (method) => {
    if (!socket) {
      toast.error("Socket not connected, cannot process payment");
      return;
    }
    if (method === "cash") {
      socket.emit("paymentCompleted", { bookingId, paymentMethod: "cash" });
    } else if (method === "online") {
      initiateOnlinePayment();
    }
  };

  const initiateOnlinePayment = async () => {
    try {
      const response = await fetch(
        "http://localhost:3003/api/payment/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 1000,
            purchase_order_id: bookingId,
            purchase_order_name: "Booking Payment",
            customer_info: { email: userEmail },
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to initiate payment");
      const data = await response.json();
      window.location.href = data.payment_url;
    } catch (error) {
      toast.error("Failed to initiate online payment");
    }
  };

  if (!userType || (userType !== "patient" && userType !== "professional")) {
    console.log("ActiveBooking - invalid userType, redirecting to /");
    return <Navigate to="/" replace />;
  }

  if (fetchError)
    return (
      <div>Error loading booking: {fetchError}. Please try again later.</div>
    );
  if (!booking) return <div>Loading booking details...</div>;

  const mapCenter = patientLocation || professionalLocation || [0, 0];

  return (
    <div className="active-booking">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="split-container">
        <div className="info-section">
          <div className="professional-card">
            <img
              src={
                professionalDetails?.document?.photoUrl ||
                "https://via.placeholder.com/50"
              }
              alt="Professional"
              className="professional-photo"
            />
            <div className="professional-details">
              <h2>
                {userType === "patient"
                  ? professionalDetails
                    ? `Dr. ${professionalDetails.firstname} ${professionalDetails.lastname}`
                    : "Loading..."
                  : patientDetails
                  ? `${patientDetails.firstname} ${patientDetails.lastname}`
                  : "Loading..."}
              </h2>
              <p className="specialization">
                {userType === "patient" && professionalDetails
                  ? `${
                      professionalDetails.specialization || "N/A"
                    }, Experience: ${
                      professionalDetails.experience || "N/A"
                    } years`
                  : ""}
              </p>
            </div>
          </div>
          <div className="booking-details">
            <div className="detail-item">
              <h3>Date</h3>
              <p>{booking.date ? formatDate(booking.date) : "2025/01/29"}</p>
            </div>
            <div className="detail-item">
              <h3>Consultation Time</h3>
              <p>{booking.startTime || "19:00"}</p>
            </div>
            <div className="detail-item">
              <h3>Consultation Fee</h3>
              <p>Rs. {professionalDetails?.charge || "750"}</p>
            </div>
            <div className="detail-item">
              <h3>Token No</h3>
              <p>{bookingId.slice(-6) || "123456"}</p>
            </div>
          </div>
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {patientLocation && (
                <Marker position={patientLocation} icon={patientIcon}>
                  <Popup>Patient Location</Popup>
                </Marker>
              )}
              {professionalLocation && (
                <Marker position={professionalLocation} icon={professionalIcon}>
                  <Popup>Professional Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
        <div className="map-chat-section">
          <div className="chat-container">
            <div className="chat-header">
              <img
                src={
                  userType === "patient"
                    ? professionalDetails?.document?.photoUrl ||
                      "https://via.placeholder.com/30"
                    : patientDetails?.gender === "male"
                    ? MalePhoto
                    : FemalePhoto
                }
                alt={userType === "professional" ? "Professional" : "Patient"}
                className="chat-photo"
              />
              <h3>
                {userType === "patient"
                  ? professionalDetails
                    ? `Dr. ${professionalDetails.firstname} ${professionalDetails.lastname}`
                    : "Loading..."
                  : patientDetails
                  ? `${patientDetails.firstname} ${patientDetails.lastname}`
                  : "Loading..."}
              </h3>
            </div>
            <div className="messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.senderEmail === userEmail ? "sent" : "received"}
                >
                  <p>{msg.message}</p>
                  <span className="message-timestamp">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="type your message"
              />
              <IoSend
                onClick={sendMessage}
                disabled={!socket}
                className="send_button"
              />
            </div>
          </div>

          {userType === "professional" && booking.status === "ongoing" && (
            <button
              onClick={finishBooking}
              disabled={!socket}
              className="finish-button"
            >
              Finish Booking
            </button>
          )}
          {userType === "patient" && showPayment && (
            <div className="payment-options">
              <h3>Pay for Booking</h3>
              <button onClick={() => handlePayment("cash")} disabled={!socket}>
                Pay with Cash
              </button>
              <button
                onClick={() => handlePayment("online")}
                disabled={!socket}
              >
                Pay Online
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveBooking;