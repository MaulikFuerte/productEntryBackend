const Order = require('../models/order'); // Adjust the path to your Order model
const Item = require('../models/itemModel'); // Import Item model

const mongoose = require('mongoose');

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
    // getOrderById: async (req, res) => {
    //     try {
    //         const order = await Order.findById(req.params.id).populate('items.item');
    //         if (!order) {
    //             return res.status(404).json({ success: false, message: 'Order not found' });
    //         }
    //         return res.status(200).json({ success: true, data: order });
    //     } catch (error) {
    //         return res.status(500).json({ success: false, message: error.message });
    //     }
    // },

    // Get order by ID
    getOrderById: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id)
                .populate({
                    path: 'items.item',
                    select: '-images', // Exclude the `images` field to avoid fetching large data
                });

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Assign an empty array to the `images` field for each item
            order.items.forEach(orderItem => {
                if (orderItem.item) {
                    orderItem.item.images = []; // Replace the `images` field with an empty array
                }
            });

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
    },


    getOrdersByCompanyId: async (req, res) => {
        try {
            const { companyId } = req.params;

            // Validate companyId
            if (!mongoose.Types.ObjectId.isValid(companyId)) {
                return res.status(400).json({ success: false, message: 'Invalid company ID' });
            }

            const orders = await Order.aggregate([
                {
                    $lookup: {
                        from: 'items', // The name of the Item collection
                        localField: 'items.item',
                        foreignField: '_id',
                        as: 'itemDetails',
                        pipeline: [
                            {
                                $match: {
                                    companyId: new mongoose.Types.ObjectId(companyId),
                                },
                            },
                            { $limit: 1 }, // Stop search after finding the first match
                        ],
                    },
                },
                {
                    $match: {
                        'itemDetails.0': { $exists: true }, // Ensure at least one match exists in itemDetails
                    },
                },
                {
                    $project: {
                        itemDetails: 0, // Exclude itemDetails if not needed
                    },
                },
            ]);

            return res.status(200).json({ success: true, data: orders });
        } catch (error) {
            console.error('Error fetching orders by company ID:', error.message);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    
    // Filter orders
    filterOrders: async (req, res) => {
        try {
            const { startDate, endDate, address, userName, status, orderIds } = req.query;

            // Ensure orderIds is an array
            const orderIdArray = orderIds ? orderIds.split(',') : null;

            // Build the filter object
            const filter = {};

            // Filter by provided orderIds if available
            if (orderIdArray) {
                filter._id = { $in: orderIdArray }; // Only include orders matching these IDs
            }

            // Filter by date range if provided
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) {
                    filter.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    filter.createdAt.$lte = new Date(endDate);
                }
            }

            // Combined search for city and address
            if (address) {
                filter.$or = [
                    { city: new RegExp(address, 'i') }, // Case-insensitive match in `city`
                    { orderAddress: new RegExp(address, 'i') } // Case-insensitive match in `orderAddress`
                ];
            }

            // Filter by user name if provided
            if (userName) {
                filter.userName = new RegExp(userName, 'i'); // Case-insensitive match
            }

            // Filter by status if provided
            if (status) {
                filter.status = status;
            }

            // Query the database with the filters
            const orders = await Order.find(filter);

            // Return the filtered results
            return res.status(200).json({ success: true, data: orders });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

};

module.exports = orderController;

// const orders = await Order.find(filter).populate('items.item');