const Product = require('../models/Product');
const { generateInitialReviews } = require('./reviewController');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, sortBy, page = 1, limit = 10 } = req.query;

    // Filter active products and products with stock > 0
    let query = { isActive: true, stock: { $gt: 0 } };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    let sortOrder = {};
    switch (sortBy) {
      case 'price-low':
        sortOrder = { price: 1 };
        break;
      case 'price-high':
        sortOrder = { price: -1 };
        break;
      case 'newest':
        sortOrder = { createdAt: -1 };
        break;
      case 'rating':
        sortOrder = { rating: -1 };
        break;
      default:
        sortOrder = { createdAt: -1 };
    }

    // Fetch products
    const products = await Product.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: pageNum,
        pages,
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;

    const products = await Product.find({
      $text: { $search: query },
      isActive: true,
      stock: { $gt: 0 }
    }).limit(20);

    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    // Fallback to OR query if text search fails
    try {
      const regex = new RegExp(query, 'i');
      const products = await Product.find({
        $or: [
          { name: regex },
          { description: regex },
          { category: regex }
        ],
        isActive: true,
        stock: { $gt: 0 }
      }).limit(20);

      res.json({ success: true, data: products, count: products.length });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// Filter by category
exports.filterByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { sortBy = 'featured', page = 1, limit = 10 } = req.query;

    let sortOrder = {};
    switch (sortBy) {
      case 'price-low':
        sortOrder = { price: 1 };
        break;
      case 'price-high':
        sortOrder = { price: -1 };
        break;
      case 'rating':
        sortOrder = { rating: -1 };
        break;
      default:
        sortOrder = { createdAt: -1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find({ category, isActive: true, stock: { $gt: 0 } })
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments({ category, isActive: true, stock: { $gt: 0 } });

    res.json({
      success: true,
      data: products,
      pagination: {
        current: pageNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .sort({ rating: -1 })
      .limit(8);

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    // Generate initial random reviews for the product
    await generateInitialReviews(product._id);
    
    // Fetch updated product with new rating
    const updatedProduct = await Product.findById(product._id);
    
    res.status(201).json({ 
      success: true, 
      data: updatedProduct, 
      message: 'Product created successfully with initial reviews' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
