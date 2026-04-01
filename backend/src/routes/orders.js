const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrder,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStatistics,
  getDashboardAnalytics,
  markPaymentReceived
} = require('../controllers/orderController');

// Create order (checkout) - requires authentication
router.post('/create', protect, createOrder);

// Get user's orders - requires authentication
router.get('/my-orders', protect, getUserOrders);

// Get specific order - requires authentication
router.get('/:orderId', protect, getOrder);

// Track order by tracking number - public (no auth required)
router.get('/track/:trackingNumber', trackOrder);

// Update order status - admin only
router.put('/:orderId/status', protect, admin, updateOrderStatus);

// Cancel order - user can cancel their own, admin can cancel any
router.put('/:orderId/cancel', protect, cancelOrder);

// Get all orders - admin only
router.get('/admin/all-orders', protect, admin, getAllOrders);

// Get order statistics - admin only
router.get('/admin/statistics', protect, admin, getOrderStatistics);

// Get dashboard analytics - admin only
router.get('/admin/dashboard', protect, admin, getDashboardAnalytics);

// Mark payment as received - admin only
router.put('/:orderId/mark-payment', protect, admin, markPaymentReceived);

module.exports = router;
