const express = require("express");

const {
  initiate_payment,
  verify_payment,
  save_payment,
  show_payment,
  refund_payment,
} = require("../controllers/paymentController");
const router = express.Router();

router.post("/initiate-payment", initiate_payment);
router.post("/verify-payment", verify_payment);
router.post("/save-payment", save_payment);
router.get("/show-payment", show_payment);
router.post("/refund", refund_payment);

module.exports = router;
