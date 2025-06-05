const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "booking-confirmed",
      "booking-cancelled",
      "appointment-reminder",
      "booking-completed",
      "message",
      "general",
      "verification-request",
      "verification-response",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
