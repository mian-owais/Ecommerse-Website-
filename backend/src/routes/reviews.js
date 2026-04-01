const express = require('express');
const router = express.Router();
const { getProductReviews, submitReview, markHelpful } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/product/:productId/submit', protect, submitReview);
router.put('/:reviewId/helpful', protect, markHelpful);

module.exports = router;
