const Patient = require("../models/patient");
const Professional = require("../models/professional");
const Admin = require("../models/admin");
const transporter = require("../config/emailConnection");

let currentOTP = null;
let forgetOTP = null;
let currentEmail = null;
let otpTimeout = null;

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      console.log("Email is required but was not provided");
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if the email is already registered
    let user = await Patient.findOne({ email });
    if (!user) {
      user = await Professional.findOne({ email });
    }
    if (!user) {
      user = await Admin.findOne({ email });
    }


    if (user) {
      console.log(`Email ${email} is already registered`);
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`Generated OTP for ${email}: ${otp}`);
    currentOTP = otp;
    currentEmail = email;

    // Set timeout for OTP
    if (otpTimeout) {
      clearTimeout(otpTimeout);
      console.log("Cleared previous OTP timeout");
    }
    
    otpTimeout = setTimeout(() => {
      console.log(`OTP expired for ${currentEmail}`);
      currentOTP = null;
      currentEmail = null;
    }, 300000); // 5 minutes

    // Send mail with OTP using nodemailer transporter
    try {
      console.log(`Attempting to send OTP email to ${email}`);
      
      // Check if transporter is properly configured
      if (!transporter || !process.env.Company_Email) {
        console.error("Email transporter not properly configured", {
          transporterExists: !!transporter,
          companyEmailExists: !!process.env.Company_Email
        });
        return res.status(500).json({
          message: "Email service not configured properly",
        });
      }
      
      await transporter.sendMail({
        from: process.env.Company_Email,
        to: email,
        subject: "Verify your email with CareAssist",
        text: `Your verification code is: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4a90e2;">CareAssist Email Verification</h2>
            <p>Thank you for signing up with CareAssist. Please use the following verification code to complete your registration:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">${otp}</h1>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">CareAssist Team</p>
          </div>
        `,
      });

      console.log(`OTP email sent successfully to ${email}`);
      res.status(200).json({
        message: "Check your email for the OTP",
      });
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      res.status(500).json({
        message: "Failed to send the OTP. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error("Unexpected error in sendOtp:", error);
    res.status(500).json({
      message: "Server error while processing your request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      console.log("OTP was not provided in request");
      return res.status(400).json({ 
        message: "OTP is required" 
      });
    }

    console.log(`Verifying OTP: ${otp}, Current OTP: ${currentOTP}`);
    
    if (!currentOTP) {
      console.log("No active OTP found - might have expired");
      return res.status(400).json({ 
        message: "OTP expired or not generated. Please request a new OTP." 
      });
    }

    if (parseInt(otp) === currentOTP) {
      console.log(`OTP verified successfully for ${currentEmail}`);
      // Reset OTP after successful verification
      const verifiedEmail = currentEmail;
      currentOTP = null;
      
      return res.status(200).json({ 
        message: "OTP verified successfully",
        email: verifiedEmail 
      });
    } else {
      console.log(`Invalid OTP attempt: ${otp}, Expected: ${currentOTP}`);
      return res.status(400).json({ 
        message: "Invalid OTP. Please try again." 
      });
    }
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ 
      message: "Server error while verifying OTP",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const sendMeetLink = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.Company_Email,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a90e2;">CareAssist Meeting Details</h2>
          <p>Your consultation meeting has been scheduled. Here are the details:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 10px 0;">${text}</p>
          </div>
          <p>Please join the meeting on time. If you need to reschedule, please contact us in advance.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #888;">Best regards,<br>CareAssist Team</p>
          </div>
        </div>
      `
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
        text: `Your verification code is: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4a90e2;">CareAssist Email Verification</h2>
            <p>Please use the following verification code to reset your password:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">${otp}</h1>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">CareAssist Team</p>
          </div>
        `,
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
