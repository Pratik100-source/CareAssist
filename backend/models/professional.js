const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstname: String,
  lastname: String,
  mobile: Number,
  gender: { type: String, required: true },
  birthdate: { type: Date, required: true },
  password: String,
  verification: { type: Boolean, default: false },

  document: {
    photoUrl: { type: String, default: "" },
    documentUrl: { type: String, default: "" },
  },

  submission: { type: String, default: "notsubmitted" },
  experience: { type: Number, min: 0, default: 0 },

  profession: {
    type: String,
    enum: ["Doctor", "Nurse", "Physiotherapist", ""],
    default: "",
  },

  specialization: {
    type: String,
    enum: [
      "Gynecologist",
      "Orthopedist",
      "Dietician",
      "Dermatologist",
      "General Physician",
      "Pediatrician",
      "Cardiologist",
      "Neurologist",
      "",
    ],
    default: "",
  },

  consultationMethod: {
    type: String,
    default: "",
    enum: ["online", "home", "both", ""],
  },

  availability: {
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
  },

  availableDays: [
    {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "",
      ],
      default: "",
    },
  ],
});

const Professional = mongoose.model("Professional", professionalSchema);
module.exports = Professional;
