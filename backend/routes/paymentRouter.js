const express = require("express");

const {
  initiate_payment,
  verify_payment,
} = require("../controllers/paymentController");
const router = express.Router();

router.post("/initiate-payment", initiate_payment);
router.post("/verify-payment", verify_payment);

module.exports = router;
