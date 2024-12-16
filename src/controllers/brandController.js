const Brand = require('../models/brand');

// Create a new brand
exports.createBrand = async (req, res) => {
    try {
        const { name, image } = req.body; // Accept image as a string

        if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
        }

        if (!image) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const brand = new Brand({ name, image });
        await brand.save();

        res.status(201).json({
            message: 'Brand created successfully',
            success: true, brand
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all brands
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json({
            success: true, brands
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
