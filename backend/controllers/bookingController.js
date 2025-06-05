const OBooking = require("../models/onlinebooking");
const HBooking = require("../models/homebooking");

const saveOnlineBooking = async (req, res) => {
  const {
    professionalName,
    patientName,
    patientEmail,
    professionalEmail,
    token,
    date,
    startTime,
    endTime,
    charge,
    transactionId,
  } = req.body;

  try {
    const newBooking = new OBooking({
      patient: patientName,
      professional: professionalName,
      patientEmail,
      professionalEmail,
      token,
      date,
      startTime,
      endTime,
      status: "Pending",
      charge,
      transactionId,
    });

    await newBooking.save();
    return res.status(201).send("Booking has been made");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error while booking");
  }
};

const getOnlineBooking = async (req, res) => {
  try {
    let onlinebookings = await OBooking.find();
    res.status(200).json(onlinebookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve booking data" });
  }
};

const getAllBooking = async (req, res) => {
  try {
    const onlineBookings = await OBooking.find().lean();
    const homeBookings = await HBooking.find().lean();

    const onlineBookingsWithType = onlineBookings.map((booking) => ({
      ...booking,
      bookingType: "Online",
    }));

    const homeBookingsWithType = homeBookings.map((booking) => ({
      ...booking,
      bookingType: "Home",
    }));

    const allBookings = [...onlineBookingsWithType, ...homeBookingsWithType];
    if (allBookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(allBookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve booking data" });
  }
};

const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    await OBooking.findByIdAndUpdate(bookingId, { status: "Completed" });
    res.status(200).json({ message: "Booking marked as completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating booking status" });
  }
};

const getPendingBookings = async (req, res) => {
  try {
    const { professionalEmail } = req.params;
    const bookings = await HBooking.find({
      professionalEmail,
      status: "pending",
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    let booking = await HBooking.findById(bookingId);

    if (!booking) {
      booking = await OBooking.findById(bookingId);
    }

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    else if (booking.status === "completed") {
      return res.status(403).json({ message: "Booking has already completed" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error });
  }
};

const updateProfessionalLocation = async (req, res) => {
  const { bookingId } = req.params;
  const { professionalLocation } = req.body;

  try {
    const booking = await HBooking.findByIdAndUpdate(
      bookingId,
      { "location.professionalLocation": professionalLocation },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error updating professional location:", error);
    res.status(500).json({ message: "Failed to update professional location" });
  }
};

const handle_cancellation = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await OBooking.findByIdAndUpdate(
      bookingId,
      { status: "Cancelled", refund: "no" },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error updating the booking status:", error);
    res.status(500).json({ message: "Failed to update the booking status" });
  }
  };


  const updateHomeBooking = async (req, res) => {
    const { bookingId, transactionId } = req.body;
    try {
      const booking = await HBooking.findByIdAndUpdate(
        bookingId,
        {
          transactionId,
          status: "completed",
          paymentMethod: "online",
        },
        { new: true }
      );
  
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      res.status(200).json({ message: "Booking updated successfully", booking });
      console.log("Updating booking:", { bookingId, transactionId });
    } catch (error) {
      console.error("Error updating the booking status:", error);
      res.status(500).json({ message: "Failed to update the booking status" });
    }
  };
  

const getHomeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await HBooking.findById(bookingId);
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error });
  }
};

const updateBooking = async (req, res) => {
  const { bookingId, paidOut } = req.body;

  try {
    // First try to find and update as Home Booking
    let booking = await HBooking.findByIdAndUpdate(
      bookingId,
      { paidOut: paidOut },
      { new: true, runValidators: true }
    );

    // If not found as Home Booking, try as Online Booking
    if (!booking) {
      booking = await OBooking.findByIdAndUpdate(
        bookingId,
        { paidOut: paidOut },
        { new: true, runValidators: true }
      );
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking updated successfully",
      booking,
      bookingType: booking instanceof HBooking ? "Home" : "Online"
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ 
      message: "Failed to update booking",
      error: error.message 
    });
  }
};

// const updatePayoutStatus = async (req, res) => {
//   const { bookingId, transactionId, paidOut, payoutDate } = req.body;

//   if (!bookingId || !transactionId) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required fields"
//     });
//   }

//   try {
//     // Try to update online booking first
//     let updatedBooking = await OBooking.findByIdAndUpdate(
//       bookingId,
//       {
//         paidOut,
//         payoutDate,
//         payoutTransactionId: transactionId
//       },
//       { new: true }
//     );

//     // If not found in online bookings, try home bookings
//     if (!updatedBooking) {
//       updatedBooking = await HBooking.findByIdAndUpdate(
//         bookingId,
//         {
//           paidOut,
//           payoutDate,
//           payoutTransactionId: transactionId
//         },
//         { new: true }
//       );
//     }

//     if (!updatedBooking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Payout status updated successfully",
//       booking: updatedBooking
//     });

//   } catch (error) {
//     console.error("Error updating payout status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update payout status",
//       error: error.message
//     });
//   }
// };

module.exports = {
  saveOnlineBooking,
  getOnlineBooking,
  completeBooking,
  getAllBooking,
  getPendingBookings,
  getBookingById,
  updateProfessionalLocation,
  handle_cancellation,
  updateHomeBooking,
  getHomeBooking,
  updateBooking,
};
