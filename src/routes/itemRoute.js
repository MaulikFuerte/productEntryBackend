const express = require('express');
const itemController = require('../controllers/itemController');
const multer = require('multer');

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Routes for items
// router.post('/', itemController.uploadImages, itemController.createItem);
router.post('/', itemController.createItem);
router.get('/', itemController.getAllItems);
router.get('/:companyId', itemController.getAllItemsByCompanyId);
router.put('/:id',itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

// fetch specific item
router.get('/item/:id', itemController.getItemById);
router.get('/itemName/:name', itemController.getItemByName);

// Search & Filter
router.get('/filter/search', itemController.searchItems);

module.exports = router;
