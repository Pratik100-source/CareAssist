const express = require("express");
const router = express.Router();

const {
  findPatient,
  findProfessional,
  displayPersonalInfo,
  displayPatientInfo,
} = require("../controllers/displayInfoController");

router.get("/getpatient", findPatient);
router.get("/getprofessional", findProfessional);
router.post("/getprofessionalInfo", displayPersonalInfo);
router.post("/getpatientInfo", displayPatientInfo);

module.exports = router;
