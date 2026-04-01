const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    console.log('========================================');
    console.log('📋 CREATE ORDER REQUEST');
    console.log('========================================');
    console.log('📋 userId from req.user.id:', userId);
    console.log('📋 userId type:', typeof userId);
    console.log('📋 Shipping address:', shippingAddress);
    console.log('📋 Payment method:', paymentMethod);

    // Get user cart - try multiple ways to find it
    console.log('\n🔍 Searching for cart with userId:', userId);
    
    const cart = await Cart.findOne({ userId: userId });
    
    console.log('🛒 Cart findOne result:', {
      found: !!cart,
      cartId: cart ? cart._id : null,
      userId: cart ? cart.userId : null,
      itemsCount: cart ? cart.items.length : 0
    });

    if (!cart) {
      console.log('\n❌ CART NOT FOUND');
      console.log('📊 Debugging info:');
      
      // Find all carts to debug
      const allCarts = await Cart.find();
      console.log(`   Total carts in DB: ${allCarts.length}`);
      allCarts.forEach((c, idx) => {
        console.log(`   Cart ${idx + 1}:`, {
          _id: c._id,
          userId: c.userId,
          userIdType: typeof c.userId,
          itemsCount: c.items.length
        });
      });
      
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items before checkout.'
      });
    }

    if (!cart.items || cart.items.length === 0) {
      console.log('\n❌ CART HAS NO ITEMS');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items before checkout.'
      });
    }

    console.log('\n✓ Cart found with', cart.items.length, 'items');

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax
    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const totalPrice = subtotal + tax + shipping;

    // Manually generate order and tracking numbers
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = new Order({
      orderNumber, // Manually set
      trackingNumber, // Manually set
      userId,
      items: cart.items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      shipping,
      totalPrice,
      shippingAddress,
      paymentMethod,
      orderStatus: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });

    await order.save();

    // Send confirmation email
    const recipient = {
      name: order.shippingAddress.fullName,
      email: order.shippingAddress.email,
    };
    await emailService.sendOrderConfirmation(order, recipient);

    // Clear cart after successful order
    await Cart.findByIdAndUpdate(cart._id, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        _id: order._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        totalPrice: order.totalPrice,
        estimatedDelivery: order.estimatedDelivery,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        message: `Confirmation email sent to ${recipient.email}`
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order by ID
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization - user can only see their own orders
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Track order by tracking number
exports.trackOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const order = await Order.findOne({ trackingNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this tracking number'
      });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        status: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items,
        totalPrice: order.totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Send notification if shipped
    if (orderStatus === 'shipped') {
      const user = await User.findById(order.userId);
      await emailService.sendShipmentNotification(order, user);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending orders
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    order.orderStatus = 'cancelled';
    order.updatedAt = new Date();
    await order.save();

    // Send cancellation email
    const user = await User.findById(order.userId);
    await emailService.sendCancellationEmail(order, user, reason || 'No reason provided');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    const { status, sortBy } = req.query;
    let query = {};

    if (status) {
      query.orderStatus = status;
    }

    let orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      total: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order statistics (admin only)
exports.getOrderStatistics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'completed' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Get total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: { orderStatus: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const averageOrderValue = revenueResult[0]?.averageOrderValue || 0;

    // Get revenue by status
    const revenueByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          amount: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        revenueByStatus,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get dashboard analytics (admin only)
exports.getDashboardAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    const Product = require('../models/Product');
    const User = require('../models/User');

    // Get counts
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStock = await Product.countDocuments({ stock: 0, isActive: true });
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const todayRevenue = await Order.aggregate([
      {
        $match: { 
          createdAt: { $gte: today },
          paymentReceived: true  // Only count orders with confirmed payment
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Total received payments (all time)
    const totalReceivedPayments = await Order.aggregate([
      {
        $match: { 
          paymentReceived: true  // All orders with confirmed payment
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lte: 10, $gt: 0 }, isActive: true })
      .sort({ stock: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock
        },
        users: {
          total: totalUsers
        },
        orders: {
          total: totalOrders,
          today: todayOrders
        },
        revenue: {
          today: todayRevenue[0]?.total || 0,
          totalReceived: totalReceivedPayments[0]?.total || 0
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark payment as received (Admin only - for COD orders)
exports.markPaymentReceived = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentReceived } = req.body;

    // Admin only check
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update payment received status
    order.paymentReceived = paymentReceived || false;
    if (paymentReceived && order.paymentMethod === 'cod') {
      order.paymentStatus = 'completed';
    }
    
    await order.save();

    res.json({
      success: true,
      message: `Payment marked as ${paymentReceived ? 'received' : 'pending'}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
