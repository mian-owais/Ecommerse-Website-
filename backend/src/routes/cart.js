const express = require('express');
const { db } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const items = db.prepare(`
    SELECT ci.id, ci.quantity, ci.product_id,
           p.name, p.price, p.image, p.category, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

router.post('/', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, productId);
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?')
      .run(quantity, req.user.id, productId);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)')
      .run(req.user.id, productId, quantity);
  }
  res.json({ message: 'Cart updated' });
});

router.put('/:productId', (req, res) => {
  const { quantity } = req.body;
  if (quantity == null || quantity < 1) return res.status(400).json({ error: 'Valid quantity required' });
  const result = db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?')
    .run(quantity, req.user.id, req.params.productId);
  if (result.changes === 0) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ message: 'Quantity updated' });
});

router.delete('/clear', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Cart cleared' });
});

router.delete('/:productId', (req, res) => {
  const result = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?')
    .run(req.user.id, req.params.productId);
  if (result.changes === 0) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ message: 'Item removed' });
});

module.exports = router;
