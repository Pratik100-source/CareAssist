const mongoose = require("mongoose");

// Sub-schema for individual messages
const messageSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Number, default: () => Date.now() }, // Unix timestamp in milliseconds
});

// Main schema for the conversation
const chatMessageSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  participants: [{ type: String, required: true }], // Array of participant emails (e.g., [patientEmail, professionalEmail])
  messages: [messageSchema], // Array of messages
});

// Index for efficient querying
chatMessageSchema.index({ bookingId: 1 });
chatMessageSchema.index({ "messages.timestamp": 1 }); // Index on timestamp for efficient sorting

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
module.exports = ChatMessage;
