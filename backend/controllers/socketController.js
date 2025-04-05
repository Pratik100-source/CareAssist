const BookingRequest = require("../models/homebooking");
const ChatMessage = require("../models/chatMessage");

const handleSocketEvents = (io) => {
  const connectedPatients = new Map();
  const connectedProfessionals = new Map();

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

    socket.on("acceptBooking", async (data) => {
      const { bookingId, professionalEmail } = data;
      const booking = await BookingRequest.findByIdAndUpdate(
        bookingId,
        { status: "ongoing" },
        { new: true }
      );

      if (!booking) return;

      const patientSocketId = connectedPatients.get(booking.patientEmail);
      if (patientSocketId) {
        io.to(patientSocketId).emit("bookingAccepted", {
          bookingId,
          professionalEmail,
        });
        console.log("Emitted to patient:", booking.patientEmail);
      }

      const professionalSocketId =
        connectedProfessionals.get(professionalEmail);
      if (professionalSocketId) {
        io.to(professionalSocketId).emit("bookingAccepted", {
          bookingId,
          professionalEmail,
        });
        console.log(
          "Emitted to professional:",
          professionalEmail,
          "with bookingId:",
          bookingId
        );
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
      const booking = await BookingRequest.findByIdAndUpdate(
        bookingId,
        { status: "completed", endTime: new Date().toISOString() },
        { new: true }
      );

      const patientSocketId = connectedPatients.get(booking.patientEmail);
      if (patientSocketId)
        io.to(patientSocketId).emit("showPayment", { bookingId });
    });

    socket.on("paymentCompleted", async (data) => {
      const { bookingId, paymentMethod } = data;
      await BookingRequest.findByIdAndUpdate(
        bookingId,
        { paid: true, paymentMethod },
        { new: true }
      );
      io.to(bookingId).emit("bookingCompleted", { bookingId });
    });

    socket.on("disconnect", () => {
      for (let [email, id] of connectedPatients) {
        if (id === socket.id) {
          connectedPatients.delete(email);
          console.log(`Patient ${email} disconnected`);
          break;
        }
      }
      for (let [email, id] of connectedProfessionals) {
        if (id === socket.id) {
          connectedProfessionals.delete(email);
          console.log(`Professional ${email} disconnected`);
          io.emit(
            "activeProfessionals",
            Array.from(connectedProfessionals.keys())
          );
          break;
        }
      }
    });
  });
};

module.exports = { handleSocketEvents };
