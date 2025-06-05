const Payment = require("../models/payment");
const Professional = require("../models/professional");
const OBooking = require("../models/onlinebooking");
const HBooking = require("../models/homebooking");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const initiate_payment = async (req, res) => {
  try {
    const bookingType = req.body.bookingType;
    let return_url;

    if (bookingType === "online") {
      return_url = "http://localhost:5173/onlinePaymentSuccess";
    } else if (bookingType === "home") {
      return_url = `http://localhost:5173/homePaymentSuccess?bookingId=${req.body.bookingId}`;
    } else if (bookingType === "payout") {
      return_url = `http://localhost:5173/payoutSuccess?bookingId=${req.body.purchase_order_id.split('-')[1]}`;
    }

    const payload = {
      return_url: return_url,
      website_url: "http://localhost:5173",
      amount: req.body.amount,
      purchase_order_id: req.body.purchase_order_id,
      purchase_order_name: req.body.purchase_order_name,
      customer_info: req.body.customer_info,
    };

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    console.log("Khalti API Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error initiating payment:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Failed to initiate payment", details: error.message });
  }
};

const verify_payment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ error: "Payment ID (pidx) is required" });
    }

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error verifying payment:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Failed to verify payment", details: error.message });
  }
};

const save_payment = async (req, res) => {
  const {
    patientEmail,
    professionalEmail,
    pidx,
    PaymentTime,
    token,
    charge,
    transactionId,
    bookingType
  } = req.body;

  // Validate required fields
  if (
    !patientEmail ||
    !professionalEmail ||
    !pidx ||
    !PaymentTime ||
    !token ||
    !charge ||
    !transactionId ||
    !bookingType
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newPayment = new Payment({
      patientEmail,
      professionalEmail,
      pidx,
      PaymentTime,
      token,
      charge,
      transactionId,
      bookingType
    });
    await newPayment.save();
    return res.status(201).send("Payment has been saved successfully");
  } catch (error) {
    console.error("Error saving payment:", error);
    return res.status(500).json({
      error: "Error while saving the payment",
      details: error.message,
    });
  }
};

const show_payment = async (req, res) => {
  try {
    let payments = await Payment.find();

    if (payments.length === 0) {
      return res.status(404).json({
        message: "No payments found",
      });
    }

    const formattedPayments = payments.map((payment) => ({
      patientEmail: payment.patientEmail,
      professionalEmail: payment.professionalEmail,
      pidx: payment.pidx,
      PaymentTime: payment.PaymentTime,
      token: payment.token,
      charge: payment.charge,
      bookingType: payment.bookingType
    }));

    res.status(200).json(formattedPayments);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve payment data",
    });
  }
};

const refund_payment = async (req, res) => {
  const { transactionId, amount, patientEmail, bookingId } = req.body;

  // Validate required fields
  if (!transactionId || !amount || !patientEmail || !bookingId) {
    return res.status(400).json({ error: "Missing refund details" });
  }

  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey) {
    console.error("KHALTI_SECRET_KEY is not defined");
    return res
      .status(500)
      .json({ error: "Server configuration error: Missing Khalti secret key" });
  }

  try {
    // Use the sandbox refund endpoint
    const refundUrl = `https://dev.khalti.com/api/merchant-transaction/${transactionId}/refund/`;

    const refundPayload = {
      amount: amount, // Amount in paisa
      reason: "User requested refund", // Optional, confirm with Khalti
    };

    const response = await axios.post(refundUrl, refundPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${secretKey}`,
      },
    });

    // Update booking refund status in database
    const updatedBooking = await OBooking.findByIdAndUpdate(
      bookingId,
      { refund: "yes" },
      { new: true }
    );

    if (!updatedBooking) {
      throw new Error("Failed to update booking refund status");
    }

    res.status(200).json({ message: "Refund successful", data: response.data });
  } catch (error) {
    console.error("Refund failed:", error.response?.data || error.message);
    res.status(500).json({
      error: "Refund failed",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  initiate_payment,
  verify_payment,
  save_payment,
  show_payment,
  refund_payment,
};
