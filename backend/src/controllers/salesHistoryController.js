const Order = require('../models/Order');
const SalesHistory = require('../models/SalesHistory');

// Generate daily sales history from order data
exports.generateDailySalesHistory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    // Get last 30 days date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    let successCount = 0;
    let errorCount = 0;

    // Generate history for each day in the range
    for (let i = 0; i <= 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      try {
        // Fetch orders for this day
        const orders = await Order.find({
          createdAt: { $gte: dayStart, $lte: dayEnd }
        });

        // Calculate metrics
        const ordersReceived = orders.length;
        const paymentsReceived = orders.filter(o => o.paymentReceived).length;
        const ordersDelivered = orders.filter(o => o.orderStatus === 'delivered').length;
        const ordersCancelled = orders.filter(o => o.orderStatus === 'cancelled').length;

        const totalOrdersAmount = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalRevenueGenerated = orders
          .filter(o => o.paymentReceived)
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        const totalItemsSold = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
        const averageOrderValue = ordersReceived > 0 ? totalOrdersAmount / ordersReceived : 0;

        // Update or create sales history record
        const historyDate = new Date(dayStart);
        historyDate.setHours(0, 0, 0, 0);

        await SalesHistory.findOneAndUpdate(
          { date: historyDate },
          {
            ordersReceived,
            paymentsReceived,
            ordersDelivered,
            ordersCancelled,
            totalOrdersAmount,
            totalRevenueGenerated,
            totalItemsSold,
            averageOrderValue
          },
          { upsert: true, new: true }
        );

        successCount++;
      } catch (err) {
        console.error(`Error processing date ${dayStart}:`, err);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Sales history generated. Success: ${successCount}, Errors: ${errorCount}`,
      data: {
        successCount,
        errorCount,
        daysProcessed: 31
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get sales history (last 30 days)
exports.getSalesHistory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    // Get last 30 days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    let history = await SalesHistory.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    // If no history exists, auto-generate it from orders
    if (history.length === 0) {
      console.log('No sales history found. Auto-generating from orders...');
      
      for (let i = 0; i <= 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const orders = await Order.find({
          createdAt: { $gte: dayStart, $lte: dayEnd }
        });

        const ordersReceived = orders.length;
        const paymentsReceived = orders.filter(o => o.paymentReceived).length;
        const ordersDelivered = orders.filter(o => o.orderStatus === 'delivered').length;
        const ordersCancelled = orders.filter(o => o.orderStatus === 'cancelled').length;

        const totalOrdersAmount = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalRevenueGenerated = orders
          .filter(o => o.paymentReceived)
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        const totalItemsSold = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
        const averageOrderValue = ordersReceived > 0 ? totalOrdersAmount / ordersReceived : 0;

        const historyDate = new Date(dayStart);
        historyDate.setHours(0, 0, 0, 0);

        await SalesHistory.findOneAndUpdate(
          { date: historyDate },
          {
            ordersReceived,
            paymentsReceived,
            ordersDelivered,
            ordersCancelled,
            totalOrdersAmount,
            totalRevenueGenerated,
            totalItemsSold,
            averageOrderValue
          },
          { upsert: true, new: true }
        );
      }

      // Fetch the newly generated history
      history = await SalesHistory.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });
    }

    // Calculate totals and averages
    const totals = {
      ordersReceived: 0,
      paymentsReceived: 0,
      ordersDelivered: 0,
      ordersCancelled: 0,
      totalRevenue: 0,
      totalItemsSold: 0,
      avgOrderValue: 0
    };

    history.forEach(day => {
      totals.ordersReceived += day.ordersReceived || 0;
      totals.paymentsReceived += day.paymentsReceived || 0;
      totals.ordersDelivered += day.ordersDelivered || 0;
      totals.ordersCancelled += day.ordersCancelled || 0;
      totals.totalRevenue += day.totalRevenueGenerated || 0;
      totals.totalItemsSold += day.totalItemsSold || 0;
    });

    if (totals.ordersReceived > 0) {
      totals.avgOrderValue = totals.totalRevenue / totals.ordersReceived;
    }

    res.json({
      success: true,
      data: {
        history,
        totals,
        days: history.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get sales history summary (metrics overview)
exports.getSalesHistorySummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. Admin access required.'
      });
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    let history = await SalesHistory.find({
      date: { $gte: startDate, $lte: endDate }
    });

    // If no history exists, auto-generate it from orders
    if (history.length === 0) {
      console.log('No sales history found. Auto-generating from orders...');
      
      for (let i = 0; i <= 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const orders = await Order.find({
          createdAt: { $gte: dayStart, $lte: dayEnd }
        });

        const ordersReceived = orders.length;
        const paymentsReceived = orders.filter(o => o.paymentReceived).length;
        const ordersDelivered = orders.filter(o => o.orderStatus === 'delivered').length;
        const ordersCancelled = orders.filter(o => o.orderStatus === 'cancelled').length;

        const totalOrdersAmount = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalRevenueGenerated = orders
          .filter(o => o.paymentReceived)
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        const totalItemsSold = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
        const averageOrderValue = ordersReceived > 0 ? totalOrdersAmount / ordersReceived : 0;

        const historyDate = new Date(dayStart);
        historyDate.setHours(0, 0, 0, 0);

        await SalesHistory.findOneAndUpdate(
          { date: historyDate },
          {
            ordersReceived,
            paymentsReceived,
            ordersDelivered,
            ordersCancelled,
            totalOrdersAmount,
            totalRevenueGenerated,
            totalItemsSold,
            averageOrderValue
          },
          { upsert: true, new: true }
        );
      }

      // Fetch the newly generated history
      history = await SalesHistory.find({
        date: { $gte: startDate, $lte: endDate }
      });
    }

    // Find best and worst days
    const bestDay = history.reduce((max, day) => 
      (day.totalRevenueGenerated > (max?.totalRevenueGenerated || 0) ? day : max)
    );

    const worstDay = history.reduce((min, day) => 
      (day.totalRevenueGenerated < (min?.totalRevenueGenerated || Infinity) ? day : min)
    );

    const summary = {
      totalDays: history.length,
      averageOrdersPerDay: history.reduce((sum, d) => sum + d.ordersReceived, 0) / (history.length || 1),
      averageRevenuePerDay: history.reduce((sum, d) => sum + d.totalRevenueGenerated, 0) / (history.length || 1),
      bestDay: bestDay ? {
        date: bestDay.date,
        revenue: bestDay.totalRevenueGenerated,
        orders: bestDay.ordersReceived
      } : null,
      worstDay: worstDay ? {
        date: worstDay.date,
        revenue: worstDay.totalRevenueGenerated,
        orders: worstDay.ordersReceived
      } : null,
      paymentSuccessRate: history.length > 0 
        ? ((history.reduce((sum, d) => sum + d.paymentsReceived, 0) / history.reduce((sum, d) => sum + d.ordersReceived, 0)) * 100).toFixed(1)
        : 0,
      deliverySuccessRate: history.length > 0
        ? ((history.reduce((sum, d) => sum + d.ordersDelivered, 0) / history.reduce((sum, d) => sum + d.ordersReceived, 0)) * 100).toFixed(1)
        : 0
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
