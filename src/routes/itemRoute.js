const express = require('express');
const itemController = require('../controllers/itemController');
const multer = require('multer');

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Routes for items
router.post('/', itemController.uploadImages, itemController.createItem);
router.get('/', itemController.getAllItems);
router.get('/:companyId', itemController.getAllItemsByCompanyId);
router.get('/item/:id', itemController.getItemById);
router.put('/:id', upload.array('images'), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

// Search & Filter
router.get('/filter/search', itemController.searchItems);

module.exports = router;
