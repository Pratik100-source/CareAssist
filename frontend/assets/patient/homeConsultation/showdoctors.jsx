import React, { useEffect, useState } from "react";
import "./showdoctors.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../professionals/context/SocketContext";
import Doctors from "../../images/doctors.svg";

function ShowDoctors() {
  // State declarations
  const [professionalData, setProfessionalsData] = useState([]);
  const [activeProfessionals, setActiveProfessionals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket, sendBookingRequest } = useSocket();

  const user = useSelector((state) => state.user);
  const patientEmail = user?.email || "guest@example.com";
  const patient = (user?.firstname + " "+ user?.lastname) || "Guest User";

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (showOverlay) {
        // Cancel the event to show the confirmation dialog
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = 'Your booking request will be canceled if you leave this page. Are you sure?';
        
        // Show custom confirmation dialog
        const confirmLeave = window.confirm(
          'Your booking request will be canceled if you leave this page. Are you sure you want to leave?'
        );
        
        if (confirmLeave) {
          // User confirmed - cancel the booking
          if (socket && pendingBooking) {
            socket.emit("cancelBookingRequest", {
              patientEmail: pendingBooking.patientEmail,
              professionalEmail: pendingBooking.professionalEmail,
              message: "Booking canceled by patient due to page navigation",
            });
          }
          // Allow the page to unload
          return;
        } else {
          // User canceled - prevent page unload
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          if (e.stopPropagation) e.stopPropagation();
          e.returnValue = ''; // For Chrome
          return false;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showOverlay, pendingBooking, socket]);

  // Other useEffect hooks and functions remain the same...
  useEffect(() => {
    const fetchData = async () => {
      try {
        const professionalResponse = await fetch("http://localhost:3003/api/display/getprofessional", {
          credentials: "include",
        });
        if (!professionalResponse.ok) throw new Error("Failed to fetch professional data");
        const data = await professionalResponse.json();
        const filteredData = data.filter(
          (professional) =>
            (professional.consultationMethod === "home" || professional.consultationMethod === "both") &&
            professional.status === true
        );
        setProfessionalsData(filteredData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("getActiveProfessionals");

    const activeProsHandler = (activePros) => {
      setActiveProfessionals(activePros);
    };

    const bookingErrorHandler = (data) => {
      setError(data.message);
      toast.error(data.message);
      setShowOverlay(false);
      setPendingBooking(null);
    };

    const bookingAcceptedHandler = (data) => {
      setShowOverlay(false);
      setPendingBooking(null);
      toast.success("Booking accepted by professional!");
      setTimeout(() => {
        navigate(`/active-booking/${data.bookingId}`);
      }, 3000);
    };

    const bookingDeclinedHandler = (data) => {
      setShowOverlay(false);
      setPendingBooking(null);
      toast.error(data.message);
    };

    const bookingTimeoutHandler = (data) => {
      setShowOverlay(false);
      setPendingBooking(null);
      toast.error(data.message);
    };

    socket.on("activeProfessionals", activeProsHandler);
    socket.on("bookingError", bookingErrorHandler);
    socket.on("bookingAccepted", bookingAcceptedHandler);
    socket.on("bookingDeclined", bookingDeclinedHandler);
    socket.on("bookingTimeout", bookingTimeoutHandler);

    return () => {
      socket.off("activeProfessionals", activeProsHandler);
      socket.off("bookingError", bookingErrorHandler);
      socket.off("bookingAccepted", bookingAcceptedHandler);
      socket.off("bookingDeclined", bookingDeclinedHandler);
      socket.off("bookingTimeout", bookingTimeoutHandler);
    };
  }, [socket, navigate]);

  const handleSendBookingRequest = (professional) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    if (!socket) {
      toast.error("Socket connection not established yet");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const patientLocation = `Latitude: ${latitude}, Longitude: ${longitude}`;
        const messageData = {
          patient,
          professional_name: professional.name,
          patientEmail,
          professionalEmail: professional.email,
          message: "I Booked you",
          location: { patientLocation, professionalLocation: "" },
          charge: professional.charge,
        };

        sendBookingRequest(messageData);
        setPendingBooking(messageData);
        setShowOverlay(true);
        toast.success("Booking request sent successfully!");
      },
      (error) => {
        toast.error("Location permission denied");
      }
    );
  };

  const displayedProfessionals = professionalData.filter((professional) =>
    activeProfessionals.includes(professional.email)
  );

  return (
    <div className="home-doctor-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {showOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Waiting for professional response...</h3>
            <p>Please don't refresh or leave this page</p>
          </div>
        </div>
      )}
      
      <div className="home-doctor-container-submain">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : error ? (
          <div className="error-state">Error: {error}</div>
        ) : displayedProfessionals.length > 0 ? (
          displayedProfessionals.map((professional, index) => (
            <div className="display_professional_card" key={index}>
              <div className="professional_left">
                <div className="professional_image">
                  <img src={professional.photoUrl} alt={professional.name} />
                </div>
                <div className="professional_basic_info">
                  <h3>{professional.name}</h3>
                  <p>Experience: {professional.experience} years</p>
                  <p>Profession: {professional.profession}</p>
                  {professional.specialization && (
                    <p>Specialization: {professional.specialization}</p>
                  )}
                </div>
              </div>
              <div className="professional_right">
                <div className="charge">Rs. {professional.charge}</div>
                <button 
                  className="booking-button"
                  onClick={() => handleSendBookingRequest(professional)}
                >
                  Send Booking Request
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="not-available">
            <img 
              src={Doctors} 
              alt="No doctors available" 
              className="not-available-image" 
            />
            <p className="not-available-text">No doctors available currently</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowDoctors;