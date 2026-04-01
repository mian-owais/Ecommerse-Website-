const express = require('express');
const { db } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  const ordersWithItems = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.quantity, oi.price, p.name, p.image
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);
    return { ...order, items };
  });
  res.json(ordersWithItems);
});

router.post('/', (req, res) => {
  const { shippingName, shippingAddress, shippingCity, shippingZip } = req.body;
  const cartItems = db.prepare(`
    SELECT ci.quantity, ci.product_id, p.price, p.stock, p.name
    FROM cart_items ci JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.user.id);

  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const createOrder = db.transaction(() => {
    const orderResult = db.prepare(
      'INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_city, shipping_zip) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, total, shippingName, shippingAddress, shippingCity, shippingZip);

    const orderId = orderResult.lastInsertRowid;
    for (const item of cartItems) {
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)')
        .run(orderId, item.product_id, item.quantity, item.price);
    }
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    return orderId;
  });

  const orderId = createOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db.prepare(`
    SELECT oi.quantity, oi.price, p.name, p.image
    FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
  `).all(orderId);
  res.status(201).json({ ...order, items });
});

router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = db.prepare(`
    SELECT oi.quantity, oi.price, p.name, p.image
    FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
  `).all(order.id);
  res.json({ ...order, items });
});

module.exports = router;
