const Patient = require("../models/patient");
const Professional = require("../models/professional");

const transporter = require("../config/emailConnection");

let currentOTP = null;
let forgetOTP = null;
let currentEmail = null;
let otpTimeout = null;

const sendOtp = async (req, res) => {
  const { email } = req.body;

  let user = await Patient.findOne({ email });

  if (!user) {
    user = await Professional.findOne({ email });
  }

  if (!user) {
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    currentOTP = otp;
    currentEmail = email;

    // Set timeout for OTP
    if (otpTimeout) clearTimeout(otpTimeout);
    otpTimeout = setTimeout(() => {
      currentOTP = null;
      currentEmail = null;
    }, 300000);

    // Send mail with OTP using nodemailer transporter
    try {
      await transporter.sendMail({
        from: process.env.Company_Email,
        to: email,
        subject: "Verify the OTP",
        text: `Here is your OTP: ${otp}`,
      });

      res.status(200).json({
        message: "Check your email for the OTP",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Failed to send the OTP",
      });
    }
  } else {
    res.status(400).json({
      message: "Email already registered",
    });
    console.log("Email already registered");
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  if (parseInt(otp) === currentOTP) {
    return res.status(200).json({ message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};

const sendMeetLink = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.Company_Email,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

const Forget_password_otp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }
  let user = await Patient.findOne({ email });

  if (!user) {
    user = await Professional.findOne({ email });
  }

  if (user) {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    forgetOTP = otp;
    currentEmail = email;

    // Set timeout for OTP
    if (otpTimeout) clearTimeout(otpTimeout);
    otpTimeout = setTimeout(() => {
      forgetOTP = null;
      currentEmail = null;
    }, 300000);

    // Send mail with OTP using nodemailer transporter
    try {
      await transporter.sendMail({
        from: process.env.Company_Email,
        to: email,
        subject: "OTP for forget Password",
        text: `Here is your OTP for password forget: ${otp}`,
      });

      res.status(200).json({
        message: "Check your email for the OTP",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Failed to send the OTP",
      });
    }
  } else {
    res.status(400).json({
      message: "No such email found",
    });
    console.log("Email not registered");
  }
};

const verifyForgetOtp = async (req, res) => {
  const { otp } = req.body;

  if (parseInt(otp) === forgetOTP) {
    return res
      .status(200)
      .json({ message: "OTP verified successfully", success: true });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  sendMeetLink,
  Forget_password_otp,
  verifyForgetOtp,
};
