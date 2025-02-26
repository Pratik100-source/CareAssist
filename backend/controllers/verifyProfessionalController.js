const mongoose = require("mongoose");

const Professional = require("../models/professional");

const findUnverifiedProfessional = async (req, res) => {
  try {
    // Find all professionals (returns an array)
    let professionals = await Professional.find({ verification: false });

    // Check if professionals were found
    if (professionals.length === 0) {
      return res.status(404).json({
        message: "No professionals found",
      });
    }

    // Map through the array and format the response
    const formattedProfessionals = professionals.map((professional) => ({
      name: `${professional.firstname} ${professional.lastname}`,
      email: professional.email,
      number: professional.mobile,
      status: professional.verification,
    }));

    res.status(200).json(formattedProfessionals);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve professional data",
    });
  }
};

const uploadDocument = async (req, res) => {
  const { email, photoUrl, documentUrl } = req.body;

  try {
    // Save to MongoDB
    const result = await Professional.updateOne(
      { email: email },
      { $set: { document: { photoUrl, documentUrl } } }
    );

    if (result !== 0) {
      res.status(200).json({ message: "Verification data saved successfully" });
    }
  } catch (error) {
    console.error("Error saving verification data:", error);
    res.status(500).json({ message: "Failed to save verification data" });
  }
};

module.exports = { findUnverifiedProfessional, uploadDocument };
