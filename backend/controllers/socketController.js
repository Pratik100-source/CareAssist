const BookingRequest = require("../models/homebooking");
const ChatMessage = require("../models/chatMessage");
const Notification = require("../models/notification");
const Admin = require('../models/admin');

const handleSocketEvents = (io) => {
  const connectedPatients = new Map();
  const connectedProfessionals = new Map();
  const connectedAdmins = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("patientJoin", (patientEmail) => {
      connectedPatients.set(patientEmail, socket.id);
      console.log(
        `Patient ${patientEmail} connected with socket ID: ${socket.id}`
      );
    });

    socket.on("professionalJoin", (professionalEmail) => {
      connectedProfessionals.set(professionalEmail, socket.id);
      console.log(
        `Professional ${professionalEmail} connected with socket ID: ${socket.id}`
      );
      io.emit("activeProfessionals", Array.from(connectedProfessionals.keys()));
    });

    socket.on("userStatusChanged", async (data) => {
      const { userEmail, userType, newStatus } = data;
      
      try {
        let socketId;
        if (userType.toLowerCase() === "patient") {
          socketId = connectedPatients.get(userEmail);
        } else if (userType.toLowerCase() === "professional") {
          socketId = connectedProfessionals.get(userEmail);
        }

        if (socketId) {
          console.log(`Emitting status change to ${userEmail}: ${newStatus}`);
          io.to(socketId).emit("forceLogout", {
            message: "Your account has been " + newStatus + " by admin. You will be logged out."
          });
        } else {
          console.log(`User ${userEmail} not currently connected`);
        }
      } catch (error) {
        console.error("Error in userStatusChanged event:", error);
      }
    });

    socket.on("getActiveProfessionals", () => {
      socket.emit(
        "activeProfessionals",
        Array.from(connectedProfessionals.keys())
      );
    });

    socket.on("joinChat", ({ bookingId, userEmail }) => {
      socket.join(bookingId);
      console.log(`${userEmail} joined chat for booking ${bookingId}`);
    });

    socket.on("chatMessage", async (data) => {
      const { bookingId, senderEmail, receiverEmail, message } = data;

      try {
        // Find the conversation for this booking
        let conversation = await ChatMessage.findOne({ bookingId });

        // If no conversation exists, create a new one
        if (!conversation) {
          conversation = new ChatMessage({
            bookingId,
            participants: [senderEmail, receiverEmail],
            messages: [{ senderEmail, message }],
          });
        } else {
          // Append the new message to the existing conversation
          conversation.messages.push({ senderEmail, message });
        }

        // Save the conversation to the database
        await conversation.save();

        // Fetch the newly added message (with timestamp)
        const updatedConversation = await ChatMessage.findOne({ bookingId });
        const newMessage =
          updatedConversation.messages[updatedConversation.messages.length - 1];

        // Emit the message to the booking room
        io.to(bookingId).emit("chatMessage", {
          bookingId,
          senderEmail,
          receiverEmail,
          message,
          timestamp: newMessage.timestamp,
        });
      } catch (error) {
        console.error("Error saving chat message:", error);
      }
    });

    socket.on("adminJoin", (adminEmail) => {
      connectedAdmins.set(adminEmail, socket.id);
      console.log(`Admin ${adminEmail} connected with socket ID: ${socket.id}`);
    });

    socket.on("bookingMessage", async (data) => {
      const {
        patient,
        professional_name,
        patientEmail,
        professionalEmail,
        message,
        location,
        charge,
      } = data;
      const professionalSocketId =
        connectedProfessionals.get(professionalEmail);

      console.log("Received booking data:", data); // Debug log

      if (!location || !location.patientLocation) {
        const patientSocketId = connectedPatients.get(patientEmail);
        if (patientSocketId) {
          io.to(patientSocketId).emit("bookingError", {
            message: "Patient location is required",
          });
        }
        return;
      }

      try {
        const bookingRequest = new BookingRequest({
          patient,
          professional: professional_name,
          patientEmail,
          professionalEmail,
          message,
          location: {
            patientLocation: location.patientLocation,
            professionalLocation: location.professionalLocation || "", // Fallback to empty string
          },
          charge,
        });
        await bookingRequest.save();

        if (professionalSocketId) {
          io.to(professionalSocketId).emit("receiveBooking", {
            bookingId: bookingRequest._id,
            patientEmail,
            location: bookingRequest.location.patientLocation,
            message,
          });

          setTimeout(async () => {
            const booking = await BookingRequest.findById(bookingRequest._id);
            if (booking && booking.status === "pending") {
              await BookingRequest.findByIdAndDelete(bookingRequest._id);
              const patientSocketId = connectedPatients.get(patientEmail);
              if (patientSocketId)
                io.to(patientSocketId).emit("bookingTimeout", {
                  message: "Sorry, the professional is not available",
                });
              if (professionalSocketId)
                io.to(professionalSocketId).emit("bookingRemoved", {
                  bookingId: bookingRequest._id,
                });
            }
          }, 40000);
        } else {
          const patientSocketId = connectedPatients.get(patientEmail);
          if (patientSocketId)
            io.to(patientSocketId).emit("bookingError", {
              message: `Professional ${professionalEmail} is not currently available`,
            });
        }

        // Add admin notification
        await notifyAdmin("new-booking", {
          patientEmail: data.patientEmail,
          professionalEmail: data.professionalEmail
        });
      } catch (error) {
        console.error("Error saving booking:", error);
        const patientSocketId = connectedPatients.get(patientEmail);
        if (patientSocketId) {
          io.to(patientSocketId).emit("bookingError", {
            message: "Failed to save booking",
          });
        }
      }
    });

    socket.on("fetchNotifications", async (email) => {
      try {
        const notifications = await Notification.find({ recipient: email })
          .sort({ createdAt: -1 })
          .limit(20);
        socket.emit("notificationList", { email, notifications });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    });

    socket.on("markNotificationRead", async (notificationId) => {
      try {
        await Notification.findByIdAndUpdate(
          notificationId,
          { isRead: true },
          { new: true }
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });

    socket.on("acceptBooking", async (data) => {
      const { bookingId, professionalEmail } = data;
      const booking = await BookingRequest.findByIdAndUpdate(
        bookingId,
        { status: "ongoing" },
        { new: true }
      );
      const patientEmail = booking.patientEmail;
      if (!booking) return;

      // Create notification for patient
      const patientNotification = new Notification({
        recipient: booking.patientEmail,
        type: "booking-confirmed",
        title: "Booking Confirmed",
        message: `Your booking with ${professionalEmail} has been confirmed.`,
        isRead: false,
      });

      // Create notification for professional
      const professionalNotification = new Notification({
        recipient: professionalEmail,
        type: "booking-confirmed",
        title: "Booking Confirmed",
        message: `You have a new booking from ${patientEmail}.`,
        isRead: false,
      });

      // Save both notifications
      await patientNotification.save();
      await professionalNotification.save();

      const patientSocketId = connectedPatients.get(patientEmail);
      if (patientSocketId) {
        // Emit the same notification data that was saved to MongoDB
        io.to(patientSocketId).emit(
          "newNotification",
          patientNotification.toObject()
        );

        io.to(patientSocketId).emit("bookingAccepted", {
          bookingId,
          professionalEmail,
        });
        console.log("Emitted to patient:", patientEmail);
      }

      const professionalSocketId =
        connectedProfessionals.get(professionalEmail);
      if (professionalSocketId) {
        // Emit the same notification data that was saved to MongoDB
        io.to(professionalSocketId).emit(
          "newNotification",
          professionalNotification.toObject()
        );
        io.to(professionalSocketId).emit("bookingAccepted", {
          bookingId,
          patientEmail,
        });
        console.log("Emitted to patient:", professionalEmail);
      }
    });

    socket.on("declineBooking", async (data) => {
      const { bookingId } = data;
      const booking = await BookingRequest.findById(bookingId);
      if (!booking) return;

      await BookingRequest.findByIdAndDelete(bookingId);
      const patientSocketId = connectedPatients.get(booking.patientEmail);
      if (patientSocketId)
        io.to(patientSocketId).emit("bookingDeclined", {
          message: "Booking request declined by professional",
        });
    });

    socket.on("finishBooking", async (data) => {
      const { bookingId } = data;
      const booking = await BookingRequest.findByIdAndUpdate(bookingId);

      const patientSocketId = connectedPatients.get(booking.patientEmail);
      if (patientSocketId)
        io.to(patientSocketId).emit("showPayment", { bookingId });
    });

    socket.on("paymentCompleted", async (data) => {
      const { bookingId, paymentMethod } = data;
      let response;
      const currentTime = `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;
      
      try {
        response = await BookingRequest.findByIdAndUpdate(
          bookingId,
          { 
            paid: true, 
            status: "completed",
            endTime: currentTime,
            paymentMethod 
          },
          { new: true }
        );

        if (!response) {
          console.error(`No booking found with ID: ${bookingId}`);
          return;
        }

        const patientEmail = response.patientEmail;
        const professionalEmail = response.professionalEmail;

        // Create notification for patient
        const patientNotification = new Notification({
          recipient: patientEmail,
          type: "booking-completed",
          title: "Booking Completed",
          message: `Your booking with ${professionalEmail} has been completed.`,
          isRead: false,
        });
        
        // Create notification for professional
        const professionalNotification = new Notification({
          recipient: professionalEmail,
          type: "booking-completed",
          title: "Booking Completed",
          message: `Your booking with ${patientEmail} has been completed.`,
          isRead: false,
        });

        const patientSocketId = connectedPatients.get(patientEmail);
        if (patientSocketId) {
          io.to(patientSocketId).emit(
            "newNotification",
            patientNotification.toObject()
          );
        }

        const professionalSocketId = connectedProfessionals.get(professionalEmail);
        if (professionalSocketId) {
          io.to(professionalSocketId).emit(
            "newNotification",
            professionalNotification.toObject()
          );
        }

        // Save both notifications
        await Promise.all([
          patientNotification.save(),
          professionalNotification.save()
        ]);

        io.to(bookingId).emit("bookingCompleted", { bookingId });

        // Add admin notification
        await notifyAdmin("payment-received", {
          bookingId: data.bookingId,
          amount: response.charge // Assuming charge is available in the response
        });
      } catch (error) {
        console.error("Error in paymentCompleted:", error);
      }
    });

    socket.on("joinUserRoom", ({ userEmail, userType }) => {
      try {
        // Store the socket connection appropriately based on user type
        if (userType === "patient") {
          connectedPatients.set(userEmail, socket.id);
          console.log(
            `Patient ${userEmail} joined user room with socket ID: ${socket.id}`
          );
        } else if (userType === "professional") {
          connectedProfessionals.set(userEmail, socket.id);
          console.log(
            `Professional ${userEmail} joined user room with socket ID: ${socket.id}`
          );

          // Broadcast updated professional list whenever a professional joins
          io.emit(
            "activeProfessionals",
            Array.from(connectedProfessionals.keys())
          );
        }

        // Join a room named after the user's email for direct messaging
        socket.join(userEmail);
        console.log(`${userType} joined room: ${userEmail}`);

        // Send confirmation back to client
        socket.emit("joinedRoom", {
          success: true,
          message: `Successfully joined room as ${userType}: ${userEmail}`,
        });

        // If it's a patient, send them the current active professionals list
        if (userType === "patient") {
          socket.emit(
            "activeProfessionals",
            Array.from(connectedProfessionals.keys())
          );
        }
      } catch (error) {
        console.error(`Error in joinUserRoom for ${userEmail}:`, error);
        socket.emit("joinedRoom", {
          success: false,
          message: "Failed to join room due to server error",
        });
      }
    });

    socket.on("OnlineBookingConfirmed", async (data) => {
      const { patientEmail, professionalEmail, date, time } = data;
      
      try {
        const patientNotification = new Notification({
          recipient: patientEmail,
          type: "booking-confirmed",
          title: "Online Booking Initiated",
          message: `You have an online booking with ${professionalEmail} scheduled at date: ${date} and time: ${time}.`,
          isRead: false
        });

        const professionalNotification = new Notification({
          recipient: professionalEmail,
          type: "booking-confirmed",
          title: "New Online Booking",
          message: `You have an online booking with ${patientEmail} scheduled at date: ${date} and time: ${time}.`,
          isRead: false
        });

        // Save notifications
        await Promise.all([
          patientNotification.save(),
          professionalNotification.save()
        ]);

        // Send notification to patient
        const patientSocketId = connectedPatients.get(patientEmail);
        if (patientSocketId) {
          io.to(patientSocketId).emit("newNotification", patientNotification.toObject());
        }

        // Send notification to professional
        const professionalSocketId = connectedProfessionals.get(professionalEmail);
        if (professionalSocketId) {
          io.to(professionalSocketId).emit("newNotification", professionalNotification.toObject());
        }

      } catch (error) {
        console.error("Error in initiatedOnlineBooking:", error);
      }
    });

    socket.on("bookingCancelled", async (data) => {
      const { patientEmail, professionalEmail, date, time } = data;
      
      try {
        const patientNotification = new Notification({
          recipient: patientEmail,
          type: "booking-cancelled",
          title: "Booking Cancelled",
          message: `Your online booking with ${professionalEmail} scheduled for ${date} at ${time} has been cancelled.`,
          isRead: false
        });

        const professionalNotification = new Notification({
          recipient: professionalEmail,
          type: "booking-cancelled",
          title: "Booking Cancelled",
          message: `The online booking with ${patientEmail} scheduled for ${date} at ${time} has been cancelled.`,
          isRead: false
        });

        // Save notifications
        await Promise.all([
          patientNotification.save(),
          professionalNotification.save()
        ]);

        // Send notification to patient
        const patientSocketId = connectedPatients.get(patientEmail);
        if (patientSocketId) {
          io.to(patientSocketId).emit("newNotification", patientNotification.toObject());
        }

        // Send notification to professional
        const professionalSocketId = connectedProfessionals.get(professionalEmail);
        if (professionalSocketId) {
          io.to(professionalSocketId).emit("newNotification", professionalNotification.toObject());
        }

        // Add admin notification
        await notifyAdmin("booking-cancelled", {
          patientEmail: data.patientEmail,
          professionalEmail: data.professionalEmail,
          date: data.date,
          time: data.time
        });
      } catch (error) {
        console.error("Error in bookingCancelled:", error);
      }
    });

    socket.on("VerificationUpdate", async (data) => {
      const { professionalEmail } = data;
      
      try {
        // Add admin notification
        await notifyAdmin("verification-request", {
          professionalEmail
        });
      } catch (error) {
        console.error("Error in Verification Update:", error);
      }
    });

    socket.on("verificationResponse", async (data) => {
      const { professionalEmail, status, message } = data;
      
      try {
        console.log("Received verification response:", data);

        // Create notification for professional
        const professionalNotification = new Notification({
          recipient: professionalEmail,
          type: "general",
          title: status === 'accepted' ? "Verification Accepted" : "Verification Rejected",
          message: message || (status === 'accepted' 
            ? "Your verification documents have been accepted. You can now start providing services."
            : "Your verification documents have been rejected. Please check your email for more details."),
          isRead: false,
          createdAt: new Date()
        });

        // Save notification
        await professionalNotification.save();
        console.log("Saved notification:", professionalNotification);

        // Send real-time notification if professional is connected
        const professionalSocketId = connectedProfessionals.get(professionalEmail);
        if (professionalSocketId) {
          console.log("Professional is connected, sending real-time notification");
          io.to(professionalSocketId).emit("newNotification", professionalNotification.toObject());
          io.to(professionalSocketId).emit("verificationStatusUpdate", {
            status,
            message: professionalNotification.message
          });
        } else {
          console.log("Professional not connected, notification saved for later");
        }
      } catch (error) {
        console.error("Error in verification response:", error);
      }
    });

    socket.on("ProfessionalPaid", async (data) => {
      const { professionalEmail, amount, bookingDate, bookingTime} = data;
      
      try {
        console.log("Received payment response:", data);

        // Create notification for professional
        const professionalNotification = new Notification({
          recipient: professionalEmail,
          type: "general",
          title: "Payment Received",
          message: `You have received a payment of ${amount} for the booking on ${bookingDate} at ${bookingTime}.`,
          isRead: false,
          createdAt: new Date()
        });

        // Save notification
        await professionalNotification.save();
        console.log("Saved notification:", professionalNotification);

        // Send real-time notification if professional is connected
        const professionalSocketId = connectedProfessionals.get(professionalEmail);
        if (professionalSocketId) {
          console.log("Professional is connected, sending real-time notification");
          io.to(professionalSocketId).emit("newNotification", professionalNotification.toObject());
        } else {
          console.log("Professional not connected, notification saved for later");
        }
      } catch (error) {
        console.error("Error in verification response:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      // Check if this was a patient socket
      let disconnectedPatient = null;
      for (let [email, id] of connectedPatients) {
        if (id === socket.id) {
          disconnectedPatient = email;
          connectedPatients.delete(email);
          console.log(`Patient ${email} disconnected`);
          break;
        }
      }

      // Check if this was a professional socket
      let disconnectedProfessional = null;
      for (let [email, id] of connectedProfessionals) {
        if (id === socket.id) {
          disconnectedProfessional = email;
          connectedProfessionals.delete(email);
          console.log(`Professional ${email} disconnected`);

          // Broadcast updated active professionals list
          io.emit(
            "activeProfessionals",
            Array.from(connectedProfessionals.keys())
          );
          console.log("Updated active professionals list broadcast");
          break;
        }
      }

      // Check if this was an admin socket
      let disconnectedAdmin = null;
      for (let [email, id] of connectedAdmins) {
        if (id === socket.id) {
          disconnectedAdmin = email;
          connectedAdmins.delete(email);
          console.log(`Admin ${email} disconnected`);
          break;
        }
      }

      // Log current connection counts for debugging
      console.log(
        `Current connections - Patients: ${connectedPatients.size}, Professionals: ${connectedProfessionals.size}, Admins: ${connectedAdmins.size}`
      );
    });
  });

  // Handle admin notifications for various events
  const notifyAdmin = async (type, data) => {
    try {
      // Fetch all admin emails from database
      const admins = await Admin.find({}, 'email');
      const adminEmails = admins.map(admin => admin.email);
      
      if (adminEmails.length === 0) {
        console.log('No admins found in database');
        return;
      }

      for (const adminEmail of adminEmails) {
        const notification = new Notification({
          recipient: adminEmail,
          type: type,
          title: getNotificationTitle(type),
          message: getNotificationMessage(type, data),
          isRead: false
        });

        await notification.save();

        // If admin is connected, emit the notification
        if (connectedAdmins.has(adminEmail)) {
          const adminSocket = connectedAdmins.get(adminEmail);
          adminSocket.emit('newNotification', notification);
        }
      }
    } catch (error) {
      console.error('Error in notifyAdmin:', error);
    }
  };

  // Helper functions for notification content
  const getNotificationTitle = (type) => {
    switch (type) {
      case "booking-cancelled":
        return "Booking Cancelled";
      case "payment-received":
        return "Payment Received";
      case "verification-request":
        return "Professional Verification Request";
      case "verification-response":
        return "Verification Status Update";
      default:
        return "System Notification";
    }
  };

  const getNotificationMessage = (type, data) => {
    switch (type) {
      case "booking-cancelled":
        return `Booking between ${data.patientEmail} and ${data.professionalEmail} has been cancelled.`;
      case "payment-received":
        return `Payment of ${data.amount} received for booking ID: ${data.bookingId}.`;
      case "verification-request":
        return `Professional ${data.professionalEmail} has submitted documents for verification.`;
      case "verification-response":
        return data.message || `Your verification status has been updated to ${data.status}`;
      default:
        return data.message || "System notification";
    }
  };
};

module.exports = { handleSocketEvents };
