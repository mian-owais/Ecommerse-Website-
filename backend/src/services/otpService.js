/**
 * OTP Service - Handles OTP generation, verification, and storage
 * Uses in-memory storage with expiration. In production, use Redis.
 */

const otpStore = new Map(); // Format: { [email+orderID]: { otp, expiresAt, attempts } }

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to user (simulated - in production, use SMS/Email services)
 */
exports.sendOTP = async (email, orderId, phoneNumber = null) => {
  try {
    const otp = generateOTP();
    const key = `${email}:${orderId}`;
    
    // Store OTP with 10-minute expiration
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(key, {
      otp,
      expiresAt,
      attempts: 0,
      phoneNumber,
      createdAt: new Date()
    });

    // In production, send via SMS or Email
    console.log(`📱 OTP for ${email}: ${otp} (Expires at ${new Date(expiresAt).toLocaleTimeString()})`);
    
    // For development/testing:
    if (process.env.SEND_OTP_EMAIL === 'true' && phoneNumber) {
      // Here you would call email service to send OTP
      console.log(`✉️ Email with OTP would be sent to ${email}`);
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600, // seconds
      maskedContact: phoneNumber ? phoneNumber.slice(-4).padStart(phoneNumber.length, '*') : email.slice(0, 3) + '***@' + email.split('@')[1]
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP
 */
exports.verifyOTP = (email, orderId, enteredOTP) => {
  try {
    const key = `${email}:${orderId}`;
    const storedData = otpStore.get(key);

    if (!storedData) {
      return {
        success: false,
        message: 'OTP not found. Please request a new OTP.'
      };
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(key);
      return {
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      };
    }

    // Check attempt limit (max 5 attempts)
    if (storedData.attempts >= 5) {
      otpStore.delete(key);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Verify OTP
    if (storedData.otp !== enteredOTP.toString().trim()) {
      storedData.attempts++;
      const remainingAttempts = 5 - storedData.attempts;
      return {
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        remainingAttempts
      };
    }

    // OTP verified successfully
    otpStore.delete(key);
    return {
      success: true,
      message: 'OTP verified successfully',
      verifiedAt: new Date()
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Resend OTP (deletes old OTP and generates new one)
 */
exports.resendOTP = async (email, orderId, phoneNumber = null) => {
  try {
    const key = `${email}:${orderId}`;
    otpStore.delete(key); // Remove old OTP
    
    // Send new OTP
    return await exports.sendOTP(email, orderId, phoneNumber);
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};

/**
 * Get OTP status (for debugging/testing)
 */
exports.getOTPStatus = (email, orderId) => {
  const key = `${email}:${orderId}`;
  const data = otpStore.get(key);
  
  if (!data) {
    return { exists: false };
  }

  return {
    exists: true,
    expired: Date.now() > data.expiresAt,
    attempts: data.attempts,
    expiresAt: new Date(data.expiresAt),
    createdAt: data.createdAt
  };
};

/**
 * Clear all OTPs (for testing)
 */
exports.clearAllOTPs = () => {
  otpStore.clear();
  console.log('🗑️ All OTPs cleared');
};

module.exports = exports;
