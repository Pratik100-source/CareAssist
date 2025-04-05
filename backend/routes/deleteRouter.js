const express = require("express");
const router = express.Router();

const {
  delete_patient,
  delete_professional,
} = require("../controllers/deleteController");

router.delete("/delete-patient/:patientEmail", delete_patient);
router.delete("/delete-professional/:professionalEmail", delete_professional);

module.exports = router;
