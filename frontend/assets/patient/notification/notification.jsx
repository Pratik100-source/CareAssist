import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../professionals/context/SocketContext';
import { FaTrash, FaCheck, FaCheckDouble } from 'react-icons/fa';
import "./notification.css";

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

const PatientNotification = ({ isDropdown = false }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const { 
    notifications, 
    loading, 
    joinUserRoom, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications 
  } = useSocket();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only join the socket room when component mounts, but don't mark as read yet
  useEffect(() => {
    const join = async () => {
      try {
        if (user && user.email) {
          console.log(`Patient ${user.email} joining socket`);
          
          // Join the user room for notifications
          joinUserRoom(user.email, 'patient');
          
          // Only mark all as read when in full page mode
          // In dropdown mode, they will be marked as read when the dropdown closes
          if (!isDropdown) {
            console.log('Marking all notifications as read for patient (full page mode)');
            await markAllAsRead(user.email);
          } else {
            // Simply log that we're not marking them as read yet
            console.log('Highlighting unread notifications in dropdown mode (will mark as read on close)');
          }
        }
      } catch (error) {
        console.error('Error joining room:', error);
      }
    };
    
    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await markAsRead(notificationId);
      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mark all as read action (button click)
  const handleMarkAllAsRead = async () => {
    if (!user || !user.email) return;
    
    setIsLoading(true);
    try {
      await markAllAsRead(user.email);
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
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
      console.log(`Notification ${notificationId} deleted`);
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
      console.log('All notifications deleted');
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
  
  // Set container class based on dropdown mode
  const containerClassName = isDropdown ? "notification-container dropdown-view" : "notification-container";

  // For the view all notifications link
  const handleViewAll = () => {
    navigate("/patientnotification");
  };

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

  // Split notifications into unread and read for dropdown mode
  let unreadNotifications = [];
  let readNotifications = [];
  
  if (isDropdown) {
    // For dropdown mode, separate into unread and read categories
    unreadNotifications = notifications.filter(n => !n.isRead);
    readNotifications = notifications.filter(n => n.isRead);
  }

  return (
    <div className={containerClassName}>
      {isDropdown ? (
        <>
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadNotifications.length > 0 && (
              <span className="unread-count">{unreadNotifications.length} unread</span>
            )}
            <button className="view-all-btn" onClick={handleViewAll}>View All</button>
          </div>
          
          {/* Dropdown view with unread first, then read */}
          <div className="notification-list">
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
        </>
      ) : (
        <div className="notification-header">
          <div className="notification-actions">
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
              disabled={isLoading}
            >
              <FaCheckDouble /> Mark all as read
            </button>
            <button 
              className="delete-all-btn"
              onClick={handleDeleteAllPrompt}
              title="Delete all notifications"
              disabled={isLoading}
            >
              <FaTrash /> Delete all
            </button>
          </div>
        </div>
      )}
      
      {showConfirmDelete && (
        <div className="delete-confirm">
          <p>Are you sure you want to delete all notifications?</p>
          <div className="delete-confirm-actions">
            <button onClick={handleConfirmDeleteAll} className="confirm-btn">Yes, delete all</button>
            <button onClick={handleCancelDeleteAll} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
      
      {/* Full page notification view */}
      {!isDropdown && (
        <>
          {newNotifications.length > 0 && (
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
          
          {earlierNotifications.length > 0 && (
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
        </>
      )}
    </div>
  );
};

export default PatientNotification;
