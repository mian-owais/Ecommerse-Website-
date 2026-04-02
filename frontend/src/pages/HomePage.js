import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../utils/api';
import CategoryScroll from '../components/CategoryScroll';
import './HomePage.css';

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

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Promo section state
  const [promoEmail, setPromoEmail] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.role === 'admin');
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch featured products
      const productsResponse = await productAPI.getFeaturedProducts();
      setFeaturedProducts(productsResponse.data || []);

      // Fetch categories from API
      const categoriesResponse = await categoryAPI.getAllCategories();
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle promo offer claim
  const handleClaimOffer = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setPromoMessage('');
    setPromoError('');

    // Validate email
    if (!promoEmail.trim()) {
      setPromoError('❌ Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(promoEmail)) {
      setPromoError('❌ Please enter a valid email address');
      return;
    }

    try {
      setPromoLoading(true);

      // Generate a unique coupon code
      const couponCode = `WELCOME20-${Date.now().toString(36).toUpperCase()}`;
      
      // Save to localStorage
      const existingCoupons = JSON.parse(localStorage.getItem('claimedCoupons') || '[]');
      const newCoupon = {
        email: promoEmail,
        code: couponCode,
        discount: 20,
        createdAt: new Date().toISOString(),
        used: false
      };
      
      existingCoupons.push(newCoupon);
      localStorage.setItem('claimedCoupons', JSON.stringify(existingCoupons));

      // Show coupon modal instead of just message
      setPromoCode(couponCode);
      setShowCouponModal(true);
      setPromoEmail('');
      
      // Auto-close modal after 10 seconds
      setTimeout(() => setShowCouponModal(false), 10000);
    } catch (err) {
      setPromoError('❌ Failed to claim offer. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  // Copy coupon code to clipboard
  const copyCouponCode = () => {
    navigator.clipboard.writeText(promoCode);
    alert('✅ Coupon code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="home-page">
        <section className="hero">
          <div className="container">
            <div className="hero-content flex flex-column">
              <h1>Loading...</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content flex flex-column">
            <h1>Welcome to E-Commerce Store</h1>
            <p>Discover premium tech products and gadgets for your lifestyle</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section section-light">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <CategoryScroll
            categories={categories}
            isAdmin={isAdmin}
            onRefreshCategories={fetchData}
          />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="grid grid-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    {renderProductImage(product.image)}
                  </div>
                  <h3>{product.name}</h3>
                  <p className="product-price">${product.price}</p>
                  <Link to={`/product/${product._id}`} className="btn btn-outlined btn-sm">
                    View Details
                  </Link>
                </div>
              ))
            ) : (
              <p>No products available</p>
            )}
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-box flex flex-column flex-center text-center">
            <h2>Special Offer</h2>
            <p>Get 20% off on your first purchase</p>
            
            {promoError && <div className="promo-error-message">{promoError}</div>}
            
            <form onSubmit={handleClaimOffer} className="promo-form">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="promo-input"
                value={promoEmail}
                onChange={(e) => setPromoEmail(e.target.value)}
                disabled={promoLoading}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={promoLoading}
              >
                {promoLoading ? '⏳ Processing...' : '🎁 Claim Offer'}
              </button>
            </form>
            <p className="promo-note">✓ Discount code will be sent to your email</p>
          </div>
        </div>

        {/* Coupon Code Modal */}
        {showCouponModal && (
          <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)}>
            <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="coupon-modal-close"
                onClick={() => setShowCouponModal(false)}
              >
                ✕
              </button>
              
              <div className="coupon-modal-content">
                <div className="coupon-success-icon">🎉</div>
                <h3>Offer Claimed Successfully!</h3>
                <p>Your exclusive 20% discount code:</p>
                
                <div className="coupon-code-box">
                  <code className="coupon-code-display">{promoCode}</code>
                  <button 
                    className="coupon-copy-btn"
                    onClick={copyCouponCode}
                  >
                    📋 Copy Code
                  </button>
                </div>
                
                <p className="coupon-info">
                  Use this code at checkout to get <strong>20% off</strong> your first purchase!
                </p>
                
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCouponModal(false)}
                >
                  Start Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
