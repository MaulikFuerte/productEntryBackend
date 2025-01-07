const express = require('express');
const { createCategory, getAllCategories, searchCategories } = require('../controllers/categoryController');

const router = express.Router();

// Create category with an image URL
router.post('/', createCategory);
router.get('/', getAllCategories); // Get all categories
router.get('/search', searchCategories);

module.exports = router;
