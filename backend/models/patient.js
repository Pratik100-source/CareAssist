const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  email: String,
  firstname: String,
  lastname: String,
  mobile: Number,
  gender: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Object,
    required: true,
  },
  password: String,
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
