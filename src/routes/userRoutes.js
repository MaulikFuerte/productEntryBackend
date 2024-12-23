const express = require("express");
const { registerUser, loginUser, sendOtp, verifyOtp, resendOtp } = require('../controllers/userController'); // Adjust path if necessary

const router = express.Router();

// Registration route
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/resendOtp", resendOtp);

module.exports = router;
