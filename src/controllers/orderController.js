const Order = require('../models/order'); // Adjust the path to your Order model
const Item = require('../models/itemModel'); // Import Item model

// Controller methods
const orderController = {

    createOrder: async (req, res) => {
        try {
            const { items, city, deliveryMode, totalAmount, userName, userNumber, userEmail, orderAddress, pincode, paymentMethod } = req.body;

            // Validate that no item has a quantity greater than 10
            for (let orderItem of items) {
                if (orderItem.quantity > 10) {
                    return res.status(400).json({
                        success: false,
                        message: `You cannot order more than 10 units of any single item. Item ID: ${orderItem.item}`
                    });
                }
            }

            // Check and update item quantities
            for (let orderItem of items) {
                const product = await Item.findById(orderItem.item);

                if (!product) {
                    return res.status(404).json({ success: false, message: `Item with ID ${orderItem.item} not found` });
                }

                // Check if there's enough stock
                if (product.quantity < orderItem.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for item: ${product.name}. Available: ${product.quantity}, Requested: ${orderItem.quantity}`
                    });
                }

                // Deduct the ordered quantity from the item's stock
                product.quantity -= orderItem.quantity;
                await product.save(); // Save updated quantity
            }

            // Create the order
            const newOrder = new Order({
                items,
                city,
                deliveryMode,
                totalAmount,
                userName,
                userNumber,
                userEmail,
                orderAddress,
                pincode,
                paymentMethod,
            });

            // Save the order to the database
            const savedOrder = await newOrder.save();
            return res.status(201).json({ success: true, data: savedOrder });

        } catch (error) {
            console.error('Error creating order:', error.message);
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get all orders
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find().populate('items.item'); // Populate item details
            return res.status(200).json({ success: true, data: orders });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get order by ID
    getOrderById: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id).populate('items.item');
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            return res.status(200).json({ success: true, data: order });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Update order by ID
    updateOrder: async (req, res) => {
        try {
            const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            return res.status(200).json({ success: true, data: updatedOrder });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    // Delete order by ID
    deleteOrder: async (req, res) => {
        try {
            const deletedOrder = await Order.findByIdAndDelete(req.params.id);
            if (!deletedOrder) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            return res.status(200).json({ success: true, message: 'Order deleted successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = orderController;
