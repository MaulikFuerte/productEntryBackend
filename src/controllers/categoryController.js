const Category = require('../models/category');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name, image } = req.body; // Accept 'image' as a string from the request body
        if (!name) return res.status(400).json({ error: 'Category name is required' });
        if (!image) return res.status(400).json({ error: 'Image URL is required' });

        // Create the new category
        const category = new Category({
            name,
            image, // Save the image URL or string directly
        });

        await category.save();
        cache.del('all-categories');
        res.status(201).json({ message: 'Category created successfully', success: true, category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// // Get all categories with pagination
// exports.getAllCategories = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const startIndex = (page - 1) * limit;

//         // Fetch categories with pagination
//         const categories = await Category.find()
//             .skip(startIndex) // Skip documents for the current page
//             .limit(limit); // Limit the number of documents

//         // Get total count of documents for pagination info
//         const totalCategories = await Category.countDocuments();

//         // Prepare the response
//         res.status(200).json({
//             success: true,
//             data: categories,
//             currentPage: page,
//             totalPages: Math.ceil(totalCategories / limit), // Calculate total pages
//             totalCategories, // Total number of categories
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: error.message,
//         });
//     }
// };

// // Get all categories without pagination
// exports.getAllCategories = async (req, res) => {
//     try {
//         // Fetch all categories
//         const categories = await Category.find();

//         // Prepare the response
//         res.status(200).json({
//             success: true,
//             data: categories,
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: error.message,
//         });
//     }
// };

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 2 * 60 * 60 }); // Cache expires in 2 hours

// Get all categories without pagination
exports.getAllCategories = async (req, res) => {
    try {
        const cacheKey = 'all-categories';
        
        // Check cache for categories
        const cachedCategories = cache.get(cacheKey);
        if (cachedCategories) {
            return res.status(200).json({ success: true, data: cachedCategories });
        }

        // Fetch categories from the database
        const categories = await Category.find();
        
        // Store the response in the cache
        cache.set(cacheKey, categories);

        // Send response
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Search categories by name
exports.searchCategories = async (req, res) => {
    try {
        const { query } = req.query; // Extract the search query from the request

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        // Perform a case-insensitive search on the name field
        const categories = await Category.find({
            name: { $regex: query, $options: "i" }, // "i" makes it case-insensitive
        });

        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
