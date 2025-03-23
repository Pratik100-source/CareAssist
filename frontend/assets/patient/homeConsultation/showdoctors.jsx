import React, { useEffect, useState } from "react";
import "./showdoctors.css";
import PatientTopbar from "../Topbar/topbar";
import { useNavigate } from "react-router-dom";
import { setProfessionalInfo, NotAvailable } from "../../../features/professionalSlice";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Doctors from "../../images/doctors.svg"


function ShowDoctors() {
  const [professionalData, setProfessionalsData] = useState([]);
  const [activeProfessionals, setActiveProfessionals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const patientEmail = user?.email || "guest@example.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const professionalResponse = await fetch("http://localhost:3003/api/display/getprofessional");
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
    const newSocket = io("http://localhost:3003");
    setSocket(newSocket);

    newSocket.emit("patientJoin", patientEmail);
    newSocket.emit("getActiveProfessionals"); // Initial request for active professionals

    newSocket.on("activeProfessionals", (activePros) => {
      setActiveProfessionals(activePros); // Update state whenever active professionals change
    });

    newSocket.on("bookingError", (data) => {
      setError(data.message);
      toast.error(data.message);
      setShowOverlay(false);
    });

    newSocket.on("bookingAccepted", () => {
      setShowOverlay(false);
      navigate("/patientProfile");
      toast.success("Booking accepted by professional!");
    });

    newSocket.on("bookingDeclined", (data) => {
      setShowOverlay(false);
      toast.error(data.message);
    });

    newSocket.on("bookingTimeout", (data) => {
      setShowOverlay(false);
      toast.error(data.message);
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [patientEmail, navigate]);

  const handle_send_booking_request = (professional) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = `Latitude: ${latitude}, Longitude: ${longitude}`;

        let currentSocket = socket;
        if (!currentSocket) {
          currentSocket = io("http://localhost:3003");
          currentSocket.emit("patientJoin", patientEmail);
          setSocket(currentSocket);
        }

        const messageData = {
          patientEmail,
          professionalEmail: professional.email,
          message: "I Booked you",
          location,
        };

        currentSocket.emit("bookingMessage", messageData);
        setShowOverlay(true);
        toast.success("Booking request sent successfully!");
      },
      (error) => {
        toast.error("Location permission denied");
      }
    );
  };

  // Filter professionals to show only active ones
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
                    onClick={() => handle_send_booking_request(professional)}
                  >
                    <p>Send Booking Request</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="not-available">
            <img src={Doctors} alt=""  className="show_not-available"/>
            <p>Sorry there are no doctors available currently</p>

          </div>
        )}
      </div>
    </div>
  );
}

export default ShowDoctors;