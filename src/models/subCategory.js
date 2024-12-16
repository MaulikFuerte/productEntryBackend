const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        image: { type: String, required: true }, // Change from Buffer to String
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SubCategory', subCategorySchema);
