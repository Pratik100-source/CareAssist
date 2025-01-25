const express = require("express");
const { patientSignup, login } = require("../controllers/authController");
const router = express.Router();

router.post("/patientSignup", patientSignup);
router.post("/login", login);

module.exports = router;
