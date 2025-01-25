const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectdb;
