const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 5, sortBy = 'newest' } = req.query;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Determine sort order
    let sortOrder = {};
    switch (sortBy) {
      case 'helpful':
        sortOrder = { helpful: -1, createdAt: -1 };
        break;
      case 'rating-high':
        sortOrder = { rating: -1 };
        break;
      case 'rating-low':
        sortOrder = { rating: 1 };
        break;
      default:
        sortOrder = { createdAt: -1 };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get reviews
    const reviews = await Review.find({ productId })
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum);

    // Get total and calculate average rating
    const totalReviews = await Review.countDocuments({ productId });
    const avgRating = await Review.aggregate([
      { $match: { productId: new (require('mongoose').Types.ObjectId)(productId) } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    const averageRating = avgRating.length > 0 ? avgRating[0].avg : 0;

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        pagination: {
          current: pageNum,
          pages: Math.ceil(totalReviews / limitNum),
          total: totalReviews,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit a new review
exports.submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    // Validation
    if (!rating || !title || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide rating, title, and comment' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product. You can only submit one review per product.' 
      });
    }

    // Get full user data from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create review
    const review = await Review.create({
      productId,
      userId,
      userName: user.name,
      userEmail: user.email,
      rating: parseInt(rating),
      title,
      comment,
      isVerifiedPurchase: false // Can be enhanced to check actual orders
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await product.updateRatingFromReviews(avgRating, reviews.length);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate initial random reviews for a product (called when admin creates product)
exports.generateInitialReviews = async (productId) => {
  try {
    const reviewTexts = [
      {
        title: 'Great product!',
        comment: 'Really satisfied with this product. Excellent quality and very fast delivery.'
      },
      {
        title: 'Highly recommended',
        comment: 'Been using this for a while now and it works perfectly. Would definitely recommend!'
      },
      {
        title: 'Good value for money',
        comment: 'Amazing price and good quality. No complaints so far.'
      },
      {
        title: 'Exactly what I needed',
        comment: 'Met all my expectations. Very happy with the purchase.'
      },
      {
        title: 'Impressive quality',
        comment: 'Better than I expected. Great features and reliable performance.'
      },
      {
        title: 'Worth every penny',
        comment: 'Premium product at reasonable price. Highly satisfied!'
      }
    ];

    // Generate 3-6 random initial reviews
    const reviewCount = Math.floor(Math.random() * 4) + 3; // 3-6 reviews

    for (let i = 0; i < reviewCount; i++) {
      const randomIndex = Math.floor(Math.random() * reviewTexts.length);
      const reviewText = reviewTexts[randomIndex];
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars

      await Review.create({
        productId,
        userId: null, // System generated review
        userName: `Customer ${i + 1}`,
        userEmail: `customer${i + 1}@example.com`,
        rating,
        title: reviewText.title,
        comment: reviewText.comment,
        isVerifiedPurchase: true
      });
    }

    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const product = await Product.findById(productId);
    if (product) {
      await product.updateRatingFromReviews(avgRating, reviews.length);
    }

    console.log(`✅ Generated ${reviewCount} initial reviews for product ${productId}`);
    return true;
  } catch (error) {
    console.error('Error generating initial reviews:', error);
    return false;
  }
};
