import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Professional Socket Provider
export const ProfessionalSocketProvider = ({ children, professionalEmail }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3003", { reconnection: true });
    setSocket(newSocket);
    console.log("Professional socket initialized:", newSocket.connected);

    newSocket.on("connect", () => {
      console.log("Professional reconnected:", newSocket.id);
      joinAsProfessional(professionalEmail);
    });

    newSocket.on("receiveBooking", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: data.bookingId,
          message: `A booking has been made for ${data.location} by ${data.patientEmail}`,
        },
      ]);
    });

    newSocket.on("bookingRemoved", (data) => {
      setNotifications((prev) => prev.filter((b) => b.id !== data.bookingId));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [professionalEmail]);

  const joinAsProfessional = (email) => {
    if (socket && !socket.connected) {
      socket.emit("professionalJoin", email);
      console.log("Joined as professional:", email);
    }
  };

  const acceptBooking = (bookingId, professionalEmail) => {
    if (socket) {
      socket.emit("acceptBooking", { bookingId, professionalEmail });
      setNotifications((prev) => prev.filter((b) => b.id !== bookingId));
    }
  };

  const declineBooking = (bookingId, professionalEmail) => {
    if (socket) {
      socket.emit("declineBooking", { bookingId, professionalEmail });
      setNotifications((prev) => prev.filter((b) => b.id !== bookingId));
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, notifications, joinAsProfessional, acceptBooking, declineBooking }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Patient Socket Provider
export const PatientSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3003");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinAsPatient = (patientEmail) => {
    if (socket) socket.emit("patientJoin", patientEmail);
  };

  const sendBookingRequest = (data) => {
    if (socket) socket.emit("bookingMessage", data);
  };

  return (
    <SocketContext.Provider
      value={{ socket, joinAsPatient, sendBookingRequest }}
    >
      {children}
    </SocketContext.Provider>
  );
};