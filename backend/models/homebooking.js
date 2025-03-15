const mongoose = require("mongoose");

const homebookingSchema = new mongoose.Schema({
  patient: { type: String, required: true },
  professional: { type: String, required: true },
  patientEmail: { type: String, required: true },
  professionalEmail: { type: String, required: true },
  token: { type: Number, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, default: "" },
  status: { type: String, default: "Pending" },
});

const HBooking = mongoose.model("HBooking", homebookingSchema);

module.exports = HBooking;
