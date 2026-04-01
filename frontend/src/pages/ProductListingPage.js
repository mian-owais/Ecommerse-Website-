import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../utils/api';
import './ProductListingPage.css';

// Helper function to render product image
const renderProductImage = (image) => {
  if (!image) {
    return <span className="product-image-emoji">📦</span>;
  }
  
  // Check if it's a file URL (starts with /uploads/ or http)
  if (typeof image === 'string' && (image.startsWith('/uploads/') || image.startsWith('http'))) {
    const imageUrl = image.startsWith('http') ? image : `http://localhost:5000${image}`;
    return (
      <img 
        src={imageUrl} 
        alt="Product" 
        className="product-image-img"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = '<span className="product-image-emoji">📦</span>';
        }}
      />
    );
  }
  
  // Otherwise render as emoji or text
  return <span className="product-image-emoji">{image || '📦'}</span>;
};

function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, page, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (searchQuery) {
        response = await productAPI.searchProducts(searchQuery);
      } else if (selectedCategory) {
        response = await productAPI.getByCategory(selectedCategory, page, 8, sortBy);
      } else {
        response = await productAPI.getAllProducts(page, 8, '', sortBy);
      }

      setProducts(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    setPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <div className="products-page">
        <div className="container">
          <h1>Loading Products...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="products-header">
          <h1>Products</h1>
          <p>Browse our collection of premium tech products</p>
        </div>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="products-layout flex">
          {/* Sidebar - Filters */}
          <aside className={`sidebar ${filterOpen ? 'active' : ''}`}>
            <div className="filter-section">
              <h3>Filter by Category</h3>
              <div className="category-filters">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedCategory === ''}
                    onChange={() => handleCategoryChange('')}
                  />
                  <span>All Products</span>
                </label>
                {categories.map((category) => (
                  <label key={category._id} className="filter-checkbox">
                    <input 
                      type="checkbox"
                      checked={selectedCategory === category.name}
                      onChange={() => handleCategoryChange(category.name)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-outlined" 
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setInputValue('');
                setSortBy('featured');
              }}
              style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
            >
              Reset Filters
            </button>
          </aside>

          {/* Main Products Area */}
          <div className="products-main">
            {/* Toolbar */}
            <div className="products-toolbar flex-between">
              <p className="results-count">Showing {products.length} products</p>
              <div className="sort-container">
                <label htmlFor="sort">Sort by:</label>
                <select 
                  id="sort"
                  value={sortBy} 
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              <button 
                className="filter-toggle show-mobile"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                ⚙️ Filters
              </button>
            </div>

            {/* Products Grid */}
            <div className="products-grid grid grid-4">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product._id} className="product-item">
                    <Link to={`/product/${product._id}`} className="product-link">
                      <div className="product-image-container">
                        <div className="product-image">
                          {renderProductImage(product.image)}
                        </div>
                        <span className="product-badge">New</span>
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-category">{product.category}</p>
                        <div className="product-rating">
                          <span className="stars">{'⭐'.repeat(Math.floor(product.rating || 0))}</span>
                          <span className="rating-value">
                            {product.rating ? product.rating.toFixed(1) : '0'} ({product.reviews || 0} reviews)
                          </span>
                        </div>
                        <p className="product-price">${product.price}</p>
                        <button className="btn btn-primary btn-sm add-to-cart">
                          Add to Cart
                        </button>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p>No products found. Try a different search or category.</p>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination flex-center mt-4">
                {page > 1 && (
                  <button 
                    onClick={() => setPage(page - 1)}
                    className="page-btn"
                  >
                    ← Previous
                  </button>
                )}
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                {page < pagination.pages && (
                  <button 
                    onClick={() => setPage(page + 1)}
                    className="page-btn"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListingPage;
