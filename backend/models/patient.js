const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  email: String,
  firstname: String,
  lastname: String,
  mobile: Number,
  password: String,
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
