const express = require("express");
const {
  saveOnlineBooking,
  getOnlineBooking,
  completeBooking,
  saveHomeBooking,
  getAllBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/save-online-booking", saveOnlineBooking);
router.post("/save-home-booking", saveHomeBooking);
router.get("/get-online-booking", getOnlineBooking);
router.get("/get-every-booking", getAllBooking);
router.post("/complete-booking/:bookingId", completeBooking);

module.exports = router;
