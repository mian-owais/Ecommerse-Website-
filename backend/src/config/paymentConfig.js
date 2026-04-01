/**
 * Payment Configuration
 * Contains payment provider details and account information for demonstration
 */

const PAYMENT_METHODS = {
  COD: {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: '🚚',
    type: 'cash',
    description: 'Pay when your order arrives'
  },
  STRIPE: {
    id: 'stripe',
    name: 'Stripe - Credit/Debit Card',
    icon: '💳',
    type: 'card',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890',
    description: 'Pay with your credit or debit card instantly'
  },
  EASYPAISA: {
    id: 'easypaisa',
    name: 'EasyPaisa',
    icon: '📱',
    type: 'bank-transfer',
    accountNumber: '03001234567',
    accountName: 'DevHub Store',
    minAmount: 500,
    maxAmount: 100000,
    fee: 0, // percentage
    description: 'Send payment to EasyPaisa number and upload screenshot'
  },
  JAZZCASH: {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: '📲',
    type: 'bank-transfer',
    accountNumber: '03100234567',
    accountName: 'DevHub Commerce',
    minAmount: 500,
    maxAmount: 100000,
    fee: 0,
    description: 'Send payment to JazzCash number and upload screenshot'
  },
  BANK_TRANSFER: {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    icon: '🏦',
    type: 'bank-transfer',
    bankName: 'National Bank',
    accountNumber: '1234567890123',
    accountTitle: 'DevHub Store',
    iban: 'PK36NWAB0000001234567890123',
    minAmount: 1000,
    maxAmount: 500000,
    fee: 0.5, // percentage
    description: 'Transfer funds to our bank account and upload receipt'
  },
  DEBIT_CARD: {
    id: 'debit-card',
    name: 'Debit Card',
    icon: '💳',
    type: 'card',
    description: 'Pay with your debit card (powered by Stripe)'
  },
  CREDIT_CARD: {
    id: 'credit-card',
    name: 'Credit Card',
    icon: '💳',
    type: 'card',
    description: 'Pay with your credit card (powered by Stripe)'
  }
};

const OTP_CONFIG = {
  OTP_LENGTH: 6,
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes in milliseconds
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN: 30 * 1000, // 30 seconds in milliseconds
};

const PAYMENT_STATUSES = {
  PENDING: 'pending',
  OTP_SENT: 'otp-sent',
  OTP_VERIFIED: 'otp-verified',
  AWAITING_SCREENSHOT: 'awaiting-screenshot',
  SCREENSHOT_UPLOADED: 'screenshot-uploaded',
  VERIFIED: 'verified',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

module.exports = {
  PAYMENT_METHODS,
  OTP_CONFIG,
  PAYMENT_STATUSES
};
