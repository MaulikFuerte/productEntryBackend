const express = require("express");
const companyController = require("../controllers/companyController");

const router = express.Router();

// Routes for companies
router.post("/", companyController.addCompany); // Add a new company
router.get("/", companyController.getCompanies); // Get all companies
router.get("/:id", companyController.getCompanyById); // Get a specific company by ID
router.post("/login", companyController.loginCompany); // Login for a company
router.get("/:companyId/items", companyController.getCompanyItems); // Get all items for a specific company

module.exports = router;
