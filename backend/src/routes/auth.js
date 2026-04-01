const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, getAllUsers, getUserStatistics, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Admin routes
router.get('/admin/users', protect, admin, getAllUsers);
router.get('/admin/users-stats', protect, admin, getUserStatistics);

module.exports = router;
