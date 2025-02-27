const Patient = require("../models/patient");
const Professional = require("../models/professional");

const findPatient = async (req, res) => {
  try {
    // Find all patients (returns an array)
    let patients = await Patient.find();

    // Check if patients were found
    if (patients.length === 0) {
      return res.status(404).json({
        message: "No patients found",
      });
    }

    // Map through the array and format the response
    const formattedPatients = patients.map((patient) => ({
      name: `${patient.firstname} ${patient.lastname}`,
      email: patient.email,
      number: patient.mobile,
      birthdate: patient.birthdate,
    }));

    res.status(200).json(formattedPatients);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve patient data",
    });
  }
};

const findProfessional = async (req, res) => {
  try {
    // Find all professionals (returns an array)
    let professionals = await Professional.find({ verification: true });

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

module.exports = { findPatient, findProfessional };
