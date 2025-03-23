const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  patientEmail: { type: String, required: true },
  professionalEmail: { type: String, required: true },
  pidx: { type: String, required: true },
  PaymentTime: { type: String, required: true },
  token: { type: Number, required: true },
  charge: { type: Number, required: true },
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
