const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Get all notifications for a user
router.get("/:recipient", notificationController.getUserNotifications);

// Mark notification as read
router.patch("/:notificationId/read", notificationController.markAsRead);
// Add a PUT endpoint for marking notifications as read to support both formats
router.put("/read/:notificationId", notificationController.markAsRead);

// Mark all notifications as read for a user
router.put("/mark-all-read/:userEmail", notificationController.markAllAsRead);

// Delete a notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Delete all notifications for a user
router.delete("/delete-all/:userEmail", notificationController.deleteAllNotifications);

// Create a new notification (optional, if you want to create via HTTP)
router.post("/", notificationController.createNotification);

module.exports = router;
