import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
    firstname: String,
    lastname: String,
    mobile: Number,
    password: String,
});

const User = mongoose.model('User', userSchema);

export default User;