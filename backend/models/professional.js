const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const professionalSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstname: String,
  lastname: String,
  number: Number,
  user_status: { type: String, enum:["active","blocked"]},
  gender: { type: String, required: true },
  birthdate: { type: Date, required: true },
  password: String,
  verification: { type: Boolean, default: false },

  document: {
    photoUrl: { type: String, default: "" },
    documentUrl: { type: String, default: "" },
  },
  khalti_wallet: { type: String, default: "" },

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
  charge: {
    type: Number,
    default: 0,
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

// Hash password before saving
professionalSchema.pre("save", async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next();
  
  try {
    // Generate a salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
professionalSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Professional = mongoose.model("Professional", professionalSchema);
module.exports = Professional;
