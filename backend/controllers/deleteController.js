const Patient = require("../models/patient");
const Professional = require("../models/professional");

const delete_patient = async (req, res) => {
  try {
    const { patientEmail } = req.params;

    const result = await Patient.findOneAndDelete(patientEmail);
    if (!result)
      return res.status(404).json({ message: "Failed to delete patients" });

    res.status(200).json({ message: "successfully deleted patient" });
  } catch (error) {
    console.log("Error while deleting the patient");
    res.status(500).json({ message: "Error finding patient", error });
  }
};

const delete_professional = async (req, res) => {
  try {
    const { professionalEmail } = req.params;

    const result = await Professional.findOneAndDelete(professionalEmail);
    if (!result)
      return res.status(404).json({ message: "Failed to delete professional" });

    res.status(200).json({ message: "successfully deleted professional" });
  } catch (error) {
    console.log("Error while deleting the professional");
    res.status(500).json({ message: "Error finding professional", error });
  }
};

module.exports = { delete_patient, delete_professional };
