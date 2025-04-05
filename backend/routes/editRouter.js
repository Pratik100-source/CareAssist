const express = require("express");
const router = express.Router();

const { edit_patient } = require("../controllers/editController");

router.put("/edit-patient", edit_patient);

module.exports = router;
