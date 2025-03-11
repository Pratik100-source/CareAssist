const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  mobile: { type: Number, required: true },
  gender: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Object,
    required: true,
  },
  password: { type: String, required: true },
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
