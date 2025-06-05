const mongoose = require("mongoose");
const NepaliDate = require("nepali-datetime");

// Function to get the current date in Nepal (YYYY-MM-DD)
const getNepalDate = () => {
  const nepaliDate = new NepaliDate(); // Current date/time in Nepal
  const year = nepaliDate.getEnglishYear();
  const month = String(nepaliDate.getEnglishMonth() + 1).padStart(2, "0"); // Months are 0-based in NepaliDate
  const day = String(nepaliDate.getEnglishDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Function to get the current time in Nepal (HH:mm)
const getNepalTime = () => {
  const nepaliDate = new NepaliDate(); // Current date/time in Nepal
  const hours = String(nepaliDate.getHours()).padStart(2, "0");
  const minutes = String(nepaliDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const homebookingSchema = new mongoose.Schema({
  patient: { type: String, required: true },
  professional: { type: String, required: true },
  patientEmail: { type: String, required: true },
  professionalEmail: { type: String, required: true },
  message: { type: String, required: true },
  location: {
    patientLocation: { type: String, required: true },
    professionalLocation: { type: String, default: "" },
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "declined", "ongoing", "completed"],
  },
  date: {
    type: String,
    default: getNepalDate, // Store only the date in YYYY-MM-DD format
  },
  startTime: {
    type: String,
    default: getNepalTime, // Store the current time in Nepal (HH:mm)
  },
  endTime: { type: String },
  charge: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  paymentMethod: { type: String },
  transactionId: { type: String },
  token: { type: String },
  paidOut: { type: Boolean, default: false },
});

homebookingSchema.pre("save", function (next) {
  if (!this.token && this._id) {
    this.token = this._id.toString().slice(-6);
  }
  next();
});

const HBooking = mongoose.model("HBooking", homebookingSchema);

module.exports = HBooking;
