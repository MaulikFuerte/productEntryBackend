const mongoose = require('mongoose');

// Define the schema
const itemSchema = new mongoose.Schema({
    size: { type: String, required: true }, // e.g., "10 cm", "5 kg", "2 liters"
    brand: { type: String, required: true },
    color: { type: String, required: false }, // Optional
    category: { type: String, required: true },
    name: { type: String, required: true },
    about: { type: String, required: true },
    price: { type: Number, required: true }, // Price in numeric format
    material: { type: String, required: false }, // Optional
    modelNameOrNumber: { type: String, required: false }, // Optional
    type: { type: String, required: false }, // Optional
    images: { type: [Buffer], required: false }, // Array of binary image data
    createdAt: { type: Date, default: Date.now }, // Automatically set on creation
    updatedAt: { type: Date, default: Date.now }, // Updated manually
});

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
