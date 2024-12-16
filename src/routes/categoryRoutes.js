const express = require('express');
const { createCategory, getAllCategories } = require('../controllers/categoryController');

const router = express.Router();

// Create category with an image URL
router.post('/', createCategory);
router.get('/', getAllCategories); // Get all categories

module.exports = router;
