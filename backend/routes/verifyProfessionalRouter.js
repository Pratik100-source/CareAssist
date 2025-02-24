const express = require("express");
const router = express.Router();

const {
  findUnverifiedProfessional,
} = require("../controllers/verifyProfessionalController");

router.get("/displayUnverifiedProfessional", findUnverifiedProfessional);

module.exports = router;
