import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../utils/api';
import { dispatchCartUpdate } from '../utils/cartEvents';
import './CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const couponDiscount = 15;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cartAPI.getCart();
      if (response.success) {
        setCartItems(response.data.items || []);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(productId);
    } else {
      try {
        const response = await cartAPI.updateCartItem(productId, newQuantity);
        if (response.success) {
          setCartItems(response.data.items || []);
          dispatchCartUpdate();  // Update Header cart count
        }
      } catch (err) {
        console.error('Error updating cart:', err);
        setError(err.message || 'Failed to update cart');
      }
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      if (response.success) {
        setCartItems(response.data.items || []);
        dispatchCartUpdate();  // Update Header cart count
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message || 'Failed to remove item');
    }
  };

  const applyCoupon = () => {
    if (coupon.trim()) {
      setCouponApplied(true);
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = couponApplied ? couponDiscount : 0;
  const tax = (subtotal - discount) * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal - discount + tax + shipping;

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        {error && <p className="error-message">{error}</p>}

        <div className="cart-layout grid grid-3">
          {/* Cart Items */}
          <div className="cart-items-section" style={{ gridColumn: '1 / 3' }}>
            <div className="cart-items-header flex-between">
              <h2>Items ({cartItems.length})</h2>
              <Link to="/products" className="continue-shopping">
                ← Continue Shopping
              </Link>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.productId} className="cart-item flex">
                  <div className="item-image">{item.image || '📦'}</div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-id">Product ID: {item.productId}</p>
                  </div>
                  <div className="item-quantity">
                    <label htmlFor={`qty-${item.productId}`}>Qty:</label>
                    <input
                      id={`qty-${item.productId}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                      className="qty-input"
                    />
                  </div>
                  <div className="item-price">
                    <p className="price-label">Price</p>
                    <p className="price">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="remove-btn"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="coupon-section">
              <label htmlFor="coupon">Promo Code</label>
              <div className="coupon-input-group">
                <input
                  id="coupon"
                  type="text"
                  placeholder="Enter code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  disabled={couponApplied}
                  className="coupon-input"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponApplied}
                  className="btn btn-secondary btn-sm"
                >
                  {couponApplied ? '✓ Applied' : 'Apply'}
                </button>
              </div>
              {couponApplied && <p className="coupon-applied">Coupon Applied! Save ${couponDiscount}</p>}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {couponApplied && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>

            {shipping === 0 && (
              <p className="free-shipping-note">✓ You qualified for free shipping!</p>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg checkout-btn"
            >
              Proceed to Checkout
            </button>

            <div className="trust-badges">
              <p>🔒 Secure checkout with SSL encryption</p>
              <p>✓ 30-day money-back guarantee</p>
              <p>📦 Free returns on eligible items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
