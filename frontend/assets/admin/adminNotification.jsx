import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../professionals/context/SocketContext';
import { FaTrash } from 'react-icons/fa';
import "../patient/notification/notification.css";

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
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
  const now = new Date();
  const date = new Date(dateString);
  return (now - date) < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

const AdminNotification = () => {
  const user = useSelector((state) => state.user);
  const { 
    notifications, 
    loading, 
    joinUserRoom,
    fetchNotifications, 
    markAllAsRead,
    deleteNotification, 
    deleteAllNotifications 
  } = useSocket();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setupComplete = useRef(false);
  const refreshInterval = useRef(null);
  const initialLoadDone = useRef(false);
  const markAllReadComplete = useRef(false);

  // Memoized setup function
  const setupNotifications = useCallback(async () => {
    try {
      if (!user?.email || setupComplete.current) return;

      console.log(`Admin ${user.email} setting up notifications`);
      await joinUserRoom(user.email, 'admin');
      await fetchNotifications(user.email);
      
      // Mark all as read when component mounts
      if (!markAllReadComplete.current) {
        await markAllAsRead(user.email);
        markAllReadComplete.current = true;
      }
      
      setupComplete.current = true;
      initialLoadDone.current = true;
    } catch (error) {
      console.error('Error setting up notifications:', error);
      setupComplete.current = false;
      markAllReadComplete.current = false;
    }
  }, [user?.email, joinUserRoom, fetchNotifications, markAllAsRead]);

  // Initial setup and periodic refresh
  useEffect(() => {
    setupNotifications();

    if (user?.email && initialLoadDone.current) {
      refreshInterval.current = setInterval(() => {
        fetchNotifications(user.email);
      }, 30000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      setupComplete.current = false;
      initialLoadDone.current = false;
      markAllReadComplete.current = false;
    };
  }, [setupNotifications, user?.email, fetchNotifications]);

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    if (!notificationId) return;
    setIsLoading(true);
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllPrompt = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDeleteAll = async () => {
    if (!user || !user.email) return;
    setIsLoading(true);
    try {
      await deleteAllNotifications(user.email);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDeleteAll = () => {
    setShowConfirmDelete(false);
  };

  // Group notifications into new and earlier
  const newNotifications = notifications?.filter(n => isNewNotification(n.createdAt)) || [];
  const earlierNotifications = notifications?.filter(n => !isNewNotification(n.createdAt)) || [];

  if (loading || isLoading) {
    return (
      <div className="notification-container">
        <div className="notification-loading">
          <div className="notification-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-container">
      <div className="notification-header">
        <div className="notification-actions">
          <button className="delete-all-btn" onClick={handleDeleteAllPrompt}>
            <FaTrash /> Delete all
          </button>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="delete-confirm">
          <p>Are you sure you want to delete all notifications?</p>
          <div className="delete-confirm-actions">
            <button className="cancel-btn" onClick={handleCancelDeleteAll}>Cancel</button>
            <button className="confirm-btn" onClick={handleConfirmDeleteAll}>Delete All</button>
          </div>
        </div>
      )}

      {!notifications || notifications.length === 0 ? (
        <div className="notification-empty">
          <p>No notifications</p>
        </div>
      ) : (
        <>
          {newNotifications.length > 0 && (
            <div className="notification-section">
              <h3 className="notification-section-title">New</h3>
              <div className="notification-list">
                {newNotifications.map((notification) => (
                  <div
                    key={notification._id || notification.id}
                    className="notification-item"
                  >
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-footer">
                        <span className="notification-time">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        <div className="notification-item-actions">
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDeleteNotification(e, notification._id || notification.id)}
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

          {earlierNotifications.length > 0 && (
            <div className="notification-section">
              <h3 className="notification-section-title">Earlier</h3>
              <div className="notification-list">
                {earlierNotifications.map((notification) => (
                  <div
                    key={notification._id || notification.id}
                    className="notification-item"
                  >
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-footer">
                        <span className="notification-time">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        <div className="notification-item-actions">
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDeleteNotification(e, notification._id || notification.id)}
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
        </>
      )}
    </div>
  );
};

export default AdminNotification;