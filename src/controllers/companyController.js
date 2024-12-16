const Company = require("../models/companyModel");
const bcrypt = require("bcrypt");

// Add a new company
exports.addCompany = async (req, res) => {
  try {
    const { name, email, number, gstNumber, cinNumber, password } = req.body;
    
    const newCompany = new Company({
      name,
      email,
      number,
      gstNumber,
      cinNumber,
      password,
    });

    const savedCompany = await newCompany.save();
    res.status(201).json({ message: "Company added successfully!", data: savedCompany });
  } catch (error) {
    res.status(400).json({ message: "Error adding company.", error: error.message });
  }
};

// Login company
exports.loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find company by email
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, company.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Success response
    res.status(200).json({
      message: "Login successful.",
      data: {
        companyId: company._id,
        name: company.name,
        email: company.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login.", error: error.message });
  }
};

// Get all companies with pagination
exports.getCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const startIndex = (page - 1) * limit;

    // Fetch companies with pagination
    const companies = await Company.find()
      .skip(startIndex) // Skip documents for the current page
      .limit(limit); // Limit the number of documents

    // Get total count of documents for pagination info
    const totalCompanies = await Company.countDocuments();

    res.status(200).json({
      data: companies,
      currentPage: page,
      totalPages: Math.ceil(totalCompanies / limit),
      totalCompanies,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching companies.",
      error: error.message,
    });
  }
};

// Fetch a specific company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    res.status(200).json({ data: company });
  } catch (error) {
    res.status(500).json({ message: "Error fetching company.", error: error.message });
  }
};

// Fetch all items for a specific company
exports.getCompanyItems = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const items = await Item.find({ companyId });
    res.status(200).json({ company, items });
  } catch (error) {
    res.status(500).json({ message: "Error fetching items for company.", error: error.message });
  }
};
