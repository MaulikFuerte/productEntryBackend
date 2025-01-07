const Brand = require('../models/brand');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 2 * 60 * 60 }); // Cache expires in 2 hours

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
        cache.del('all-brands');
        res.status(201).json({
            message: 'Brand created successfully',
            success: true, brand
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// // Get all brands
// exports.getAllBrands = async (req, res) => {
//     try {
//         const brands = await Brand.find();
//         res.status(200).json({
//             success: true, brands
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };



// Get all brands
exports.getAllBrands = async (req, res) => {
    try {
        const cacheKey = 'all-brands';

        // Check cache for brands
        const cachedBrands = cache.get(cacheKey);
        if (cachedBrands) {
            return res.status(200).json({ success: true, brands: cachedBrands });
        }

        // Fetch brands from the database
        const brands = await Brand.find();

        // Store the response in the cache
        cache.set(cacheKey, brands);

        res.status(200).json({
            success: true,
            brands,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};