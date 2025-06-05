const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  patientEmail: { type: String, required: true },
  professionalEmail: { type: String, required: true },
  pidx: { type: String, required: true },
  PaymentTime: { type: String, required: true },
  token: { type: String, required: true },
  charge: { type: Number, required: true },
  transactionId: { type: String },
  bookingType: {type:String, enum:["video", "home"]}
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
