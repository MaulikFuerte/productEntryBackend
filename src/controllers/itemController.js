const Item = require('../models/itemModel');
const multer = require('multer');

const mongoose = require('mongoose');


// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new item
exports.createItem = async (req, res) => {
    try {
        const item = new Item(req.body);

        // Log the entire item object as a plain object
        //  console.log('Received item:', item.toObject ? item.toObject() : item);


        // If images are uploaded
        if (req.files && req.files.length > 0) {
            item.images = req.files.map(file => file.buffer); // Store images as binary data
        }
        // Save the item to the database
        const savedItem = await item.save(); // Call save() and assign it to savedItem

        if (savedItem) {
            cache.flushAll(); // Clear the cache only if the item is successfully saved
            return res.status(201).json({ success: true, data: savedItem }); // Return a 201 status
        } else {
            return res.status(400).json({ success: false, message: 'Item could not be saved' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// get all items
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 2 * 60 * 60 }); // Cache expires in 5 minutes

exports.getAllItems = async (req, res) => {
    try {
        // cache.flushAll(); // Clear the cache
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        // Generate a unique cache key based on query parameters
        const cacheKey = `items-page-${page}-limit-${limit}`;

        // Check if data is in the cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData); // Return cached response
        }

        // Fetch items from the database
        const items = await Item.find().skip(startIndex).limit(limit);

        const totalItems = await Item.countDocuments();

        const response = {
            success: true,
            data: items,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                hasNextPage: page < Math.ceil(totalItems / limit),
                hasPrevPage: page > 1,
            },
        };

        // Store the response in the cache
        cache.set(cacheKey, response);

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// get all items
exports.getAllItemsByCompanyId = async (req, res) => {
    try {
        // Get page, limit from query parameters (default: page 1, limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const companyId = req.params.companyId; // Get companyId from the URL path

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'companyId is required',
            });
        }

        // Validate and convert companyId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid companyId',
            });
        }

        // Convert companyId to ObjectId
        const objectId = new mongoose.Types.ObjectId(companyId);

        // Calculate the starting index for the current page
        const startIndex = (page - 1) * limit;

        // Build the filter object for querying
        const filter = { companyId: objectId };

        // Fetch items with pagination and filtering
        const items = await Item.find(filter).skip(startIndex).limit(limit);

        // Get total count of items for pagination info
        const totalItems = await Item.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: items,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                hasNextPage: page < Math.ceil(totalItems / limit),
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get an item by ID
exports.getItemById = async (req, res) => {
    try {
        // Get the ID from the request parameters
        const itemId = req.params.id;
        // Fetch the item from the database
        const item = await Item.findById(itemId);

        // Check if the item was found
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({
            success: true,
            data: item,
        });
    } catch (error) {
        // Handle any errors that occur during the fetch operation
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an item
exports.updateItem = async (req, res) => {
    try {
        const existingItem = await Item.findById(req.params.id);

        if (!existingItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        let updatedImages = [];

        // Retain existing images as Buffer data
        if (existingItem.images && existingItem.images.length > 0) {
            updatedImages = existingItem.images;
        }

        // Add newly uploaded images, if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.buffer); // Only keep the buffer
            updatedImages = [...updatedImages, ...newImages];
        }

        // Update the item
        const updatedItem = await Item.findOneAndUpdate(
            { _id: req.params.id },
            { ...req.body, images: updatedImages },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Failed to update item' });
        }
        cache.flushAll(); // Clear the cache
        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Delete an item
exports.deleteItem = async (req, res) => {
    try {
        const deletedItem = await Item.findOneAndDelete({ _id: req.params.id });
        if (!deletedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        cache.flushAll(); // Clear the cache
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Middleware for image uploads
exports.uploadImages = upload.array('images', 10); // Allow up to 10 images at once


// Serach & Filter APi
exports.searchItems = async (req, res) => {
    try {
        // Extract filters from query parameters
        const { name, category, subCategory, brand } = req.query;

        // Create an object to hold filter conditions
        const filters = {};

        // Add condition for name if provided
        if (name) {
            filters.name = { $regex: name, $options: 'i' }; // Case-insensitive search
        }

        // Add condition for category if provided
        if (category) {
            filters.category = new mongoose.Types.ObjectId(category);
        }
        // Add condition for subCategory if provided
        if (subCategory) {
            // Parse subCategory to handle multiple values
            const subCategories = Array.isArray(subCategory)
                ? subCategory
                : subCategory.split(','); // Accept comma-separated values
            filters.subCategory = { $in: subCategories.map(id => new mongoose.Types.ObjectId(id)) };
        }

        // Add condition for brand if provided
        if (brand) {
            // Parse brand to handle multiple values
            const brands = Array.isArray(brand) ? brand : brand.split(','); // Accept comma-separated values
            filters.brand = { $in: brands.map(id => new mongoose.Types.ObjectId(id)) };
        }

        // Find items based on the AND filter conditions
        const items = await Item.find(filters);

        res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({ success: false, message: 'An error occurred while searching items.' });
    }
};