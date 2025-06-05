import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../../../services/authService";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Common notification functions for all providers
const createNotificationHelpers = (setNotifications, setLoading) => {
  const fetchNotifications = useCallback(async (userEmail) => {
    try {
      setLoading?.(true);
      console.log('Fetching notifications for:', userEmail);
      const response = await api.get(`/notification/${userEmail}`);
      setNotifications(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
      return [];
    } finally {
      setLoading?.(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      setLoading?.(true);
      console.log('Marking notification as read:', notificationId);
      await api.put(`/notification/read/${notificationId}`);
      setNotifications(prev => 
        prev.map(n => (n._id === notificationId || n.id === notificationId) ? 
          {...n, isRead: true} : n)
      );
      return true;
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark notification as read");
      return false;
    } finally {
      setLoading?.(false);
    }
  }, []);

  const markAllAsRead = useCallback(async (userEmail) => {
    try {
      setLoading?.(true);
      console.log('Marking all as read for:', userEmail);
      await api.put(`/notification/mark-all-read/${userEmail}`);
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      return true;
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all notifications as read");
      return false;
    } finally {
      setLoading?.(false);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      setLoading?.(true);
      console.log('Deleting notification:', notificationId);
      await api.delete(`/notification/${notificationId}`);
      setNotifications(prev => prev.filter(n => (n._id !== notificationId && n.id !== notificationId)));
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
      return false;
    } finally {
      setLoading?.(false);
    }
  }, []);

  const deleteAllNotifications = useCallback(async (userEmail) => {
    try {
      setLoading?.(true);
      console.log('Deleting all notifications for:', userEmail);
      await api.delete(`/notification/delete-all/${userEmail}`);
      setNotifications([]);
      return true;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Failed to delete all notifications");
      return false;
    } finally {
      setLoading?.(false);
    }
  }, []);
  
  return {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};

// Admin Socket Provider
export const AdminSocketProvider = ({ children, adminEmail }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketInitialized = useRef(false);
  const lastFetchTimestamp = useRef(0);
  const fetchDebounceTimeout = useRef(null);

  const notificationHelpers = createNotificationHelpers(setNotifications, setLoading);
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = notificationHelpers;

  const debouncedFetch = useCallback((email) => {
    const now = Date.now();
    if (now - lastFetchTimestamp.current < 5000) {
      return;
    }
    
    if (fetchDebounceTimeout.current) {
      clearTimeout(fetchDebounceTimeout.current);
    }

    fetchDebounceTimeout.current = setTimeout(async () => {
      try {
        lastFetchTimestamp.current = Date.now();
        await fetchNotifications(email);
      } catch (error) {
        console.error('Debounced fetch failed:', error);
      }
    }, 1000);
  }, [fetchNotifications]);

  // Initialize notifications and socket connection
  useEffect(() => {
    if (!adminEmail || socketInitialized.current) return;

    const initialize = async () => {
      try {
        socketInitialized.current = true;
        await fetchNotifications(adminEmail);
      } catch (error) {
        console.error('Initialization failed:', error);
        socketInitialized.current = false;
      }
    };

    initialize();

    return () => {
      socketInitialized.current = false;
      if (fetchDebounceTimeout.current) {
        clearTimeout(fetchDebounceTimeout.current);
      }
    };
  }, [adminEmail, fetchNotifications]);

  // Socket connection management
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || socket || !adminEmail) return;

    let isActive = true;
    
    const newSocket = io("http://localhost:3003", {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket']
    });

    newSocket.on("connect", () => {
      if (!isActive) return;
      console.log("Admin socket connected");
      setIsConnected(true);
      if (adminEmail) {
        newSocket.emit("adminJoin", adminEmail);
      }
    });

    newSocket.on("disconnect", () => {
      if (!isActive) return;
      console.log("Admin socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("newNotification", (notification) => {
      if (!isActive) return;
      setNotifications(prev => [notification, ...prev]);
      toast.info(notification.message);
    });

    newSocket.on("reconnect", () => {
      if (!isActive) return;
      console.log("Admin socket reconnected");
      if (adminEmail) {
        newSocket.emit("adminJoin", adminEmail);
      }
    });

    setSocket(newSocket);

    return () => {
      isActive = false;
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      if (fetchDebounceTimeout.current) {
        clearTimeout(fetchDebounceTimeout.current);
      }
    };
  }, [adminEmail]);

  const joinAsAdmin = useCallback((email) => {
    if (!socket?.connected || !email) return;
    socket.emit("adminJoin", email);
    debouncedFetch(email);
  }, [socket, debouncedFetch]);

  const joinUserRoom = useCallback(async (userEmail, userType) => {
    if (!socket?.connected || !userEmail) return;
    
    const roomKey = `${userType}-${userEmail}`;
    if (!window.joinedRooms) window.joinedRooms = new Set();
    
    if (!window.joinedRooms.has(roomKey)) {
      socket.emit("joinUserRoom", { userEmail, userType });
      window.joinedRooms.add(roomKey);
      debouncedFetch(userEmail);
    }
  }, [socket, debouncedFetch]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        loading,
        joinAsAdmin,
        joinUserRoom,
        fetchNotifications: debouncedFetch,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Professional Socket Provider
export const ProfessionalSocketProvider = ({ children, professionalEmail }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  
  const notificationHelpers = createNotificationHelpers(setNotifications, setLoading);
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = notificationHelpers;

  useEffect(() => {
    if (!socket) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const newSocket = io("http://localhost:3003", { 
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token: accessToken }
      });
      
      setSocket(newSocket);
      
      newSocket.on("connect", () => {
        setConnected(true);
        joinAsProfessional(professionalEmail);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken) newSocket.auth = { token: currentToken };
        joinAsProfessional(professionalEmail);
      });

      newSocket.on("receiveBooking", async (data) => {
        try {
          const [latPart, lonPart] = data.location.split(',');
          const latitude = parseFloat(latPart.split(':')[1].trim());
          const longitude = parseFloat(lonPart.split(':')[1].trim());
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const geoData = await response.json();
          let locationName = geoData.display_name || "Unknown location";
          locationName = locationName.split(',')[0] + ',' + locationName.split(',')[1];

          setNotifications(prev => [
            ...prev,
            {
              _id: data.bookingId,
              id: data.bookingId,
              type: "booking-request",
              title: "New Booking Request",
              message: `A booking has been made for ${locationName} by ${data.patientEmail}`,
              createdAt: new Date().toISOString(),
              isRead: false
            },
          ]);
          toast.info(`New booking request from ${data.patientEmail}`);
        } catch (error) {
          console.error("Error in reverse geocoding:", error);
        }
      });

      newSocket.on("bookingRemoved", (data) => {
        setNotifications(prev => prev.filter(n => n._id !== data.bookingId && n.id !== data.bookingId));
      });
      
      newSocket.on("newNotification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(notification.message);
      });

      return () => {
        newSocket.disconnect();
        if (window.professionalHeartbeat) {
          clearInterval(window.professionalHeartbeat);
          window.professionalHeartbeat = null;
        }
      };
    }
  }, [professionalEmail]);

  const joinAsProfessional = (email) => {
    if (socket && email) {
      if (!window.joinedAsProfessional) window.joinedAsProfessional = new Set();
      
      if (socket.connected) {
        socket.emit("professionalJoin", email);
        window.joinedAsProfessional.add(email);
        
        if (window.professionalHeartbeat) {
          clearInterval(window.professionalHeartbeat);
        }
        
        window.professionalHeartbeat = setInterval(() => {
          if (socket?.connected) {
            socket.emit("professionalJoin", email);
          } else {
            clearInterval(window.professionalHeartbeat);
            window.professionalHeartbeat = null;
          }
        }, 30000);
        
        joinUserRoom(email, 'professional');
      }
    }
  };

  const joinUserRoom = (userEmail, userType) => {
    if (socket?.connected && userEmail) {
      const roomKey = `${userType}-${userEmail}`;
      if (!window.joinedRooms) window.joinedRooms = new Set();
      
      if (!window.joinedRooms.has(roomKey)) {
        socket.emit("joinUserRoom", { userEmail, userType });
        window.joinedRooms.add(roomKey);
        fetchNotifications(userEmail);
      }
    }
  };

  const acceptBooking = (bookingId, professionalEmail) => {
    if (socket) {
      socket.emit("acceptBooking", { bookingId, professionalEmail });
      setNotifications(prev => prev.filter(n => n._id !== bookingId && n.id !== bookingId));
    }
  };

  const declineBooking = (bookingId, professionalEmail) => {
    if (socket) {
      socket.emit("declineBooking", { bookingId, professionalEmail });
      setNotifications(prev => prev.filter(n => n._id !== bookingId && n.id !== bookingId));
    }
  };

  return (
    <SocketContext.Provider
      value={{ 
        socket, 
        notifications, 
        loading,
        joinAsProfessional,
        joinUserRoom,  
        acceptBooking, 
        declineBooking,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Patient Socket Provider
export const PatientSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  
  const notificationHelpers = createNotificationHelpers(setNotifications, setLoading);
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = notificationHelpers;

  useEffect(() => {
    if (!socket) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const newSocket = io("http://localhost:3003", { 
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token: accessToken }
      });
      
      setSocket(newSocket);
      
      newSocket.on("connect", () => {
        setConnected(true);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken) newSocket.auth = { token: currentToken };
      });

      newSocket.on("newNotification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(notification.message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);
  
  const joinUserRoom = (userEmail, userType) => {
    if (socket?.connected && userEmail) {
      const roomKey = `${userType}-${userEmail}`;
      if (!window.joinedRooms) window.joinedRooms = new Set();
      
      if (!window.joinedRooms.has(roomKey)) {
        socket.emit("joinUserRoom", { userEmail, userType });
        window.joinedRooms.add(roomKey);
        fetchNotifications(userEmail);
      }
    }
  };

  const joinAsPatient = (patientEmail) => {
    if (socket?.connected && patientEmail) {
      if (!window.joinedAsPatient) window.joinedAsPatient = new Set();
      
      if (!window.joinedAsPatient.has(patientEmail)) {
        socket.emit("patientJoin", patientEmail);
        window.joinedAsPatient.add(patientEmail);
        joinUserRoom(patientEmail, "patient");
      }
    }
  };

  const sendBookingRequest = (data) => {
    if (socket) socket.emit("bookingMessage", data);
  };

  return (
    <SocketContext.Provider
      value={{ 
        socket, 
        notifications,
        loading,
        joinUserRoom,
        joinAsPatient,
        sendBookingRequest,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};