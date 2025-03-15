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
    // Fetch all online bookings for the given patientEmail
    const onlineBookings = await OBooking.find().lean();
    // Fetch all home bookings for the given patientEmail
    const homeBookings = await HBooking.find().lean();

    // Add bookingType to each booking
    const onlineBookingsWithType = onlineBookings.map((booking) => ({
      ...booking,
      bookingType: "Online", // Add bookingType field
    }));

    const homeBookingsWithType = homeBookings.map((booking) => ({
      ...booking,
      bookingType: "Home", // Add bookingType field
    }));

    // Combine both arrays
    const allBookings = [...onlineBookingsWithType, ...homeBookingsWithType];

    if (allBookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this patient" });
    }

    res.status(200).json(allBookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve booking data" });
  }
};

const saveHomeBooking = async (req, res) => {
  const {
    professionalName,
    patientName,
    patientEmail,
    professionalEmail,
    token,
    date,
    startTime,
    endTime,
  } = req.body;

  try {
    const newHomeBooking = new HBooking({
      patient: patientName,
      professional: professionalName,
      patientEmail,
      professionalEmail,
      token,
      date,
      startTime,
      endTime,
      status: "Pending",
    });

    await newHomeBooking.save();
    return res.status(201).send("Home Booking has been made");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error while booking");
  }
};

// Mark an appointment as completed after a video call session
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

module.exports = {
  saveOnlineBooking,
  getOnlineBooking,
  completeBooking,
  saveHomeBooking,
  getAllBooking,
};
