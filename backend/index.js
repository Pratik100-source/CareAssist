// MCV form

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectdb = require("../backend/config/dbConnection");

const emailRoutes = require("../backend/routes/emailRouter");
const authRoutes = require("../backend/routes/authRouter");
const displayinfoRoutes = require("../backend/routes/displayinfoRouter");
const verifyprofessionalRoutes = require("../backend/routes/verifyProfessionalRouter");
const paymentRoutes = require("../backend/routes/paymentRouter");

const bookingRoutes = require("./routes/bookingRouter");
require("./cronJobs"); // Start cron jobs

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

connectdb();

//define routes

app.use("/api/otp", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/display", displayinfoRoutes);
app.use("/api/verification", verifyprofessionalRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/booking", bookingRoutes);

app.listen(3003, () => {
  console.log("Server running on port 3003");
});
