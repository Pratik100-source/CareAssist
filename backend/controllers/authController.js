const Patient = require("../models/patient");

const patientSignup = async (req, res) => {
  const { email, firstname, lastname, mobile, password } = req.body;

  const newPatient = new Patient({
    email,
    firstname,
    lastname,
    mobile,
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

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const user = await Patient.findOne({
      email: email,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (password != user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
module.exports = { patientSignup, login };
