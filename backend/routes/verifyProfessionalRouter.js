const express = require("express");
const router = express.Router();

const {
  findUnverifiedProfessional,
  uploadDocument,
} = require("../controllers/verifyProfessionalController");

router.get("/displayUnverifiedProfessional", findUnverifiedProfessional);
router.post("/saveVerification", uploadDocument); // Changed to POST

module.exports = router;
