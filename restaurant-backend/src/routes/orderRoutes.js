const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} = require('../controllers/orderController');

router.get('/stats', getOrderStats);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', cancelOrder);

module.exports = router;
