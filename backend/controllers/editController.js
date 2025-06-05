const Patient = require("../models/patient");
const Professional = require("../models/professional");
const Admin = require("../models/admin");

const edit_patient = async (req, res) => {
  const { email, ...formData } = req.body;

  // Validate email presence
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required to identify user",
    });
  }

  try {
    // Validate which fields are being updated
    const updateFields = {};

    if (formData.firstname) updateFields.firstname = formData.firstname;
    if (formData.lastname) updateFields.lastname = formData.lastname;
    if (formData.number) updateFields.number = formData.number;
    if (formData.gender) updateFields.gender = formData.gender;
    if (formData.birthdate) updateFields.birthdate = formData.birthdate;
    if (formData.user_status) updateFields.user_status = formData.user_status;

    // Check if any valid fields were provided
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Update the patient
    const result = await Patient.findOneAndUpdate(
      { email }, // Filter by email
      { $set: updateFields }, // Update only provided fields
      { new: true, runValidators: true } // Return updated doc and run schema validators
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with the provided email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patient information updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating patient information:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update patient information",
      error: error.message,
    });
  }
};

const edit_password = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  // Validate input
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, current password, and new password are required",
    });
  }

  try {
    // Check all collections for the user
    let user =
      (await Patient.findOne({ email })) ||
      (await Professional.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password using bcrypt compare
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent setting same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const edit_professional = async (req, res) => {
  const { originalEmail, ...formData } = req.body;

  // Validate email presence
  if (!originalEmail) {
    return res.status(400).json({
      success: false,
      message: "Original email is required to identify professional",
    });
  }

  try {
    // Validate which fields are being updated
    const updateFields = {};

    if (formData.name) updateFields.name = formData.name;
    if (formData.email) updateFields.email = formData.email;
    if (formData.number) updateFields.number = formData.number;
    if (formData.profession) updateFields.profession = formData.profession;
    if (formData.specialization) updateFields.specialization = formData.specialization;
    if (formData.consultationMethod) updateFields.consultationMethod = formData.consultationMethod;
    if (formData.user_status) updateFields.user_status = formData.user_status;

    // Check if any valid fields were provided
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Update the professional
    const result = await Professional.findOneAndUpdate(
      { email: originalEmail }, // Filter by original email
      { $set: updateFields }, // Update only provided fields
      { new: true, runValidators: true } // Return updated doc and run schema validators
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Professional not found with the provided email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Professional information updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating professional information:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update professional information",
      error: error.message,
    });
  }
};

module.exports = {
  edit_patient,
  edit_password,
  edit_professional,
};
