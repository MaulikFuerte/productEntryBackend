const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); // Adjust path as needed

// Routes for orders
router.post('/', orderController.createOrder); // Create a new order
router.get('/', orderController.getAllOrders); // Get all orders
router.get('/:id', orderController.getOrderById); // Get order by ID
router.put('/:id', orderController.updateOrder); // Update order by ID
router.delete('/:id', orderController.deleteOrder); // Delete order by ID

module.exports = router;
