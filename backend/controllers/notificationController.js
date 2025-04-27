const Notification = require("../models/notification");

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { recipient } = req.params;
    const notifications = await Notification.find({ recipient })
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    // Handle both route formats
    const notificationId = req.params.notificationId || req.params.id;
    
    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
    }
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }
    
    const result = await Notification.updateMany(
      { recipient: userEmail, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ 
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error marking all notifications as read" });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
    }
    
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ 
      message: "Notification deleted successfully",
      deletedNotification: notification
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};

// Delete all notifications for a user
exports.deleteAllNotifications = async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }
    
    const result = await Notification.deleteMany({ recipient: userEmail });

    res.status(200).json({ 
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Error deleting all notifications" });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { recipient, type, title, message } = req.body;

    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      isRead: false,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Error creating notification" });
  }
};
