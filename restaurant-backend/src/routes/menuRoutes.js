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

router.get('/', getAllItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.patch('/:id/availability', toggleAvailability);

module.exports = router;
