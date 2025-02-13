const jwt = require("jsonwebtoken");

const Patient = require("../models/patient");
const Professional = require("../models/professional");

const patientSignup = async (req, res) => {
  const { email, firstname, lastname, mobile, gender, birthdate, password } =
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
    mobile,
    gender: gender_string,
    birthdate: date_object,
    password,
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
  const { email, firstname, lastname, mobile, gender, birthdate, password } =
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
    mobile,
    gender: gender_string,
    birthdate: date_object,
    password,
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
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    let user = await Patient.findOne({ email });

    if (!user) {
      user = await Professional.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (password !== user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const userType = user instanceof Patient ? "Patient" : "Professional";
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        gender: user.gender,
        name: user.firstname,
        userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log(user.gender);
    res.status(200).json({
      message: "Login successful",
      userType,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { patientSignup, login, professionalSignup };
