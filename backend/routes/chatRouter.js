const express = require("express");
const router = express.Router();

const { fetchMessages } = require("../controllers/chatController");

router.post("/:bookingId", fetchMessages);

module.exports = router;
