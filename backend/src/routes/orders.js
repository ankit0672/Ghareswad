const express = require('express');
const router = express.Router();
const { protect, chefOnly, customerOnly } = require('../middleware/auth');
const {
    placeOrder,
    getMyOrders,
    getChefOrders,
    getChefStats,
    updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', protect, customerOnly, placeOrder);
router.get('/my', protect, customerOnly, getMyOrders);
router.get('/chef', protect, chefOnly, getChefOrders);
router.get('/chef/stats', protect, chefOnly, getChefStats);
router.patch('/:id/status', protect, chefOnly, updateOrderStatus);

module.exports = router;
