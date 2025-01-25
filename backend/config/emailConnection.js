const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Company_Email,
    pass: process.env.Company_Password,
  },
});

module.exports = transporter;
