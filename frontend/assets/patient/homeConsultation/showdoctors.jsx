import React, { useEffect, useState } from "react";
import "./showdoctors.css";
import PatientTopbar from "../Topbar/topbar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../professionals/context/SocketContext";
import Doctors from "../../images/doctors.svg";

function ShowDoctors() {
  const [professionalData, setProfessionalsData] = useState([]);
  const [activeProfessionals, setActiveProfessionals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showWarning, setShowWarning] = useState(false); // State to show the warning div
  const [pendingBooking, setPendingBooking] = useState(null); // Track the pending booking request
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket, sendBookingRequest } = useSocket();

  const user = useSelector((state) => state.user);
  const patientEmail = user?.email || "guest@example.com";
  const patient = (user?.firstname + " "+ user?.lastname) || "Hero pratik";

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

    socket.on("activeProfessionals", (activePros) => {
      setActiveProfessionals(activePros);
    });

    socket.on("bookingError", (data) => {
      setError(data.message);
      toast.error(data.message);
      setShowOverlay(false);
      setPendingBooking(null);
    });

    socket.on("bookingAccepted", (data) => {
      setShowOverlay(false);
      setPendingBooking(null);
      toast.success("Booking accepted by professional!");
      setTimeout(() => {
        navigate(`/active-booking/${data.bookingId}`);
      }, 3000);
    });

    socket.on("bookingDeclined", (data) => {
      setShowOverlay(false);
      setPendingBooking(null);
      toast.error(data.message);
    });

    socket.on("bookingTimeout", (data) => {
      setShowOverlay(false);
      setPendingBooking(null);
      toast.error(data.message);
    });

    return () => {
      socket.off("activeProfessionals");
      socket.off("bookingError");
      socket.off("bookingAccepted");
      socket.off("bookingDeclined");
      socket.off("bookingTimeout");
    };
  }, [socket, navigate]);

  // Handle the beforeunload event to warn the user
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (showOverlay) {
        // Show the custom warning div
        setShowWarning(true);
        // Prevent the default browser dialog (optional, depending on browser support)
        event.preventDefault();
        event.returnValue = "Your booking request will be canceled if you refresh the page. Are you sure?";
        return "Your booking request will be canceled if you refresh the page. Are you sure?";
      }
    };

    if (showOverlay) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showOverlay]);

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
        const professional_name = professional.name;
        const messageData = {
          patient,
          professional_name,
          patientEmail,
          professionalEmail: professional.email,
          message: "I Booked you",
          location: { patientLocation, professionalLocation: "" },
          charge: professional.charge,
        };

        console.log("Sending booking request:", messageData); // Debug log
        sendBookingRequest(messageData);
        setPendingBooking(messageData); // Store the pending booking request
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3>Waiting for the response of the professional...</h3>
            <p>Please wait</p>
          </div>
        </div>
      )}
      {showWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              maxWidth: "400px",
            }}
          >
            <h3>Warning: Booking Will Be Canceled</h3>
            <p>
              If you refresh the page or navigate away, your booking request will be canceled. Are you sure you want to proceed?
            </p>
            <div style={{ marginTop: "20px" }}>
              <button
                style={{
                  padding: "10px 20px",
                  marginRight: "10px",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  // User confirms they want to cancel the booking
                  setShowWarning(false);
                  setShowOverlay(false);
                  setPendingBooking(null);
                  // Emit an event to the server to cancel the booking
                  if (socket && pendingBooking) {
                    socket.emit("cancelBookingRequest", {
                      patientEmail: pendingBooking.patientEmail,
                      professionalEmail: pendingBooking.professionalEmail,
                      message: "Booking request canceled by patient due to page refresh.",
                    });
                  }
                  // Allow the refresh to proceed (remove the event listener temporarily)
                  window.location.reload();
                }}
              >
                Yes, Cancel Booking
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  // User decides to stay on the page
                  setShowWarning(false);
                }}
              >
                No, Stay on Page
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="home-doctor-container-submain" style={{ pointerEvents: showOverlay ? "none" : "auto" }}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : displayedProfessionals.length > 0 ? (
          displayedProfessionals.map((professional, index) => {
            if (!professional.availableDays || !professional.availability) return null;
            return (
              <div className="display_professional_card" key={index}>
                <div className="professional_left">
                  <div className="professional_image">
                    <img src={professional.photoUrl} alt={professional.name} />
                  </div>
                  <div className="professional_basic_info">
                    <h3>{professional.name}</h3>
                    <p>Experience: {professional.experience} years</p>
                    <p>Profession: {professional.profession}</p>
                    {professional.specialization && <p>Specialization: {professional.specialization}</p>}
                  </div>
                </div>
                <div className="professional_right">
                  <div className="charge">Charge: {professional.charge}</div>
                  <div
                    className="see_schedule_button"
                    onClick={() => handleSendBookingRequest(professional)}
                  >
                    <p>Send Booking Request</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="not-available">
            <img src={Doctors} alt="" className="show_not-available" />
            <p>Sorry there are no doctors available currently</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowDoctors;