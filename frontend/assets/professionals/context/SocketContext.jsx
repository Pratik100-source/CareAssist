import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Common notification functions that can be used by both providers
const createNotificationHelpers = (setNotifications, setLoading) => {
  // Fetch notifications from database
  const fetchNotifications = async (userEmail) => {
    try {
      // Set loading state if setLoading function is provided
      if (setLoading) {
        setLoading(true);
      }
      
      console.log(`Fetching notifications for ${userEmail} from API`);
      
      const response = await fetch(`http://localhost:3003/api/notification/${userEmail}`, {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} notifications from server`);
      setNotifications(data);
      return data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
      return [];
    } finally {
      // Reset loading state if setLoading function is provided
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Set loading state if setLoading function is provided
      if (setLoading) {
        setLoading(true);
      }
      
      console.log(`Marking notification ${notificationId} as read`);
      
      const response = await fetch(`http://localhost:3003/api/notification/read/${notificationId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => {
          if (n._id === notificationId || n.id === notificationId) {
            return {...n, isRead: true};
          }
          return n;
        })
      );
      
      console.log(`Successfully marked notification ${notificationId} as read`);
      return true;
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark notification as read");
      return false;
    } finally {
      // Reset loading state if setLoading function is provided
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (userEmail) => {
    try {
      // Set loading state if setLoading function is provided
      if (setLoading) {
        setLoading(true);
      }
      
      console.log(`Marking all notifications as read for ${userEmail}`);
      
      const response = await fetch(`http://localhost:3003/api/notification/mark-all-read/${userEmail}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Failed to mark all notifications as read: ${response.status}`);
      }
      
      // Update all notifications to read in local state
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      
      console.log(`Successfully marked all notifications as read for ${userEmail}`);
      return true;
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all notifications as read");
      return false;
    } finally {
      // Reset loading state if setLoading function is provided
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      // Set loading state if setLoading function is provided
      if (setLoading) {
        setLoading(true);
      }
      
      console.log(`Deleting notification ${notificationId}`);
      
      const response = await fetch(`http://localhost:3003/api/notification/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Failed to delete notification: ${response.status}`);
      }
      
      // Remove notification from local state
      setNotifications(prev => prev.filter(n => (n._id !== notificationId && n.id !== notificationId)));
      
      console.log(`Successfully deleted notification ${notificationId}`);
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
      return false;
    } finally {
      // Reset loading state if setLoading function is provided
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async (userEmail) => {
    try {
      // Set loading state if setLoading function is provided
      if (setLoading) {
        setLoading(true);
      }
      
      console.log(`Deleting all notifications for ${userEmail}`);
      
      const response = await fetch(`http://localhost:3003/api/notification/delete-all/${userEmail}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Failed to delete all notifications: ${response.status}`);
      }
      
      // Clear notifications in local state
      setNotifications([]);
      
      console.log(`Successfully deleted all notifications for ${userEmail}`);
      return true;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Failed to delete all notifications");
      return false;
    } finally {
      // Reset loading state if setLoading function is provided
      if (setLoading) {
        setLoading(false);
      }
    }
  };
  
  return {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};

