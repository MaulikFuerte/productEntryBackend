const express = require("express");
const { registerUser, loginUser } = require('../controllers/userController'); // Adjust path if necessary

const router = express.Router();

// Registration route
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
