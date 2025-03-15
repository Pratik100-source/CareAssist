const mongoose = require("mongoose");

const onlinebookingSchema = new mongoose.Schema({
  patient: { type: String, required: true },
  professional: { type: String, required: true },
  patientEmail: { type: String, required: true },
  professionalEmail: { type: String, required: true },
  token: { type: Number, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  meetLink: { type: String, default: null },
  status: { type: String, default: "Pending" },
});

const OBooking = mongoose.model("OBooking", onlinebookingSchema);
module.exports = OBooking;
