import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../utils/api';
import { dispatchCartUpdate } from '../utils/cartEvents';
import ProductReviews from '../components/ProductReviews';
import SubmitReview from '../components/SubmitReview';
import './ProductDetailsPage.css';

// Helper function to render product image
const renderProductImage = (image, className = 'product-image-img') => {
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
        className={className}
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

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');

      
      // Fetch product details
      const response = await productAPI.getProduct(id);
      if (response.success && response.data) {
        setProduct(response.data);
        
        // Fetch related products from same category
        const relatedResponse = await productAPI.getByCategory(response.data.category, 1, 4);
        const filtered = relatedResponse.data.filter(p => p._id !== id);
        setRelatedProducts(filtered.slice(0, 4));
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    checkLoginStatus();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      await cartAPI.addToCart(product._id, quantity, product.price, product.name, product.image);
      
      // Dispatch cart update event so Header updates cart count
      dispatchCartUpdate();
      console.log('✓ Item added to cart successfully');
      
      setAddToCartMessage(`✓ Added ${quantity} item(s) to cart!`);
      setTimeout(() => {
        setAddToCartMessage('');
        setQuantity(1);
      }, 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message || 'Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="container">
          <div className="error-message">{error || 'Product not found'}</div>
          <Link to="/products" className="btn btn-outlined mt-3">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="product-details-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="product-details-main grid grid-2">
          <div className="product-image-section">
            <div className="product-image-large">
              {renderProductImage(product.image, 'product-image-large-img')}
            </div>
            <div className="product-badges">
              {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
              {product.stock > 0 && <span className="badge badge-stock">In Stock</span>}
            </div>
          </div>

          <div className="product-details-section">
            <div className="product-meta">
              <span className="category">{product.category}</span>
              <div className="rating">
                {'⭐'.repeat(Math.floor(product.rating))}
                <span className="rating-num">({product.rating} - {product.reviews || 0} reviews)</span>
              </div>
            </div>

            <h1>{product.name}</h1>

            <div className="price-section">
              {product.originalPrice && <span className="price-original">${product.originalPrice}</span>}
              <span className="price-current">${product.price}</span>
              {product.originalPrice && <span className="price-save">Save ${(product.originalPrice - product.price).toFixed(2)}</span>}
            </div>

            <p className="description">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="features-list">
                <h3>Key Features</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="error-message">{error}</p>}
            {addToCartMessage && <p className="success-message">{addToCartMessage}</p>}

            <div className="purchase-section">
              <div className="input-group">
                <label htmlFor="quantity">Quantity:</label>
                <select 
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="quantity-select"
                  disabled={product.stock === 0}
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="btn btn-outlined btn-lg">
                ❤️ Add to Wishlist
              </button>
            </div>

            <div className="shipping-info">
              <p>📦 Free Shipping on orders over $50</p>
              <p>✓ 30-day money-back guarantee</p>
              <p>🔒 Secure checkout</p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <section className="specifications-section section-light">
            <h2>Specifications</h2>
            <div className="specs-grid">
              {Array.from(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span className="spec-label">{key}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="reviews-and-submit-section">
          <SubmitReview 
            productId={product._id} 
            onReviewSubmitted={() => setReviewRefreshKey(prev => prev + 1)}
            isLoggedIn={isLoggedIn}
          />
          <ProductReviews key={reviewRefreshKey} productId={product._id} />
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <h2>Related Products</h2>
            <div className="grid grid-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="product-card">
                  <div className="product-image">
                    {renderProductImage(relatedProduct.image)}
                  </div>
                  <h3>{relatedProduct.name}</h3>
                  <p className="product-price">${relatedProduct.price}</p>
                  <Link to={`/product/${relatedProduct._id}`} className="btn btn-outlined btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetailsPage;
