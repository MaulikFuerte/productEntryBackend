const express = require('express');
const { createSubCategory, getAllSubCategories, getSubCategories } = require('../controllers/subCategoryController');
const router = express.Router();

router.post('/', createSubCategory); // Create subcategory
router.get('/', getAllSubCategories); // Get all subcategories
router.get('/:categoryId', getSubCategories); // Get all subcategories filtered by categoryId

module.exports = router;
