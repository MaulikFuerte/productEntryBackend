const express = require('express');
const { createBrand, getAllBrands } = require('../controllers/brandController');
const router = express.Router();

router.post('/', createBrand); // Create brand
router.get('/', getAllBrands); // Get all brands

module.exports = router;
