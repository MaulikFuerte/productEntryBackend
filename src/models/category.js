const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        image: { type: String, required: true }, // Change from Buffer to String
    },
    { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
