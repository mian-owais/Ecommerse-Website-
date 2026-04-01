const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  searchProducts,
  filterByCategory,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/search/:query', searchProducts);
router.get('/category/:category', filterByCategory);
router.get('/:id', getProduct);

// Admin routes (protected)
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
