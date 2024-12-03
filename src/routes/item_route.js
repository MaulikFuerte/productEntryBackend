const express = require('express');
const itemController = require('../controllers/item_controller');
const multer = require('multer');

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Routes for items
router.post('/', itemController.uploadImages, itemController.createItem);
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', upload.array('images'), itemController.updateItem);  
router.delete('/:id', itemController.deleteItem);

// Combined route for modifying images (update/delete)
router.put('/:id/images/:imageIndex', upload.single('image'), itemController.modifyImage); // Combined update/delete

module.exports = router;
