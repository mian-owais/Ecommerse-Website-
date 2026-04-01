const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/auth');
const {
  initializePayment,
  verifyPaymentOTP,
  resendPaymentOTP,
  uploadPaymentScreenshot,
  getPaymentDetails,
  verifyPaymentScreenshot,
  getPaymentMethods
} = require('../controllers/paymentController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for payment screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.get('/methods', getPaymentMethods);

// Protected user routes
router.post('/initialize', protect, initializePayment);
router.post('/verify-otp', protect, verifyPaymentOTP);
router.post('/resend-otp', protect, resendPaymentOTP);
router.post('/upload-screenshot', protect, upload.single('screenshot'), uploadPaymentScreenshot);
router.get('/:orderId', protect, getPaymentDetails);

// Admin routes
router.put('/:orderId/verify-screenshot', protect, admin, verifyPaymentScreenshot);

module.exports = router;
