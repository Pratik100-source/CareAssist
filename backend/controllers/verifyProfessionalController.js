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
      number: professional.number,
      status: professional.verification,
      document: professional.document,
      profession: professional.profession,
      specialization: professional.specialization,
      consultationMethod: professional.consultationMethod,
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
  const {
    email,
    photoUrl,
    khalti_wallet,
    documentUrl,
    profession,
    specialization,
    experience,
    consultationMethod,
    charge,
    startTime,
    endTime,
    availableDays,
  } = req.body;


  if (
    !email ||
    !khalti_wallet ||
    !photoUrl ||
    !documentUrl ||
    !profession ||
    !experience ||
    !consultationMethod ||
    !charge ||
    !startTime ||
    !endTime ||
    !availableDays.length
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  try {
    const specializationValue = specialization || "";

    const result = await Professional.updateOne(
      { email: email },
      {
        $set: {
          document: { photoUrl, documentUrl },
          submission: "submitted",
          profession: profession,
          specialization: specializationValue,
          experience: experience,
          consultationMethod: consultationMethod,
          charge: charge,
          khalti_wallet: khalti_wallet,
          availability: { startTime, endTime },
          availableDays: availableDays,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Professional not found" });
    }

    res.status(200).json({ message: "Verification data saved successfully" });
  } catch (error) {
    console.error("Error saving verification data:", error);
    res.status(500).json({
      message: "Failed to save verification data",
      error: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  const { email, status, submission } = req.body;

  try {
    const result = await Professional.updateOne(
      { email: email },
      { $set: { verification: status, submission: submission } }
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
