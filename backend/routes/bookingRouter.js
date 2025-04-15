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
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/save-online-booking", saveOnlineBooking);
// router.post("/save-home-booking", saveHomeBooking);
router.get("/get-online-booking", getOnlineBooking);
router.get("/get-every-booking", getAllBooking);
router.post("/complete-booking/:bookingId", completeBooking);
router.get("/pending/:professionalEmail", getPendingBookings);
router.get("/:bookingId", getBookingById);
router.post("/cancel/:bookingId", handle_cancellation);
router.put("/update-location/:bookingId", updateProfessionalLocation);

module.exports = router;
