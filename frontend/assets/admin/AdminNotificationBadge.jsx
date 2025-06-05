import React, { useMemo } from 'react';
import { useSocket } from '../professionals/context/SocketContext';
import '../patient/notification/notification.css';

const AdminNotificationBadge = () => {
  const { notifications } = useSocket();

  // Calculate unread count
  const unreadCount = useMemo(() => {
    if (!notifications || !notifications.length) return 0;
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  if (unreadCount === 0) return null;

  return (
    <span className="notification-badge">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default AdminNotificationBadge; 