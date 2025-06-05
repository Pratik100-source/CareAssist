const express = require("express");
const {
  saveOnlineBooking,
  getOnlineBooking,
  completeBooking,
  // saveHomeBooking,
  getAllBooking,
  getPendingBookings,
  getBookingById,
  updateProfessionalLocation,
  handle_cancellation,
  updateHomeBooking,
  getHomeBooking,
  updateBooking,
} = require("../controllers/bookingController");

const router = express.Router();

// Protected routes
router.post("/save-online-booking", saveOnlineBooking);
// router.post("/save-home-booking", saveHomeBooking);
router.get("/get-online-booking", getOnlineBooking);
router.get("/get-every-booking", getAllBooking);
router.post("/complete-booking/:bookingId", completeBooking);
router.get("/pending/:professionalEmail", getPendingBookings);
router.get("/:bookingId", getBookingById);
router.post("/cancel/:bookingId", handle_cancellation);
router.put("/update-location/:bookingId", updateProfessionalLocation);
router.post("/update-home-booking", updateHomeBooking);
router.get("/home-booking/:bookingId", getHomeBooking);
router.post("/update-booking", updateBooking);
module.exports = router;
