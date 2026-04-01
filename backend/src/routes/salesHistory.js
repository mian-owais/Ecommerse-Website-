const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  generateDailySalesHistory,
  getSalesHistory,
  getSalesHistorySummary
} = require('../controllers/salesHistoryController');

// Generate daily sales history (admin only)
router.post('/generate', protect, admin, generateDailySalesHistory);

// Get sales history for last 30 days (admin only)
router.get('/list', protect, admin, getSalesHistory);

// Get sales history summary (admin only)
router.get('/summary', protect, admin, getSalesHistorySummary);

module.exports = router;
