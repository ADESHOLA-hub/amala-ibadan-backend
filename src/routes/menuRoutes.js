const requireAuth = require('../middleware/requireAuth');
const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  toggleAvailability,
} = require('../controllers/menuController');

// Public — anyone can view the menu
router.get('/', getAllItems);
router.get('/:id', getItemById);

// Protected — only logged-in admin can change the menu
router.post('/', requireAuth, createItem);
router.put('/:id', requireAuth, updateItem);
router.delete('/:id', requireAuth, deleteItem);
router.patch('/:id/availability', requireAuth, toggleAvailability);

module.exports = router;
