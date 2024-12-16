const SubCategory = require('../models/subCategory');
const Category = require('../models/category');
const mongoose = require("mongoose");

// Create a new subcategory
exports.createSubCategory = async (req, res) => {
    try {
        const { name, categoryId, image } = req.body; // Accept 'image' as a string

        if (!name || !categoryId || !image) {
            return res.status(400).json({ error: 'Name, categoryId, and image are required' });
        }

        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const subCategory = new SubCategory({
            name,
            image, // Store the image string (e.g., a URL)
            categoryId
        });
        await subCategory.save();

        res.status(201).json({ message: 'SubCategory created successfully', success: true, subCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('categoryId');
        res.status(200).json({
            success: true, subCategories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all subcategories filtered by categoryId
exports.getSubCategories = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'categoryId is required',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid categoryId',
            });
        }

        const subCategories = await SubCategory.find({ categoryId }).populate('categoryId');

        res.status(200).json({
            success: true,
            data: subCategories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};