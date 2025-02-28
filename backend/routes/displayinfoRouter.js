const express = require("express");
const router = express.Router();

const {
  findPatient,
  findProfessional,
  displayPersonalInfo,
} = require("../controllers/displayInfoController");

router.get("/getpatient", findPatient);
router.get("/getprofessional", findProfessional);
router.post("/getprofessionalInfo", displayPersonalInfo);

module.exports = router;
