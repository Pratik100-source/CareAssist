const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema({
  email: String,
  firstname: String,
  lastname: String,
  mobile: Number,
  gender: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date, // Changed to Date type for better handling
    required: true,
  },
  password: String,
  verification: { type: Boolean, default: false },
  document: {
    photoUrl: { type: String, default: "" }, // Ensure default values
    documentUrl: { type: String, default: "" },
  },
});

const Professional = mongoose.model("Professional", professionalSchema);
module.exports = Professional;
