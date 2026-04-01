const Order = require('../models/Order');
const User = require('../models/User');
const otpService = require('../services/otpService');
const { PAYMENT_METHODS, PAYMENT_STATUSES } = require('../config/paymentConfig');
const fs = require('fs');
const path = require('path');

/**
 * Initialize online payment - Send payment details and OTP
 */
exports.initializePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, phoneNumber } = req.body;
    const userId = req.user.id;

    // Validate payment method
    if (!['easypaisa', 'jazzcash', 'bank-transfer'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Get payment configuration
    const paymentConfig = PAYMENT_METHODS[paymentMethod.toUpperCase().replace('-', '_')];
    if (!paymentConfig) {
      return res.status(400).json({
        success: false,
        message: 'Payment method not available'
      });
    }

    //Update order with payment details
    order.paymentMethod = paymentMethod;
    order.onlinePaymentDetails = {
      phoneNumber: phoneNumber || paymentConfig.accountNumber,
      accountNumber: paymentConfig.accountNumber,
      bankName: paymentConfig.bankName || '',
      accountHolderName: paymentConfig.accountName,
      amount: order.totalPrice,
      paymentReference: `ORD-${order._id.toString().slice(-6)}`
    };

    // Send OTP
    const otpResult = await otpService.sendOTP(
      order.shippingAddress.email,
      orderId,
      phoneNumber || paymentConfig.accountNumber
    );

    order.otpVerification = {
      otpSent: true,
      otpVerified: false,
      otpAttempts: 0,
      otpSentAt: new Date()
    };

    order.paymentStatus = 'awaiting-screenshot'; // Will move to this after OTP verification
    await order.save();

    res.json({
      success: true,
      message: 'Payment initialized. OTP sent successfully.',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentInfo: {
          method: paymentMethod,
          amount: order.totalPrice,
          accountNumber: paymentConfig.accountNumber,
          accountName: paymentConfig.accountName,
          bankName: paymentConfig.bankName || 'N/A',
          iban: paymentConfig.iban || 'N/A'
        },
        otpInfo: {
          expiresIn: otpResult.expiresIn,
          maskedContact: otpResult.maskedContact,
          note: `OTP has been sent to ${otpResult.maskedContact}`
        }
      }
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Verify OTP for payment
 */
exports.verifyPaymentOTP = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const userId = req.user.id;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify OTP
    const verificationResult = otpService.verifyOTP(
      order.shippingAddress.email,
      orderId,
      otp
    );

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        remainingAttempts: verificationResult.remainingAttempts
      });
    }

    // Update order after successful OTP verification
    order.otpVerification.otpVerified = true;
    order.otpVerification.otpVerifiedAt = new Date();
    order.paymentStatus = PAYMENT_STATUSES.AWAITING_SCREENSHOT;
    await order.save();

    res.json({
      success: true,
      message: 'OTP verified successfully. Please upload payment screenshot.',
      data: {
        orderId: order._id,
        nextStep: 'upload-screenshot',
        instruction: 'Upload a screenshot of your payment confirmation'
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Resend OTP
 */
exports.resendPaymentOTP = async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;
    const userId = req.user.id;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Resend OTP
    const otpResult = await otpService.resendOTP(
      order.shippingAddress.email,
      orderId,
      phoneNumber
    );

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        expiresIn: otpResult.expiresIn,
        maskedContact: otpResult.maskedContact
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Upload payment screenshot
 */
exports.uploadPaymentScreenshot = async (req, res) => {
  try {
    const { orderId, paymentReference } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No screenshot file provided'
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Verify OTP was verified
    if (!order.otpVerification || !order.otpVerification.otpVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify OTP first'
      });
    }

    // Verify file is valid image
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validMimes.includes(req.file.mimetype)) {
      // Delete uploaded file if invalid
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG and PNG allowed.'
      });
    }

    // Check file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }

    // Update order with screenshot
    const screenshotUrl = `/uploads/${req.file.filename}`;
    order.paymentScreenshot = {
      url: screenshotUrl,
      fileName: req.file.filename,
      uploadedAt: new Date(),
      verifiedByAdmin: false
    };

    order.paymentStatus = PAYMENT_STATUSES.SCREENSHOT_UPLOADED;

    // Add payment reference if provided
    if (paymentReference) {
      order.onlinePaymentDetails.paymentReference = paymentReference;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment screenshot uploaded successfully. Admin will verify your payment shortly.',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        screenshotUrl,
        status: 'pending-verification',
        note: 'Your order is awaiting admin verification of the payment screenshot.'
      }
    });
  } catch (error) {
    console.error('Screenshot upload error:', error);

    // Delete uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get payment details for an order (user view)
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Get payment configuration
    const paymentMethod = order.paymentMethod;
    const paymentConfig = PAYMENT_METHODS[paymentMethod.toUpperCase().replace('-', '_')] || {};

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentMethod,
        paymentStatus: order.paymentStatus,
        amount: order.totalPrice,
        paymentDetails: order.onlinePaymentDetails,
        paymentConfig: {
          accountNumber: paymentConfig.accountNumber,
          accountName: paymentConfig.accountName,
          bankName: paymentConfig.bankName || 'N/A',
          iban: paymentConfig.iban || 'N/A'
        },
        otpVerification: {
          otpSent: order.otpVerification?.otpSent || false,
          otpVerified: order.otpVerification?.otpVerified || false
        },
        screenshot: order.paymentScreenshot?.url || null,
        screenshotUploadedAt: order.paymentScreenshot?.uploadedAt || null
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Admin: Verify payment screenshot and confirm order
 */
exports.verifyPaymentScreenshot = async (req, res) => {
  try {
    const { orderId, verified, notes } = req.body;
    const adminId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.paymentScreenshot) {
      return res.status(400).json({
        success: false,
        message: 'No payment screenshot found'
      });
    }

    // Update screenshot verification
    order.paymentScreenshot.verifiedByAdmin = verified;
    order.paymentScreenshot.adminVerificationDate = new Date();
    order.paymentScreenshot.adminNotes = notes || '';

    if (verified) {
      order.paymentStatus = PAYMENT_STATUSES.VERIFIED;
      order.paymentReceived = true;
      order.orderStatus = 'processing';
    } else {
      order.paymentStatus = 'failed';
      order.paymentReceived = false;
    }

    await order.save();

    res.json({
      success: true,
      message: verified ? 'Payment verified successfully' : 'Payment rejected',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get payment methods configuration (public)
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const methods = Object.entries(PAYMENT_METHODS).map(([key, config]) => ({
      id: key.toLowerCase().replace('_', '-'),
      name: config.name,
      icon: config.icon,
      minAmount: config.minAmount,
      maxAmount: config.maxAmount,
      description: config.description
    }));

    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
