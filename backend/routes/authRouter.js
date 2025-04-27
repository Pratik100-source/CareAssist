const express = require("express");

const router = express.Router();

const {
  professionalSignup,
  login,
  patientSignup,
  forget_password,
} = require("../controllers/authController");

router.post("/professionalSignup", professionalSignup);
router.post("/patientSignup", patientSignup);
router.post("/login", login);
router.post("/reset-password", forget_password);

module.exports = router;
