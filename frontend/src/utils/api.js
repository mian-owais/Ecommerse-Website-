const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth headers
const getHeaders = (includeAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Authentication API calls
export const authAPI = {
  // Register user
  register: async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      // Save token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      // Save token and user
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(true)
      });
      
      // Clear token and user
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Forgot password - send reset email
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send reset email');
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password using token
  resetPassword: async (token, password, confirmPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ password, confirmPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reset password');
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

// Product API calls
export const productAPI = {
  // Get all products
  getAllProducts: async (page = 1, limit = 10, category = '', sortBy = 'featured') => {
    try {
      let url = `${API_BASE_URL}/products?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      if (!response.ok) throw new Error('Failed to fetch featured products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search/${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search products');
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getByCategory: async (category, page = 1, limit = 10, sortBy = 'featured') => {
    try {
      let url = `${API_BASE_URL}/products/category/${category}?page=${page}&limit=${limit}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch category products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create product (admin)
  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create product');
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product (admin)
  updateProduct: async (id, productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(productData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update product');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (admin)
  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete product');
      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Upload product image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = getAuthToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/upload/upload`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to upload image');
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete uploaded image
  deleteImage: async (filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/delete/${filename}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete image');
      return data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};

// Cart API calls
export const cartAPI = {
  // Get cart
  getCart: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add to cart
  addToCart: async (productId, quantity, price, name, image) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ productId, quantity, price, name, image })
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) throw new Error('Failed to update cart');
      return await response.json();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to remove from cart');
      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to clear cart');
      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

// Orders API calls
export const ordersAPI = {
  // Create order (checkout)
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create order');
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order details
  getOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch order');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Track order by tracking number
  trackOrder: async (trackingNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/track/${trackingNumber}`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Failed to track order');
      return await response.json();
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to cancel order');
      return data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // Get all orders (admin)
  getAllOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/all-orders`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch all orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Get order statistics (admin)
  getOrderStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/statistics`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch order statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  },

  // Get dashboard analytics (admin)
  getDashboardAnalytics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/dashboard`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard analytics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }
};

// Admin API calls
export const adminAPI = {
  // Get all users with stats
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/users`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/users-stats`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch user statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },

  // Get all orders
  getAllOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/all-orders`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch all orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Get dashboard analytics
  getDashboardAnalytics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/dashboard`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/statistics`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch order statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  },

  // Update product status
  updateProductStatus: async (productId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ isActive: status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update product');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Update product quantity
  updateProductQuantity: async (productId, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ stock: quantity })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update quantity');
      return data;
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  },

  // Mark payment as received (COD orders)
  markPaymentReceived: async (orderId, paymentReceived) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/mark-payment`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ paymentReceived })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update payment status');
      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Get sales history
  getSalesHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-history/list`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch sales history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sales history:', error);
      throw error;
    }
  },

  // Get sales history summary
  getSalesHistorySummary: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-history/summary`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch sales summary');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      throw error;
    }
  },

  // Generate sales history
  generateSalesHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-history/generate`, {
        method: 'POST',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to generate sales history');
      return await response.json();
    } catch (error) {
      console.error('Error generating sales history:', error);
      throw error;
    }
  }
};

// Category API calls
export const categoryAPI = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category
  getCategory: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      return await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Create category (Admin)
  createCategory: async (formData) => {
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: headers,
        body: formData // FormData for file upload
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create category');
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category (Admin)
  updateCategory: async (id, formData) => {
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: headers,
        body: formData // FormData for file upload
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update category');
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category (Admin)
  deleteCategory: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete category');
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Review API calls
export const reviewAPI = {
  // Get reviews for a product
  getProductReviews: async (productId, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 5,
        sortBy: params.sortBy || 'newest'
      }).toString();

      const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}?${queryString}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch reviews');
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // Submit a review
  submitReview: async (productId, reviewData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/submit`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(reviewData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit review');
      return data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
        method: 'PUT',
        headers: getHeaders(true)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to mark review');
      return data;
    } catch (error) {
      console.error('Error marking review helpful:', error);
      throw error;
    }
  }
};

// Payment API calls
export const paymentAPI = {
  // Get available payment methods
  getPaymentMethods: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/methods`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Initialize online payment
  initializePayment: async (orderId, paymentMethod, phoneNumber = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ orderId, paymentMethod, phoneNumber })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to initialize payment');
      return data;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (orderId, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify-otp`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ orderId, otp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to verify OTP');
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Resend OTP
  resendOTP: async (orderId, phoneNumber = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/resend-otp`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ orderId, phoneNumber })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
      return data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },

  // Upload payment screenshot
  uploadScreenshot: async (orderId, screenshotFile, paymentReference = '') => {
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('screenshot', screenshotFile);
      if (paymentReference) {
        formData.append('paymentReference', paymentReference);
      }

      const token = getAuthToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/payments/upload-screenshot`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to upload screenshot');
      return data;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    }
  },

  // Get payment details for an order
  getPaymentDetails: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${orderId}`, {
        method: 'GET',
        headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch payment details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  },

  // Admin: Verify payment screenshot
  verifyPaymentScreenshot: async (orderId, verified, notes = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${orderId}/verify-screenshot`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ verified, notes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to verify payment');
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
};
