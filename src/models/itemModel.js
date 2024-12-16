const mongoose = require('mongoose');

// Define the schema
const itemSchema = new mongoose.Schema({
    companyId: { type:  mongoose.Schema.Types.ObjectId, ref : "Company", required: true },
    name: { type: String, required: true },
    about: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId,ref: 'Category', required: true }, // Store Object ID as a string
    subCategory: { type: mongoose.Schema.Types.ObjectId,ref: 'SubCategory', required: false }, // Store Object ID as a string (optional)
    brand: { type: mongoose.Schema.Types.ObjectId,ref: 'Brand', required: true }, // Store Object ID as a string
    size: { type: String, required: true }, // e.g., "10 cm", "5 kg", "2 liters"
    color: { type: String, required: false }, // Optional
    price: { type: Number, required: true }, // Selling price
    costPrice: { type: Number, required: false }, // Cost price
    sellingPrice: { type: Number, required: false }, // Cost price
    quantity: { type: Number, required: false }, // Total quantity in stock
    minQuantity: { type: Number, required: false }, // Minimum quantity threshold
    maxQuantity: { type: Number, required: false }, // Maximum allowable quantity (optional)
    type: { type: String, required: false }, // Optional
    images: { type: [Buffer], required: false },
    updatedAt: { type: Date, default: Date.now }, // Updated manually  
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
