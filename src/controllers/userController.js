const User = require("../models/user"); // Adjust the path if necessary
const Otp = require("../models/otp");

const crypto = require('crypto');
const bcrypt = require("bcrypt");

const { sendOtpMail } = require('../util/mailer');

// Registration handler
exports.registerUser = async (req, res) => {
  const { name, number, email, password } = req.body;

  try {
    
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.otpVerified) {
        return res.status(400).json({ msg: "Email not verified. Please verify your email before signing up." });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({ name, number, email, password });
    await newUser.save();
    await Otp.deleteOne({ email });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Success response
    res.status(200).json({
      message: "Login successful.",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login.", error: error.message });
  }
};


// Sending OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with the same email already exists!" });
    }

    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      return res.status(200).json({ msg: "Verification in progress. Please check your email for OTP." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    let otpRecord = new Otp({
      email,
      otp,
      otpExpires,
      otpVerified: false
    });

    await otpRecord.save();
    sendOtpMail(email, otp);

    res.json({ msg: "OTP sent to your email. Please verify to complete the sign-up." });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    otpRecord.otpVerified = true;
    await otpRecord.save();

    res.json({ msg: "Email verified successfully." });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ msg: "User not found. Please sign up first." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    otpRecord.otp = otp;
    otpRecord.otpExpires = otpExpires;

    await otpRecord.save();
    sendOtpMail(email, otp);

    res.json({ msg: "OTP resent successfully. Please check your email." });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
