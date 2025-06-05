const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} = require("./jwtController");

const Patient = require("../models/patient");
const Professional = require("../models/professional");
const Admin = require("../models/admin");

const patientSignup = async (req, res) => {
  const { email, firstname, lastname, number, gender, birthdate, password } =
    req.body;

  let gender_string = null;

  if (gender === "0") {
    gender_string = "male";
  } else if (gender === "1") {
    gender_string = "female";
  } else if (gender === "2") {
    gender_string = "others";
  } else {
    return res.status(400).json({ message: "Invalid gender value" });
  }

  const date_parse = Date.parse(birthdate);
  const date_object = new Date(date_parse);

  const newPatient = new Patient({
    email,
    firstname,
    lastname,
    number,
    gender: gender_string,
    birthdate: date_object,
    password,
    user_status: "active",
  });

  try {
    await newPatient.save();
    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error registering user");
  }
};

const professionalSignup = async (req, res) => {
  const { email, firstname, lastname, number, gender, birthdate, password } =
    req.body;

  let gender_string = null;

  if (gender === "0") {
    gender_string = "male";
  } else if (gender === "1") {
    gender_string = "female";
  } else if (gender === "2") {
    gender_string = "others";
  } else {
    return res.status(400).json({ message: "Invalid gender value" });
  }

  const date_parse = Date.parse(birthdate);
  const date_object = new Date(date_parse);

  const newProfessional = new Professional({
    email,
    firstname,
    lastname,
    number,
    gender: gender_string,
    birthdate: date_object,
    password,
    user_status: "active",
  });

  console.log(newProfessional);
  try {
    await newProfessional.save();
    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error registering user");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    let user;
    let userType;

    // Try to find in Admin
    user = await Admin.findOne({ email });
    if (user) {
      userType = "Admin";
    } else {
      // Try Patient
      user = await Patient.findOne({ email });
      if (user) {
        userType = "Patient";
        // Check if patient is blocked
        if (user.user_status === "blocked") {
          return res.status(403).json({ 
            message: "Your account has been blocked. Please contact support for assistance." 
          });
        }
      } else {
        // Try Professional
        user = await Professional.findOne({ email });
        if (user) {
          userType = "Professional";
          // Check if professional is blocked
          if (user.user_status === "blocked") {
            return res.status(403).json({ 
              message: "Your account has been blocked. Please contact support for assistance." 
            });
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password using the method defined in the schema
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userData = {
      id: user._id,
      email: user.email,
      userType,
    };

    // Generate tokens
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    res.status(200).json({
      message: "Login successful",
      userType,
      token: accessToken,
      refreshToken,
      user: {
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        number: user.number || "",
        email: user.email,
        gender: user.gender || "",
        birthdate: user.birthdate || "",
        status: user.verification || "",
        user_status: user.user_status || "active"
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  // Verify the refresh token
  const userData = verifyRefreshToken(refreshToken);
  if (!userData) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }

  // Extract only necessary user data without exp property
  const newUserData = {
    id: userData.id,
    email: userData.email,
    userType: userData.userType
  };

  // Generate new tokens with clean user data
  const newAccessToken = generateAccessToken(newUserData);
  const newRefreshToken = generateRefreshToken(newUserData);

  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

const forget_password = async (req, res) => {
  const { email, newPassword } = req.body;

  // Validate input
  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Kuch to gayab hey daya",
    });
  }

  try {
    // Check both collections for the user
    let user =
      (await Patient.findOne({ email })) ||
      (await Professional.findOne({ email }));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { 
  patientSignup, 
  login, 
  professionalSignup, 
  forget_password,
  refreshToken 
};
