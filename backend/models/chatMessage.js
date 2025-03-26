const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String, required: true },
});

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
module.exports = ChatMessage;
