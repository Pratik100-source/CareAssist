// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// const path = require("path");
// const Patient = require("./models/patient");

// // Load environment variables
// dotenv.config({
//   path: path.resolve(__dirname, "../.env"),
// });

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());

// // Debug: Log MONGO_URI to check if it's being loaded correctly
// console.log("Mongo URI:", process.env.MONGO_URI);

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {})
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.error("Error connecting to MongoDB:", err);
//   });

// let currentOTP = null;
// let currentEmail = null;
// let otpTimeout = null;

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "pratikpanthi100@gmail.com",
//     pass: "ucxm pouw yoaf afbo",
//   },
// });

// app.post("/send-otp", async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({
//       message: "Email is required",
//     });
//   }
//   const otp = Math.floor(100000 + Math.random() * 900000);
//   currentOTP = otp;
//   currentEmail = email;

//   if (otpTimeout) clearTimeout(otpTimeout);
//   otpTimeout = setTimeout(() => {
//     currentOTP = null;
//     currentEmail = null;
//   }, 300000);

//   try {
//     await transporter.sendMail({
//       from: "pratikpanthi100@gmail.com",
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP is: ${otp}`,
//     });
//     res.status(200).json({
//       message: "OTP sent successfully",
//     });
//   } catch (error) {
//     console.error(`Error sending OTP to ${email}:`, error);
//     res.status(500).json({
//       message: "Failed to send OTP",
//     });
//   }
// });

// app.post("/verify-otp", (req, res) => {
//   const { otp } = req.body;

//   if (parseInt(otp) === currentOTP) {
//     return res.status(200).send("OTP verified successfully");
//   } else {
//     return res.status(400).send("Invalid OTP");
//   }
// });

// app.post("/signup", async (req, res) => {
//   const { email, firstname, lastname, mobile, password } = req.body;

//   if (email !== currentEmail) {
//     return res.status(400).send("Email mismatch. Please start again.");
//   }

//   const newPatient = new Patient({
//     email,
//     firstname,
//     lastname,
//     mobile,
//     password,
//   });
//   try {
//     await newPatient.save();
//     currentOTP = null;
//     currentEmail = null;
//     return res.status(201).send("User registered successfully");
//   } catch (err) {
//     console.error("Error registering user:", err);
//     return res.status(500).send("Error registering user");
//   }
// });

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({
//       message: "Email and password are required",
//     });
//   }

//   try {
//     const user = await Patient.findOne({
//       email: email,
//     });

//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid email or password",
//       });
//     }

//     if (password !== user.password) {
//       return res.status(401).json({
//         message: "Invalid email or password",
//       });
//     }

//     res.status(200).json({
//       message: "Login successful",
//     });
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({
//       message: "Server error",
//     });
//   }
// });

// app.listen(3003, () => {
//   console.log("Server running on port 3003");
// });

// MCV form

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectdb = require("../backend/config/dbConnection");

const emailRoutes = require("../backend/routes/emailRouter");
const authRoutes = require("../backend/routes/authRouter");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

connectdb();

//define routes

app.use("/api/otp", emailRoutes);
app.use("/api/auth", authRoutes);

app.listen(3003, () => {
  console.log("Server running on port 3003");
});
