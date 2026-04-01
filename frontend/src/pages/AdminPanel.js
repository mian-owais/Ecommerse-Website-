import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, adminAPI, categoryAPI } from '../utils/api';
import '../styles/AdminPanel.css';

// Helper function to render images in admin
const renderAdminImage = (image) => {
  if (!image) {
    return null;
  }
  
  // Check if it's a file URL (starts with /uploads/ or http)
  if (typeof image === 'string' && (image.startsWith('/uploads/') || image.startsWith('http'))) {
    const imageUrl = image.startsWith('http') ? image : `http://localhost:5000${image}`;
    return (
      <img 
        src={imageUrl} 
        alt="Current" 
        className="image-current-img"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }
  
  // Otherwise render as emoji
  return <span className="image-current-emoji">{image || '📦'}</span>;
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  
  // Product form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    image: '',
    stock: '',
    sku: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    emoji: '📦'
  });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'products':
        loadProducts();
        loadCategories();
        break;
      case 'orders':
        loadOrders();
        break;
      case 'users':
        loadUsers();
        break;
      case 'history':
        loadSalesHistory();
        break;
      case 'categories':
        loadCategories();
        break;
      default:
        break;
    }
  }, [activeTab]);

  // Update initial category when categories load
  useEffect(() => {
    if (categories.length > 0 && !editingId) {
      setFormData(prev => ({
        ...prev,
        category: prev.category === '' ? categories[0].name : prev.category
      }));
    }
  }, [categories, editingId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [analyticsData, statsData] = await Promise.all([
        adminAPI.getDashboardAnalytics(),
        adminAPI.getOrderStatistics()
      ]);
      setAnalytics(analyticsData.data);
      setOrderStats(statsData.data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAllProducts(1, 100);
      setProducts(data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllOrders();
      setOrders(data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentReceived = async (orderId, currentStatus) => {
    try {
      await adminAPI.markPaymentReceived(orderId, !currentStatus);
      // Reload both orders and dashboard analytics
      loadOrders();
      loadDashboard();
      setSuccess('Payment status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update payment status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getUserStatistics()
      ]);
      setUsers(usersData.data || []);
      setUserStats(statsData.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesHistory = async () => {
    try {
      setLoading(true);
      const [historyData, summaryData] = await Promise.all([
        adminAPI.getSalesHistory(),
        adminAPI.getSalesHistorySummary()
      ]);
      setSalesHistory(historyData.data?.history || []);
      setSalesSummary(summaryData.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch sales history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAllCategories();
      setCategories(data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Product Management Functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
      }

      setImageFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    if (category) {
      try {
        const data = await productAPI.getByCategory(category);
        setProducts(data.data || []);
      } catch (err) {
        setError('Failed to filter products');
      }
    } else {
      loadProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let productSubmitData = { ...formData };

      // Upload image if file was selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadResponse = await productAPI.uploadImage(imageFile);
        productSubmitData.image = uploadResponse.imageUrl;
        setUploadingImage(false);
      }

      if (editingId) {
        await productAPI.updateProduct(editingId, productSubmitData);
        setSuccess('Product updated successfully!');
      } else {
        await productAPI.createProduct(productSubmitData);
        setSuccess('Product created successfully!');
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'Electronics',
        image: '',
        stock: '',
        sku: ''
      });
      setImageFile(null);
      setImagePreview(null);
      setEditingId(null);
      setShowForm(false);
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.image,
      stock: product.stock,
      sku: product.sku
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        setSuccess('Product deleted successfully!');
        loadProducts();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await adminAPI.updateProductStatus(id, !currentStatus);
      setSuccess('Product status updated successfully!');
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update product status');
    }
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }
    try {
      await adminAPI.updateProductQuantity(id, newQuantity);
      setSuccess('Quantity updated successfully!');
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'Electronics',
      image: '',
      stock: '',
      sku: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  // Category Management Functions
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
      }

      setCategoryImageFile(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCategoryImage = () => {
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!categoryFormData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (!categoryImageFile && !editingCategoryId) {
      setError('Category image is required for new categories');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', categoryFormData.name);
      formDataToSend.append('description', categoryFormData.description);
      formDataToSend.append('emoji', categoryFormData.emoji);

      if (categoryImageFile) {
        formDataToSend.append('image', categoryImageFile);
      }

      setUploadingCategoryImage(true);

      if (editingCategoryId) {
        await categoryAPI.updateCategory(editingCategoryId, formDataToSend);
        setSuccess('Category updated successfully!');
      } else {
        await categoryAPI.createCategory(formDataToSend);
        setSuccess('Category created successfully!');
      }

      setCategoryFormData({ name: '', description: '', emoji: '📦' });
      setCategoryImageFile(null);
      setCategoryImagePreview(null);
      setEditingCategoryId(null);
      setShowCategoryForm(false);
      loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      emoji: category.emoji || '📦'
    });
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
    setEditingCategoryId(category._id);
    setShowCategoryForm(true);
  };

  const handleCancelCategoryEdit = () => {
    setCategoryFormData({ name: '', description: '', emoji: '📦' });
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.deleteCategory(id);
        setSuccess('Category deleted successfully!');
        loadCategories();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete category');
      }
    }
  };

  // Dashboard Tab
  const DashboardTab = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={loadDashboard}
          title="Refresh dashboard data"
        >
          🔄 Refresh
        </button>
      </div>
      {analytics && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Total Products</h3>
              <p className="kpi-value">{analytics.products.total}</p>
              <p className="kpi-subtitle">Active: {analytics.products.active}</p>
              <p className="kpi-subtitle warning">Out of Stock: {analytics.products.outOfStock}</p>
            </div>

            <div className="kpi-card">
              <h3>Total Users</h3>
              <p className="kpi-value">{analytics.users.total}</p>
              <p className="kpi-subtitle">Registered users</p>
            </div>

            <div className="kpi-card">
              <h3>Total Orders</h3>
              <p className="kpi-value">{analytics.orders.total}</p>
              <p className="kpi-subtitle">Today: {analytics.orders.today}</p>
            </div>

            <div className="kpi-card">
              <h3>Today's Revenue</h3>
              <p className="kpi-value">${analytics.revenue.today.toFixed(2)}</p>
              <p className="kpi-subtitle">Total income</p>
            </div>

            <div className="kpi-card">
              <h3>Total Received</h3>
              <p className="kpi-value">${analytics.revenue.totalReceived.toFixed(2)}</p>
              <p className="kpi-subtitle">Confirmed payments</p>
            </div>
          </div>

          {orderStats && (
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Order Status</h3>
                <div className="stats-list">
                  <div className="stat-item">
                    <span>Pending:</span>
                    <strong>{orderStats.pendingOrders}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Completed:</span>
                    <strong>{orderStats.completedOrders}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Cancelled:</span>
                    <strong>{orderStats.cancelledOrders}</strong>
                  </div>
                </div>
              </div>

              <div className="stats-card">
                <h3>Revenue Stats</h3>
                <div className="stats-list">
                  <div className="stat-item">
                    <span>Total Revenue:</span>
                    <strong>${orderStats.totalRevenue.toFixed(2)}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Avg Order Value:</span>
                    <strong>${orderStats.averageOrderValue.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analytics.recentOrders && analytics.recentOrders.length > 0 && (
            <div className="recent-section">
              <h3>Recent Orders</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders.map(order => (
                      <tr key={order._id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.userId?.name || 'N/A'}</td>
                        <td>${order.totalPrice.toFixed(2)}</td>
                        <td><span className={`badge ${order.orderStatus}`}>{order.orderStatus}</span></td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analytics.lowStockProducts && analytics.lowStockProducts.length > 0 && (
            <div className="low-stock-section">
              <h3>⚠️ Low Stock Products (1-10 units)</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.lowStockProducts.map(product => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td className="warning-text">{product.stock}</td>
                        <td>${product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Products Tab
  const ProductsTab = () => (
    <div className="products-section">
      <div className="admin-header">
        <h2>Product Management</h2>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="category-filter">
        <button
          className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => handleCategoryFilter('')}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category._id}
            className={`filter-btn ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(category.name)}
          >
            <span>{category.emoji}</span> {category.name}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="product-form-container">
          <form onSubmit={handleSubmit} className="product-form">
            <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                {categories.map(category => (
                  <option key={category._id} value={category.name}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  placeholder="Enter price"
                />
              </div>

              <div className="form-group">
                <label>Original Price</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="Enter original price"
                />
              </div>

              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter SKU"
                />
              </div>

              <div className="form-group">
                <label>Image</label>
                <div className="image-upload-container">
                  {/* New Image Preview */}
                  {imagePreview && (
                    <div className="image-preview-container">
                      <div className="image-preview-label">📸 New Image Preview:</div>
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                      >
                        ✕ Remove Selection
                      </button>
                    </div>
                  )}

                  {/* Current Image Display (when editing and no new preview selected) */}
                  {!imagePreview && formData.image && editingId && (
                    <div className="image-current-container">
                      <div className="image-current-label">📷 Current Image:</div>
                      <div className="image-current-preview">
                        {renderAdminImage(formData.image)}
                      </div>
                      <button
                        type="button"
                        className="change-image-btn"
                        onClick={() => document.getElementById('image-input').click()}
                        disabled={uploadingImage}
                      >
                        🔄 Replace with New Image
                      </button>
                      <p className="image-status">or click "📤 Choose Image" below to upload a different image</p>
                    </div>
                  )}

                  {/* File Upload Button */}
                  {!imagePreview && (
                    <div className="image-upload-wrapper">
                      <input
                        type="file"
                        id="image-input"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="image-file-input"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="image-input" className="image-upload-label">
                        {uploadingImage ? '⏳ Uploading...' : '📤 Choose Image'}
                      </label>
                    </div>
                  )}

                  {/* Help Text */}
                  <p className="image-help-text">JPG, PNG, GIF, WebP • Max 5MB</p>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table">
        <h3>Products ({products.length})</h3>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className={product.stock === 0 ? 'out-of-stock' : ''}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>${product.price}</td>
                    <td>
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleUpdateQuantity(product._id, parseInt(e.target.value))}
                        min="0"
                        onFocus={(e) => e.target.select()}
                        className="quantity-input"
                      />
                    </td>
                    <td>
                      <button
                        className={`status-btn ${product.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleAvailability(product._id, product.isActive)}
                        title={product.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {product.isActive ? '✓ Active' : '✗ Inactive'}
                      </button>
                    </td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Orders Tab
  const OrdersTab = () => {
    // Filter orders based on payment status
    const filteredOrders = showPendingOnly 
      ? orders.filter(order => !order.paymentReceived)
      : orders;

    return (
      <div className="orders-section">
        <div className="orders-header">
          <h2>Order Management</h2>
          <div className="orders-filter">
            <button 
              className={`filter-btn ${showPendingOnly ? 'active' : ''}`}
              onClick={() => setShowPendingOnly(true)}
            >
              ⏳ Pending Payment ({orders.filter(o => !o.paymentReceived).length})
            </button>
            <button 
              className={`filter-btn ${!showPendingOnly ? 'active' : ''}`}
              onClick={() => setShowPendingOnly(false)}
            >
              📋 All Orders ({orders.length})
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="orders-table">
          {loading ? (
            <p>Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p>{showPendingOnly ? 'No pending payments - Great job! 🎉' : 'No orders found'}</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Received</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td className="order-number">{order.orderNumber}</td>
                      <td>
                        <div className="customer-info">
                          <div>{order.userId?.name || 'N/A'}</div>
                          <div className="email-small">{order.userId?.email || ''}</div>
                        </div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td className="amount">${order.totalPrice?.toFixed(2) || '0.00'}</td>
                      <td><span className={`badge ${order.orderStatus}`}>{order.orderStatus}</span></td>
                      <td><span className={`badge ${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                      <td>
                        <input
                          type="checkbox"
                          checked={order.paymentReceived || false}
                          onChange={() => handlePaymentReceived(order._id, order.paymentReceived)}
                          title={order.paymentMethod === 'cod' ? 'Mark payment as received' : 'Payment already received (online)'}
                          disabled={order.paymentMethod !== 'cod'}
                          className="payment-checkbox"
                        />
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Users Tab
  const UsersTab = () => (
    <div className="users-section">
      <h2>User Management</h2>

      {error && <div className="error-message">{error}</div>}

      {userStats && (
        <div className="user-stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{userStats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="stat-value">{userStats.activeUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Admins</h3>
            <p className="stat-value">{userStats.admins}</p>
          </div>
          <div className="stat-card">
            <h3>Logged in Today</h3>
            <p className="stat-value">{userStats.todayLogins}</p>
          </div>
        </div>
      )}

      <div className="users-table">
        <h3>All Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Login Count</th>
                  <th>Last Login</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span></td>
                    <td className="login-count">{user.loginCount || 0}</td>
                    <td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {userStats && userStats.topLogins && (
        <div className="top-users-section">
          <h3>Most Active Users</h3>
          <div className="top-users-list">
            {userStats.topLogins.map((user, idx) => (
              <div key={user._id} className="top-user-card">
                <div className="rank">#{idx + 1}</div>
                <div className="user-details">
                  <p className="name">{user.name}</p>
                  <p className="email">{user.email}</p>
                  <p className="logins">
                    Logins: <strong>{user.loginCount}</strong>
                  </p>
                  {user.lastLogin && (
                    <p className="last-login">
                      Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Sales History Tab
  const SalesHistoryTab = () => (
    <div className="sales-history-section">
      <div className="history-header">
        <h2>Sales History (Last 30 Days)</h2>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={loadSalesHistory}
          title="Refresh sales history data"
        >
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {salesSummary && (
        <div className="history-summary">
          <div className="summary-card">
            <h4>Average Orders/Day</h4>
            <p className="summary-value">{salesSummary.averageOrdersPerDay.toFixed(1)}</p>
          </div>
          <div className="summary-card">
            <h4>Average Revenue/Day</h4>
            <p className="summary-value">${salesSummary.averageRevenuePerDay.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h4>Payment Success Rate</h4>
            <p className="summary-value">{salesSummary.paymentSuccessRate}%</p>
          </div>
          <div className="summary-card">
            <h4>Delivery Success Rate</h4>
            <p className="summary-value">{salesSummary.deliverySuccessRate}%</p>
          </div>
          {salesSummary.bestDay && (
            <div className="summary-card highlight">
              <h4>Best Day</h4>
              <p className="summary-value">${salesSummary.bestDay.revenue.toFixed(2)}</p>
              <p className="summary-subtitle">{new Date(salesSummary.bestDay.date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}

      <div className="history-table">
        {loading ? (
          <p>Loading sales history...</p>
        ) : salesHistory.length === 0 ? (
          <p>No sales history data available</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders Received</th>
                  <th>Payments Received</th>
                  <th>Delivered</th>
                  <th>Cancelled</th>
                  <th>Total Revenue</th>
                  <th>Items Sold</th>
                  <th>Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.map((day) => (
                  <tr key={day._id}>
                    <td className="date">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="orders">{day.ordersReceived}</td>
                    <td className="payments">
                      <span className="badge completed">{day.paymentsReceived}</span>
                    </td>
                    <td className="delivered">
                      <span className="badge completed">{day.ordersDelivered}</span>
                    </td>
                    <td className="cancelled">
                      <span className="badge cancelled">{day.ordersCancelled}</span>
                    </td>
                    <td className="revenue">
                      <strong>${day.totalRevenueGenerated.toFixed(2)}</strong>
                    </td>
                    <td className="items">{day.totalItemsSold}</td>
                    <td className="avg">${day.averageOrderValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const CategoriesTab = () => (
    <div className="tab-pane">
      <div className="section-header">
        <h2>Category Management</h2>
        <button className="btn btn-primary" onClick={() => setShowCategoryForm(!showCategoryForm)}>
          {showCategoryForm ? '✕ Cancel' : '+ New Category'}
        </button>
      </div>

      {showCategoryForm && (
        <div className="form-card">
          <h3>{editingCategoryId ? '✏️ Edit Category' : '➕ Create New Category'}</h3>
          <form onSubmit={handleCategorySubmit}>
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                name="name"
                value={categoryFormData.name}
                onChange={handleCategoryChange}
                required
                placeholder="e.g., Electronics, Accessories"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={categoryFormData.description}
                onChange={handleCategoryChange}
                placeholder="Category description..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Category Image *</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleCategoryImageSelect}
                />
                <span className="file-input-label">Choose Image</span>
              </div>
              {categoryImagePreview && (
                <div className="preview-container">
                  <img src={categoryImagePreview} alt="Preview" className="image-preview" />
                  <button type="button" onClick={handleRemoveCategoryImage} className="btn btn-sm btn-danger">
                    Remove
                  </button>
                </div>
              )}
              {editingCategoryId && categories.find(c => c._id === editingCategoryId)?.image && !categoryImagePreview && (
                <div className="preview-container">
                  <p className="current-image-label">Current Image:</p>
                  {renderAdminImage(categories.find(c => c._id === editingCategoryId)?.image)}
                  <button type="button" onClick={() => setCategoryImageFile(null)} className="btn btn-sm btn-secondary">
                    🔄 Replace with New Image
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploadingCategoryImage}>
              {uploadingCategoryImage ? '⏳ Uploading...' : editingCategoryId ? 'Update Category' : 'Create Category'}
            </button>
            {editingCategoryId && (
              <button type="button" onClick={handleCancelCategoryEdit} className="btn btn-secondary">
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      )}

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category._id} className="category-card">
            <div className="category-image">
              {renderAdminImage(category.image || category.emoji)}
            </div>
            <div className="category-info">
              <h4>{category.name}</h4>
              {category.description && <p>{category.description}</p>}
            </div>
            <div className="category-actions">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => handleEditCategory(category)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteCategory(category._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !showCategoryForm && (
        <div className="empty-state">
          <p>No categories yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <div className="admin-nav">
          <h1>Admin Dashboard</h1>
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Orders
            </button>
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📈 Sales History
            </button>
            <button
              className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              🏷️ Categories
            </button>
          </div>
        </div>

        <div className="tab-content">
          {error && <div className="error-message">{error}</div>}
          {loading && activeTab !== 'products' && <div className="loading">Loading...</div>}

          {activeTab === 'dashboard' && DashboardTab()}
          {activeTab === 'products' && ProductsTab()}
          {activeTab === 'orders' && OrdersTab()}
          {activeTab === 'users' && UsersTab()}
          {activeTab === 'history' && SalesHistoryTab()}
          {activeTab === 'categories' && CategoriesTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
