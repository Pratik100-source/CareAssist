const express = require("express");
const {
  sendOtp,
  verifyOtp,
  Forget_password_otp,
  verifyForgetOtp,
} = require("../controllers/emailController");
const { verify } = require("jsonwebtoken");
const router = express.Router();

router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/send-forget-otp", Forget_password_otp);
router.post("/verify-forget-otp", verifyForgetOtp);
module.exports = router;
