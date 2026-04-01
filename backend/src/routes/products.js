const express = require('express');
const { db } = require('../db/database');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (search) { query += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY created_at DESC';
  const products = db.prepare(query).all(...params);
  res.json(products);
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', authenticate, isAdmin, (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'Name and price are required' });
  const result = db.prepare(
    'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, description, price, image, category, stock || 0);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

router.put('/:id', authenticate, isAdmin, (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  db.prepare(
    'UPDATE products SET name=?, description=?, price=?, image=?, category=?, stock=? WHERE id=?'
  ).run(name ?? product.name, description ?? product.description, price ?? product.price,
    image ?? product.image, category ?? product.category, stock ?? product.stock, req.params.id);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

router.delete('/:id', authenticate, isAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

module.exports = router;
