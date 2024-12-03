const Item = require('../models/item');
const multer = require('multer');

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new item
exports.createItem = async (req, res) => {
    try {
        const item = new Item(req.body);

        // If images are uploaded
        if (req.files && req.files.length > 0) {
            item.images = req.files.map(file => file.buffer); // Store images as binary data
        }

        const savedItem = await item.save();
        res.status(201).json({ success: true, data: savedItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all items
exports.getAllItems = async (req, res) => {
    try {
        // Get page and limit from query parameters (default: page 1, limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the starting index for the current page
        const startIndex = (page - 1) * limit;

        // Fetch items with pagination
        const items = await Item.find().skip(startIndex).limit(limit);

        // Get total count of items for pagination info
        const totalItems = await Item.countDocuments();

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


// Update or delete a specific image from the item
exports.modifyImage = async (req, res) => {
    try {
        const itemId = req.params.id;
        const imageIndex = parseInt(req.params.imageIndex); // Convert index to integer
        const action = req.query.action; // Get action from query parameters
        let updatedItem;

        if (action === 'delete') {
            // Delete the specific image from the images array
            updatedItem = await Item.findOneAndUpdate(
                { _id: itemId },
                { $unset: { [`images.${imageIndex}`]: "" } }, // Remove the image at the specified index
                { new: true } // Return the updated document
            );
        } else if (action === 'update') {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'New image file is required for update' });
            }
            const newImageBuffer = req.file.buffer; // Get the new image buffer

            // Update the specific image in the images array
            updatedItem = await Item.findOneAndUpdate(
                { _id: itemId },
                { $set: { [`images.${imageIndex}`]: newImageBuffer } }, // Update the image at the specified index
                { new: true } // Return the updated document
            );
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action specified' });
        }

        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
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
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Middleware for image uploads
exports.uploadImages = upload.array('images', 10); // Allow up to 10 images at once
