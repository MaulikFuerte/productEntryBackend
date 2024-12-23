const express = require("express");
const companyController = require("../controllers/companyController");

const router = express.Router();

// Routes for companies
router.post("/", companyController.addCompany); // Add a new company
router.get("/", companyController.getCompanies); // Get all companies
router.post("/login", companyController.loginCompany); // Login for a company

//fetch specific Company
router.get("/:id", companyController.getCompanyById); // Get a specific company by ID
router.get("/companyName/:name", companyController.getCompanyByName); // Get a specific company by ID

module.exports = router;
