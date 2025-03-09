const dotenv = require("dotenv");
dotenv.config();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const axios = require("axios");

const initiate_payment = async (req, res) => {
  try {
    const payload = {
      return_url: "http://localhost:5173/paymentSuccess",
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
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, // Use PUBLIC KEY for initiation
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
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx: req.body.pidx },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, // Use SECRET KEY for verification
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error verifying payment:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

module.exports = { initiate_payment, verify_payment };
