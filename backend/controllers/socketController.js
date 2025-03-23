const BookingRequest = require("../models/homebooking");

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
      // Broadcast updated list to all clients
      io.emit("activeProfessionals", Array.from(connectedProfessionals.keys()));
    });

    // Handle request for active professionals
    socket.on("getActiveProfessionals", () => {
      const activePros = Array.from(connectedProfessionals.keys());
      socket.emit("activeProfessionals", activePros); // Send to requesting client
    });

    socket.on("bookingMessage", async (data) => {
      const { patientEmail, professionalEmail, message, location } = data;
      const professionalSocketId =
        connectedProfessionals.get(professionalEmail);

      // Save booking request to database
      const bookingRequest = new BookingRequest({
        patientEmail,
        professionalEmail,
        message,
        location,
      });
      await bookingRequest.save();

      if (professionalSocketId) {
        io.to(professionalSocketId).emit("receiveBooking", {
          bookingId: bookingRequest._id,
          patientEmail,
          location,
          message,
        });

        // Set a 40-second timeout for the booking
        setTimeout(async () => {
          const booking = await BookingRequest.findById(bookingRequest._id);
          if (booking && booking.status === "pending") {
            await BookingRequest.findByIdAndDelete(bookingRequest._id);
            const patientSocketId = connectedPatients.get(patientEmail);
            if (patientSocketId) {
              io.to(patientSocketId).emit("bookingTimeout", {
                message: "Sorry, the professional is not available",
              });
            }
            if (professionalSocketId) {
              io.to(professionalSocketId).emit("bookingRemoved", {
                bookingId: bookingRequest._id,
              });
            }
          }
        }, 40000); // 40 seconds
      } else {
        const patientSocketId = connectedPatients.get(patientEmail);
        if (patientSocketId) {
          io.to(patientSocketId).emit("bookingError", {
            message: `Professional ${professionalEmail} is not currently available`,
          });
        }
        console.log(`Professional ${professionalEmail} not connected`);
      }
    });

    socket.on("acceptBooking", async (data) => {
      const { bookingId, professionalEmail } = data;
      const booking = await BookingRequest.findByIdAndUpdate(
        bookingId,
        { status: "ongoing" },
        { new: true }
      );

      const patientSocketId = connectedPatients.get(booking.patientEmail);
      if (patientSocketId) {
        io.to(patientSocketId).emit("bookingAccepted", { professionalEmail });
      }

      const professionalSocketId =
        connectedProfessionals.get(professionalEmail);
      if (professionalSocketId) {
        io.to(professionalSocketId).emit("navigateToProfile", {
          path: "/professionalProfile",
        });
      }
    });

    socket.on("declineBooking", async (data) => {
      const { bookingId, professionalEmail } = data;

      const booking = await BookingRequest.findById(bookingId);
      if (!booking) {
        console.log(`Booking ${bookingId} not found`);
        return;
      }

      await BookingRequest.findByIdAndDelete(bookingId);
      const patientSocketId = connectedPatients.get(booking.patientEmail);
      if (patientSocketId) {
        io.to(patientSocketId).emit("bookingDeclined", {
          message: "Booking request declined by professional",
        });
      }
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
          // Broadcast updated list to all clients
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
