const express = require("express");
const router = express.Router();

const {
  findUnverifiedProfessional,
  uploadDocument,
  updateStatus,
} = require("../controllers/verifyProfessionalController");

router.get("/displayUnverifiedProfessional", findUnverifiedProfessional);
router.post("/saveVerification", uploadDocument); // Changed to POST
router.post("/updateStatus", updateStatus);

module.exports = router;
