import React, { useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import './notification.css';

const NotificationBadge = () => {
  const { notifications } = useSocket();

  // Calculate unread count
  const unreadCount = useMemo(() => {
    if (!notifications || !notifications.length) return 0;
    
    // Count notifications that have isRead=false or undefined isRead (older format)
    return notifications.filter(notification => 
      notification.isRead === false || 
      // For backwards compatibility with older notification format
      (notification.isRead === undefined && !notification.read)
    ).length;
  }, [notifications]);

  if (unreadCount === 0) return null;

  return (
    <span className="notification-badge">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default NotificationBadge; 