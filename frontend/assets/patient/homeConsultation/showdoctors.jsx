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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket, sendBookingRequest } = useSocket();

  const user = useSelector((state) => state.user);
  const patientEmail = user?.email || "guest@example.com";

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
    });

    socket.on("bookingAccepted", (data) => {
      setShowOverlay(false);
      toast.success("Booking accepted by professional!");
      setTimeout(() => {
        navigate(`/active-booking/${data.bookingId}`);
      }, 3000);
    });

    socket.on("bookingDeclined", (data) => {
      setShowOverlay(false);
      toast.error(data.message);
    });

    socket.on("bookingTimeout", (data) => {
      setShowOverlay(false);
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
          patientEmail,
          professionalEmail: professional.email,
          message: "I Booked you",
          location: { patientLocation, professionalLocation: "" },
        };
  
        console.log("Sending booking request:", messageData); // Debug log
        sendBookingRequest(messageData);
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