// Professional Socket Provider
export const ProfessionalSocketProvider = ({ children, professionalEmail }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  
  // Create notification helpers
  const notificationHelpers = createNotificationHelpers(setNotifications, setLoading);
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = notificationHelpers;

  useEffect(() => {
    // Only create socket connection if it doesn't exist yet
    if (!socket) {
      console.log("Initializing professional socket");
      const newSocket = io("http://localhost:3003", { 
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      setSocket(newSocket);
      
      newSocket.on("connect", () => {
        console.log("Professional socket connected:", newSocket.id);
        setConnected(true);
        joinAsProfessional(professionalEmail);
      });

      newSocket.on("disconnect", () => {
        console.log("Professional socket disconnected - will attempt reconnection");
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log(`Professional socket reconnected after ${attemptNumber} attempts`);
        // Clear join tracking to allow rejoining
        window.joinedAsProfessional = new Set();
        window.joinedRooms = new Set();
        // Rejoin after reconnection
        joinAsProfessional(professionalEmail);
      });

      // Handle booking-specific notifications
      newSocket.on("receiveBooking", async (data) => {
        try {
          const locationString = data.location; // Example: "Latitude: 27.7235099, Longitude: 85.3110629"
          const [latPart, lonPart] = locationString.split(',');
          const latitude = parseFloat(latPart.split(':')[1].trim());
          const longitude = parseFloat(lonPart.split(':')[1].trim());
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const geoData = await response.json();
  
          let  locationName = geoData.display_name || "Unknown location";
           // Extract the first part of the location name (before the first comma)
          locationName = locationName.split(',')[0] + ',' + locationName.split(',')[1];
  
          // Now set notification with the location name
          setNotifications((prev) => [
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
           // Show toast notification
        toast.info(`New booking request from ${data.patientEmail}`);
        } catch (error) {
          console.error("Error in reverse geocoding:", error);
        }
        
      });

      newSocket.on("bookingRemoved", (data) => {
        setNotifications((prev) => prev.filter((n) => 
          n._id !== data.bookingId && n.id !== data.bookingId
        ));
      });
      
      // Handle general notifications - similar to patient provider
      newSocket.on("newNotification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast based on notification type
        switch (notification.type) {
          case "booking-confirmed":
            toast.success(notification.message);
            break;
          case "booking-cancelled":
            toast.warning(notification.message);
            break;
          case "booking-completed":
            toast.success(notification.message);
            break;
          case "appointment-reminder":
            toast.info(notification.message);
            break;
          default:
            toast.info(notification.message);
        }
      });

      return () => {
        console.log("Disconnecting professional socket");
        newSocket.disconnect();
        setConnected(false);
        
        // Clean up heartbeat on unmount
        if (window.professionalHeartbeat) {
          console.log("Cleaning up professional heartbeat on unmount");
          clearInterval(window.professionalHeartbeat);
          window.professionalHeartbeat = null;
        }
      };
    }
  }, []); // Only depends on professionalEmail

  const joinAsProfessional = (email) => {
    if (socket && email) {
      // Clear existing tracking to ensure we always attempt to join
      if (!window.joinedAsProfessional) {
        window.joinedAsProfessional = new Set();
      }
      
      // Even if already joined, send a heartbeat to ensure the server knows this professional is still active
      console.log(`Registering professional: ${email} as active`);
      
      // If socket is connected, emit immediately
      if (socket.connected) {
        socket.emit("professionalJoin", email);
        window.joinedAsProfessional.add(email);
        
        // Clear any existing heartbeat to prevent duplicate intervals
        if (window.professionalHeartbeat) {
          console.log("Clearing existing heartbeat interval");
          clearInterval(window.professionalHeartbeat);
          window.professionalHeartbeat = null;
        }
        
        // Setup periodic heartbeat to maintain active status
        if (!window.professionalHeartbeat) {
          console.log("Setting up new heartbeat interval");
          window.professionalHeartbeat = setInterval(() => {
            if (socket && socket.connected) {
              socket.emit("professionalJoin", email);
              console.log(`Professional heartbeat: ${email}`);
            } else {
              // If socket is disconnected, clear the interval
              console.log("Socket disconnected, clearing heartbeat");
              clearInterval(window.professionalHeartbeat);
              window.professionalHeartbeat = null;
            }
          }, 30000); // Send heartbeat every 30 seconds
        }
        
        // Also join user room for general notifications
        joinUserRoom(email, 'professional');
      } else {
        // If socket isn't connected yet, wait for connection
        console.log("Socket not connected, waiting for connection to register professional");
      }
    }
  };

  // Join user room for general notifications (similar to patient provider)
  const joinUserRoom = (userEmail, userType) => {
    if (socket && socket.connected && userEmail) {
      // Use a reference to track if already joined to prevent multiple emissions
      const roomKey = `${userType}-${userEmail}`;
      
      if (!window.joinedRooms) {
        window.joinedRooms = new Set();
      }
      
      if (!window.joinedRooms.has(roomKey)) {
        console.log(`Joining room as ${userType}: ${userEmail} (first time)`);
        socket.emit("joinUserRoom", { userEmail, userType });
        window.joinedRooms.add(roomKey);
        
        // After joining, fetch existing notifications
        if (setLoading) setLoading(true);
        fetchNotifications(userEmail)
          .then(() => {
            console.log(`Successfully fetched notifications for ${userEmail}`);
          })
          .catch(error => {
            console.error(`Error fetching notifications for ${userEmail}:`, error);
          })
          .finally(() => {
            if (setLoading) setLoading(false);
          });
      } else {
        console.log(`Already joined room as ${userType}: ${userEmail}`);
      }
    } else {
      console.log(`Socket not connected or email missing, unable to join user room`);
    }
  };

  const acceptBooking = (bookingId, professionalEmail) => {
    if (socket) {
      socket.emit("acceptBooking", { bookingId, professionalEmail });
      // Mark as read and update UI
      setNotifications((prev) => prev.filter((n) => 
        n._id !== bookingId && n.id !== bookingId
      ));
      
    }
  };

  const declineBooking = (bookingId, professionalEmail) => {
    if (socket) {
      socket.emit("declineBooking", { bookingId, professionalEmail });
      // Mark as read and update UI
      setNotifications((prev) => prev.filter((n) => 
        n._id !== bookingId && n.id !== bookingId
      ));
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
  
  // Create notification helpers
  const notificationHelpers = createNotificationHelpers(setNotifications, setLoading);
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = notificationHelpers;

  useEffect(() => {
    // Only create socket connection if it doesn't exist yet
    if (!socket) {
      console.log("Initializing patient socket");
      const newSocket = io("http://localhost:3003", { 
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      setSocket(newSocket);
      
      newSocket.on("connect", () => {
        console.log("Patient socket connected:", newSocket.id);
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Patient socket disconnected - will attempt reconnection");
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log(`Patient socket reconnected after ${attemptNumber} attempts`);
        // Clear join tracking to allow rejoining
        window.joinedRooms = new Set();
        window.joinedAsPatient = new Set();
      });

      // Listen for new notifications
      newSocket.on("newNotification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast based on notification type
        switch (notification.type) {
          case "booking-confirmed":
            toast.success(notification.message);
            break;
          case "booking-cancelled":
            toast.warning(notification.message);
            break;
          case "booking-completed":
            toast.success(notification.message);
            break;
          case "appointment-reminder":
            toast.info(notification.message);
            break;
          default:
            toast.info(notification.message);
        }
      });

      return () => {
        console.log("Disconnecting patient socket");
        newSocket.disconnect();
        setConnected(false);
      };
    }
  }, []); // Empty dependency array to ensure this runs only once

  const joinUserRoom = (userEmail, userType) => {
    if (socket && socket.connected && userEmail) {
      // Use a reference to track if already joined to prevent multiple emissions
      const roomKey = `${userType}-${userEmail}`;
      
      if (!window.joinedRooms) {
        window.joinedRooms = new Set();
      }
      
      if (!window.joinedRooms.has(roomKey)) {
        console.log(`Joining room as ${userType}: ${userEmail} (first time)`);
        socket.emit("joinUserRoom", { userEmail, userType });
        window.joinedRooms.add(roomKey);
        
        // After joining, fetch existing notifications
        fetchNotifications(userEmail);
      }
    }
  };

  // Join as patient (for backward compatibility)
  const joinAsPatient = (patientEmail) => {
    if (socket && socket.connected && patientEmail) {
      // Use a reference to track if already joined to prevent multiple emissions
      if (!window.joinedAsPatient) {
        window.joinedAsPatient = new Set();
      }
      
      if (!window.joinedAsPatient.has(patientEmail)) {
        console.log(`Joining as patient: ${patientEmail} (first time)`);
        socket.emit("patientJoin", patientEmail);
        window.joinedAsPatient.add(patientEmail);
        
        // Also join user room for notifications
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