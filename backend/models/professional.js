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
});

const Professional = mongoose.model("Professional", professionalSchema);
module.exports = Professional;
