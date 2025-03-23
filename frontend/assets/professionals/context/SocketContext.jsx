import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const ProfessionalSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3003");
    setSocket(newSocket);

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

    newSocket.on("navigateToProfile", ({ path }) => {
      // Handle navigation if needed
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinAsProfessional = (professionalEmail) => {
    if (socket) {
      socket.emit("professionalJoin", professionalEmail);
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
      value={{
        socket,
        notifications,
        joinAsProfessional,
        acceptBooking,
        declineBooking,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
