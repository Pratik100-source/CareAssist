const mongoose = require("mongoose");

const homebookingSchema = new mongoose.Schema({
  patientEmail: { type: String, required: true },
  professionalEmail: { type: String, required: true },
  message: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "declined", "ongoing", "completed"],
  },
  timestamp: { type: Date, default: Date.now },
});

const HBooking = mongoose.model("HBooking", homebookingSchema);

module.exports = HBooking;
