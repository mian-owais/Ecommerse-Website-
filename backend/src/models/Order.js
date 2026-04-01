const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: Number,
  subtotal: Number,
  tax: Number,
  shipping: Number,
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'debit-card', 'paypal', 'cod', 'easypaisa', 'jazzcash', 'bank-transfer'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'awaiting-screenshot', 'verified'],
    default: 'pending'
  },
  paymentReceived: {
    type: Boolean,
    default: false,
    description: 'Admin confirms payment received (for COD orders)'
  },
  // Online payment fields
  onlinePaymentDetails: {
    accountNumber: String,
    phoneNumber: String, // For EasyPaisa/JazzCash
    bankName: String,
    accountHolderName: String,
    amount: Number,
    paymentReference: String // User's reference from payment portal
  },
  otpVerification: {
    otpSent: Boolean,
    otpVerified: Boolean,
    otpAttempts: {
      type: Number,
      default: 0
    },
    otpSentAt: Date,
    otpVerifiedAt: Date
  },
  paymentScreenshot: {
    url: String,
    fileName: String,
    uploadedAt: Date,
    verifiedByAdmin: Boolean,
    adminVerificationDate: Date,
    adminNotes: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  estimatedDelivery: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Generate order number (ORD-20260345-1001 format)
orderSchema.pre('save', async function(next) {
  // No longer needed here, moved to controller
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
