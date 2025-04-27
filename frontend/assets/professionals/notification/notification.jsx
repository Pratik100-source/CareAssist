import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";
import { FaTrash, FaCheck, FaCheckDouble } from 'react-icons/fa';
import "./notification.css";

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString || now); // Fallback to now if dateString is undefined
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

// Helper function to check if notification is from last 24 hours
const isNewNotification = (dateString) => {
  if (!dateString) return true; // Default to new if no date
  const now = new Date();
  const date = new Date(dateString);
  return (now - date) < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

function ProfessionalNotification({ isDropdown = false }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const professionalEmail = user?.email || "unknown@example.com";
  const { 
    notifications, 
    loading,
    joinAsProfessional, 
    joinUserRoom,
    acceptBooking, 
    declineBooking, 
    socket,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchNotifications
  } = useSocket();
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Join as professional and mark all as read when component mounts
  useEffect(() => {
    // Only join and mark as read on mount
    const join = async () => {
      try {
        console.log(`Professional ${professionalEmail} joining socket`);
        
        // First join as professional to establish the connection
    joinAsProfessional(professionalEmail);
        
        // Also join the user room for general notifications
        joinUserRoom(professionalEmail, 'professional');
        
        // Mark all as read when component mounts, but only in full page mode
        // (not in dropdown mode since this will be handled by the topbar component)
        if (!isDropdown) {
          console.log('Marking all notifications as read for professional (full page mode)');
          await markAllAsRead(professionalEmail);
        } else {
          console.log('Skipping auto-mark as read in dropdown mode (handled by topbar on close)');
        }
      } catch (error) {
        console.error('Error joining or marking notifications as read:', error);
      }
    };
    
    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to ensure it only runs once

  useEffect(() => {
    if (!socket) return;

    const handleBookingAccepted = (data) => {
      if (data.professionalEmail === professionalEmail && !isNavigating) {
        setIsNavigating(true);
        const targetPath = `/active-booking/${data.bookingId}`;
        navigate(targetPath, { replace: true });
        toast.success("Booking accepted, starting session!");
      }
    };

    socket.on("bookingAccepted", handleBookingAccepted);

    const fetchPendingBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:3003/api/booking/pending/${professionalEmail}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch pending bookings");
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingBookings();

    return () => {
      socket.off("bookingAccepted", handleBookingAccepted);
    };
  }, [professionalEmail, socket, navigate, isNavigating]);

  // Refresh notifications when needed
  useEffect(() => {
    const refreshNotifications = async () => {
      if (professionalEmail && socket && socket.connected) {
        try {
          await fetchNotifications(professionalEmail);
        } catch (error) {
          console.error('Error refreshing notifications:', error);
        }
      }
    };

    // Reload notifications when socket reconnects
    if (socket) {
      socket.on('connect', refreshNotifications);
      
      return () => {
        socket.off('connect', refreshNotifications);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, professionalEmail]);

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
    
    setIsLoading(true);
    let professionalLocation;
    
    try {
      professionalLocation = await requestLocationPermission(bookingId);
      const response = await fetch(`http://localhost:3003/api/booking/update-location/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalLocation }),
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to update professional location");
      acceptBooking(bookingId, professionalEmail);
      setTimeout(() => {
        navigate(`/active-booking/${bookingId}`)
      }, 1000);
   
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error(error.message || "Failed to proceed with booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = (bookingId) => {
    declineBooking(bookingId, professionalEmail);
    toast.info("Booking declined.");
  };

  // For the view all notifications link
  const handleViewAll = () => {
    navigate("/professionalnotification");
  };

  const handleNotificationClick = async (notificationId) => {
    if (!notificationId) return;
    
    // In dropdown mode, don't mark as read on click (will happen when dropdown closes)
    // Only mark as read on click in full page view
    if (isDropdown) {
      console.log(`Skipping mark as read for notification ${notificationId} in dropdown view`);
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await markAsRead(notificationId);
      if (success) {
        // No toast needed for simple mark as read - this happens frequently
        console.log(`Notification ${notificationId} marked as read`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mark all as read with proper feedback
  const handleMarkAllAsRead = async () => {
    if (!professionalEmail) return;
    
    setIsLoading(true);
    try {
      const success = await markAllAsRead(professionalEmail);
      if (success) {
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Prevent triggering the parent click
    
    if (!notificationId) return;
    
    setIsLoading(true);
    try {
      await deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllPrompt = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDeleteAll = async () => {
    if (!professionalEmail) return;
    
    setIsLoading(true);
    try {
      await deleteAllNotifications(professionalEmail);
      setShowConfirmDelete(false);
      toast.success('All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete all notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDeleteAll = () => {
    setShowConfirmDelete(false);
  };

  // Separate notifications by type and time
  const bookingRequests = notifications?.filter(n => 
    (n.type === "booking-request" || !n.type) && (n._id || n.id)
  ) || [];
  
  const regularNotifications = notifications?.filter(n => 
    n.type && n.type !== "booking-request" && n._id
  ) || [];
  
  // Group regular notifications into new and earlier
  const newNotifications = regularNotifications.filter(n => isNewNotification(n.createdAt)) || [];
  const earlierNotifications = regularNotifications.filter(n => !isNewNotification(n.createdAt)) || [];

  // For dropdown mode, also separate into unread and read categories
  let unreadNotifications = [];
  let readNotifications = [];
  
  if (isDropdown) {
    unreadNotifications = regularNotifications.filter(n => !n.isRead);
    readNotifications = regularNotifications.filter(n => n.isRead);
  }

  const containerClassName = isDropdown ? "notification-container dropdown-view" : "notification-container";

  if (loading || isLoading) {
    return (
      <div className={containerClassName}>
        <div className="notification-loading">
          <div className="notification-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className={containerClassName}>
        {isDropdown && (
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            <button className="view-all-btn" onClick={handleViewAll}>View All</button>
          </div>
        )}
        <div className="notification-empty">
          <p>No notifications at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {isDropdown ? (
        <div className="notification-dropdown-header">
          <h3>Notifications</h3>
          {unreadNotifications.length > 0 && (
            <span className="unread-count">{unreadNotifications.length} unread</span>
          )}
          <button className="view-all-btn" onClick={handleViewAll}>View All</button>
        </div>
      ) : (
        <div className="notification-header">
          <div className="notification-actions">
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              <FaCheckDouble /> Mark all as read
            </button>
            <button 
              className="delete-all-btn"
              onClick={handleDeleteAllPrompt}
              title="Delete all notifications"
            >
              <FaTrash /> Delete all
            </button>
          </div>
        </div>
      )}
      
      {showConfirmDelete && !isDropdown && (
        <div className="delete-confirm">
          <p>Are you sure you want to delete all notifications?</p>
          <div className="delete-confirm-actions">
            <button onClick={handleConfirmDeleteAll} className="confirm-btn">Yes, delete all</button>
            <button onClick={handleCancelDeleteAll} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
      
      {/* Booking Requests Section */}
      {bookingRequests.length > 0 && (
        <div className="notification-section">
          <h3 className="notification-section-title">Booking Requests</h3>
          <div className="notification-list">
            {bookingRequests.map((booking) => (
              <div key={booking._id || booking.id} className="notification-card">
                <div className="notification-content">
                  <div className="notification-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"/>
                    </svg>
                  </div>
                  <div className="notification-details">
                    <h3>{booking.title || "New Booking Request"}</h3>
                    <p className="notification-message">{booking.message}</p>
                    <div className="notification-footer">
                      <span className="notification-time">
                        {formatRelativeTime(booking.createdAt || booking.timestamp)}
                      </span>
                      <div className="notification-item-actions">
                        <button 
                          className="delete-btn"
                          onClick={(e) => handleDeleteNotification(e, booking._id || booking.id)}
                          title="Delete notification"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="notification-actions">
                  <button
                    onClick={() => handleAccept(booking._id || booking.id)}
                    className="accept-button"
                    disabled={isNavigating || !socket || isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleDecline(booking._id || booking.id)}
                    className="decline-button"
                    disabled={isLoading}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* New Notifications Section */}
      {!isDropdown && newNotifications.length > 0 && (
        <div className="notification-section">
          <h3 className="notification-section-title">New</h3>
          <div className="notification-list">
            {newNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification._id)}
              >
                <div className="notification-content">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                    <div className="notification-item-actions">
                      {!notification.isRead && (
                        <button 
                          className="mark-read-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification._id);
                          }}
                          title="Mark as read"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={(e) => handleDeleteNotification(e, notification._id)}
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Earlier Notifications Section */}
      {!isDropdown && earlierNotifications.length > 0 && (
        <div className="notification-section">
          <h3 className="notification-section-title">Earlier</h3>
          <div className="notification-list">
            {earlierNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification._id)}
              >
                <div className="notification-content">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                    <div className="notification-item-actions">
                      {!notification.isRead && (
                        <button 
                          className="mark-read-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification._id);
                          }}
                          title="Mark as read"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={(e) => handleDeleteNotification(e, notification._id)}
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Simplified Dropdown View */}
      {isDropdown && (
        <div className="notification-list">
          {/* Unread notifications first */}
          {unreadNotifications.length > 0 && (
            <div className="notification-section">
              <h4 className="notification-section-title">New</h4>
              {unreadNotifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className="notification-item unread"
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Read notifications after */}
          {readNotifications.length > 0 && (
            <div className="notification-section">
              <h4 className="notification-section-title">Earlier</h4>
              {readNotifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfessionalNotification;