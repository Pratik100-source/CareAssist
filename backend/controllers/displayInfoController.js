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
      profession: professional.profession,
      specialization: professional.specialization,
      consultationMethod: professional.consultationMethod,
      experience: professional.experience,
      photoUrl: professional.document.photoUrl,
      availability: professional.availability,
      availableDays: professional.availableDays,
      charge: professional.charge,
    }));

    res.status(200).json(formattedProfessionals);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve professional data",
    });
  }
};

const displayPersonalInfo = async (req, res) => {
  const { email } = req.body;
  try {
    let result = await Professional.findOne({ email: email });

    if (!result) {
      return res.status(404).json({
        message: "No professionals found",
      });
    }

    res.status(200).json({
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve the professional information",
    });
  }
};
const displayPatientInfo = async (req, res) => {
  const { email } = req.body;
  try {
    let result = await Patient.findOne({ email: email });

    if (!result) {
      return res.status(404).json({
        message: "No such patient found",
      });
    }

    res.status(200).json({
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve the patient information",
    });
  }
};
module.exports = {
  findPatient,
  findProfessional,
  displayPersonalInfo,
  displayPatientInfo,
};
