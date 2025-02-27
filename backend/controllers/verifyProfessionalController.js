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
      document: professional.document,
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

const updateStatus = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await Professional.updateOne(
      { email: email },
      { $set: { verification: true } }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "No professional found with the provided email" });
    }

    if (result.modifiedCount === 0) {
      return res
        .status(200)
        .json({ message: "Verification status was already true" });
    }

    res.status(200).json({ message: "Status changed successfully" });
  } catch (error) {
    console.error("Error while updating the status:", error);
    res.status(500).json({ message: "Failed to update the status" });
  }
};

module.exports = { findUnverifiedProfessional, uploadDocument, updateStatus };
