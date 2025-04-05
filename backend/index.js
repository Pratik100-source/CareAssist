const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const connectdb = require("./config/dbConnection");
const { handleSocketEvents } = require("./controllers/socketController");

// Routes
const emailRoutes = require("./routes/emailRouter");
const authRoutes = require("./routes/authRouter");
const displayinfoRoutes = require("./routes/displayinfoRouter");
const verifyprofessionalRoutes = require("./routes/verifyProfessionalRouter");
const paymentRoutes = require("./routes/paymentRouter");
const bookingRoutes = require("./routes/bookingRouter");
const chatRoutes = require("./routes/chatRouter");
const editRoutes = require("./routes/editRouter");
const deleteRoutes = require("./routes/deleteRouter");

require("./cronJobs");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Explicit origin instead of wildcard
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE"], // Include PUT for update-location
  })
);
app.use(express.json());
app.use(bodyParser.json());

// Database
connectdb();

// Routes
app.use("/api/otp", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/display", displayinfoRoutes);
app.use("/api/verification", verifyprofessionalRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/edit", editRoutes);
app.use("/api/delete", deleteRoutes);

// HTTP Server with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Match frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
handleSocketEvents(io);

// Start server
server.listen(3003, () => {
  console.log("Server running on port 3003");
});
