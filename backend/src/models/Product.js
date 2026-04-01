const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxLength: [500, 'Product description cannot exceed 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be positive']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be positive']
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      default: 'Electronics'
    },
    image: {
      type: String,
      default: '📦'
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be 0 or higher'],
      max: [5, 'Rating cannot be more than 5']
    },
    reviews: {
      type: Number,
      default: 0
    },
    isInitiallyRated: {
      type: Boolean,
      default: false
    },
    features: [
      {
        type: String
      }
    ],
    specifications: {
      type: Map,
      of: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'products'
  }
);

// Index for faster queries
productSchema.index({ name: 'text', description: 'text', category: 1 });

// Pre-save hook to handle SKU uniqueness
productSchema.pre('save', async function(next) {
  // Convert empty string SKU to undefined so sparse index works properly
  if (this.sku === '') {
    this.sku = undefined;
  } else if (this.sku) {
    // Trim and lowercase SKU if provided
    this.sku = this.sku.trim().toLowerCase();
  }
  next();
});

// Method to update rating from reviews
productSchema.methods.updateRatingFromReviews = async function(averageRating, reviewCount) {
  this.rating = averageRating;
  this.reviews = reviewCount;
  await this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
