const express = require("express");

const router = express.Router();

const {
  professionalSignup,
  login,
  patientSignup,
} = require("../controllers/authController");

router.post("/professionalSignup", professionalSignup);
router.post("/patientSignup", patientSignup);
router.post("/login", login);

module.exports = router;
