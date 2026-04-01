const mongoose = require('mongoose');

const salesHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  ordersReceived: {
    type: Number,
    default: 0,
    description: 'Number of orders received on this day'
  },
  paymentsReceived: {
    type: Number,
    default: 0,
    description: 'Number of payments confirmed on this day'
  },
  ordersDelivered: {
    type: Number,
    default: 0,
    description: 'Number of orders delivered on this day'
  },
  ordersCancelled: {
    type: Number,
    default: 0,
    description: 'Number of orders cancelled on this day'
  },
  totalOrdersAmount: {
    type: Number,
    default: 0,
    description: 'Total value of all orders received on this day'
  },
  totalRevenueGenerated: {
    type: Number,
    default: 0,
    description: 'Total revenue from confirmed payments on this day'
  },
  totalItemsSold: {
    type: Number,
    default: 0,
    description: 'Total number of items sold on this day'
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    description: 'Average value per order on this day'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically update the updatedAt field before saving
salesHistorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SalesHistory', salesHistorySchema);
