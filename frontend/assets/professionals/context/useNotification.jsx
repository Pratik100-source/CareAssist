import { useEffect, useState } from 'react';
import axios from 'axios';

export const useNotifications = (userEmail, socket) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/notifications/${userEmail}`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Setup socket listeners and initial fetch
  useEffect(() => {
    if (!userEmail) return;

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
  }, [userEmail, socket]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
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