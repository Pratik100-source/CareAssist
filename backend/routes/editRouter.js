const express = require("express");
const router = express.Router();

const {
  edit_patient,
  edit_password,
} = require("../controllers/editController");

router.put("/edit-patient", edit_patient);
router.put("/edit-password", edit_password);

module.exports = router;
