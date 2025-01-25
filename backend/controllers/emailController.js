const transporter = require("../config/emailConnection");

let currentOTP = null;
let currentEmail = null;
let otpTimeout = null;

//function that handle the sending of OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  //generate otp
  const otp = Math.floor(100000 + Math.random() * 900000);
  currentOTP = otp;
  currentEmail = email;

  //setting timeout
  if (otpTimeout) clearTimeout(otpTimeout);
  otpTimeout = setTimeout(() => {
    currentOTP = null;
    currentEmail = null;
  }, 300000);

  //sending mail with OTP using node mailer transporter
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
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  if (parseInt(otp) === currentOTP) {
    return res.status(200).send("OTP verified successfully");
  } else {
    return res.status(400).send("Invalid OTP");
  }
};

module.exports = { sendOtp, verifyOtp };
