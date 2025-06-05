import { useEffect, useState } from 'react';
import { api } from '../../../services/authService';
import { useSelector } from 'react-redux';

export const useNotifications = (userEmail, socket) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.user.token);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      // Make sure we have a token and email before making the API call
      if (!token || !userEmail) {
        console.log("Missing token or email, cannot fetch notifications");
        setLoading(false);
        return;
      }

      console.log(`Fetching notifications for ${userEmail}`);
      const response = await api.get(`/notification/${userEmail}`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Setup socket listeners and initial fetch
  useEffect(() => {
    if (!userEmail || !token) {
      console.log("Missing token or email, skipping notification setup");
      setLoading(false);
      return;
    }

    fetchNotifications();

    if (socket) {
      // Request latest notifications via socket
      socket.emit('fetchNotifications', userEmail);

      // Handle incoming real-time notifications
      const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
      };

      // Handle initial notification list
      const handleNotificationList = ({ notifications: newNotifications }) => {
        setNotifications(newNotifications);
      };

      socket.on('newNotification', handleNewNotification);
      socket.on('notificationList', handleNotificationList);

      return () => {
        socket.off('newNotification', handleNewNotification);
        socket.off('notificationList', handleNotificationList);
      };
    }
  }, [userEmail, socket, token]);

  // Mark notification as read
  const markAsRead = async (id) => {
    if (!token) return;
    
    try {
      await api.patch(`/notification/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      if (socket) socket.emit('markNotificationRead', id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return { 
    notifications, 
    loading, 
    markAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length
  };
};