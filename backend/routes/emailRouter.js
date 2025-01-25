const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/emailController");
const router = express.Router();

router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);

module.exports = router;
