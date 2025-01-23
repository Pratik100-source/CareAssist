const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    firstname: String,
    lastname: String,
    mobile: Number,
    password: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
