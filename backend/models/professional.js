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
    type: Object,
    required: true,
  },
  password: String,
  verification: { type: Boolean, required: false, default: false },
});

const Professional = mongoose.model("Professional", professionalSchema);
module.exports = Professional;
