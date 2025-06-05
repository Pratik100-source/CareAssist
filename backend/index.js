const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const connectdb = require("./config/dbConnection");
const { handleSocketEvents } = require("./controllers/socketController");
const { verifyToken } = require("./controllers/jwtController");
const jwt = require("jsonwebtoken");

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
const notificationRoutes = require("./routes/notificationRouter");

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
app.use("/api/display", verifyToken, displayinfoRoutes);
app.use("/api/verification", verifyToken, verifyprofessionalRoutes);
app.use("/api/payment", verifyToken, paymentRoutes);
app.use("/api/booking", verifyToken, bookingRoutes);
app.use("/api/chat", verifyToken, chatRoutes);
app.use("/api/edit", verifyToken, editRoutes);
app.use("/api/delete", verifyToken, deleteRoutes);
app.use("/api/notification", verifyToken, notificationRoutes);

// HTTP Server with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Match frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      // Allow connection even without token for backward compatibility
      console.log("Socket connecting without token");
      return next();
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Attach the user data to the socket
      console.log(`Authenticated socket connection for user: ${decoded.email}`);
      return next();
    } catch (err) {
      console.log("Invalid socket auth token:", err.message);
      return next();  // Still allow connection for now, but log the error
    }
  } catch (error) {
    console.error("Socket auth error:", error);
    return next();  // Continue anyway for backward compatibility
  }
});

app.set("io", io);
handleSocketEvents(io);

// Start server
server.listen(3003, () => {
  console.log("Server running on port 3003");
});
