const express = require("express");
const router = express.Router();

const {
  edit_patient,
  edit_password,
  edit_professional
} = require("../controllers/editController");

router.put("/edit-patient", edit_patient);
router.put("/edit-password", edit_password);
router.put("/edit-professional", edit_professional);

module.exports = router;
