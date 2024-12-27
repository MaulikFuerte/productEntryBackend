const mongoose = require('mongoose');

// Define the schema
const orderSchema = new mongoose.Schema({
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'item', required: true }, // Reference to the Item model
            quantity: { type: Number, required: true, min: 1 }, // Quantity for each item
        }
    ],
    city: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderId: { type: String, required: false }, // e.g., "Standard" or "Express"
    deliveryStatus: {
        type: String,
        enum: ['Not Shipped', 'In Transit', 'Delivered'],
        default: 'Not Shipped'
    },
    isOrderCancelled: { type: Boolean, default: false },
    totalAmount: { type: Number, required: true }, // Calculated total price for the order
    userName: { type: String, required: true },
    userNumber: { type: String, required: true, match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'] },
    userEmail: { type: String, required: true, match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'] }, // New userEmail field
    orderAddress: { type: String, required: true },
    pincode: { type: String, required: true, match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode'] },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI'],
        required: true
    },
}, { timestamps: true }); // Adds `createdAt` and `updatedAt` fields automatically

// Middleware to update `updatedAt` before saving
orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware for update operations
orderSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Create the model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
