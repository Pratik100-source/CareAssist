const express = require("express");
const router = express.Router();

const {
  findPatient,
  findProfessional,
} = require("../controllers/displayInfoController");

router.get("/getpatient", findPatient);
router.get("/getprofessional", findProfessional);

module.exports = router;
