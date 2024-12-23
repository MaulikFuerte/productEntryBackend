const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    otpVerified: { type: Boolean, default: false },
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
