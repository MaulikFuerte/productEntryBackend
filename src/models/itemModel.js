const mongoose = require('mongoose');

// Define the schema
const itemSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    // images: { type: [Buffer], required: false },
    images: { type: [String], required: false },
    logoImage: { type: String, required: false },
    name: { type: String, required: true },
    about: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: false, default: null },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    feature: { type: String, required: false },
    bestSelling: { type: Boolean, required: false, default: false },
    discount: { type: Number, required: false, default: 0 },
    rating: { type: Number, min: 0, max: 5, required: false, default: 0 },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: false },
    sellingPrice: { type: Number, required: false },
    quantity: { type: Number, required: false },
    minQuantity: { type: Number, required: false },
    maxQuantity: { type: Number, required: false },
    type: { type: String, required: false },
    size: { type: String, required: false },
    color: { type: String, required: false },
}, { timestamps: true });

// Middleware to update `updatedAt` before saving
itemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware for update operations
itemSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Create the model
const Item = mongoose.model('item', itemSchema);

module.exports = Item;
