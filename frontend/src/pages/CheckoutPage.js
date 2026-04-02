import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutPage.css';
import { cartAPI, ordersAPI } from '../utils/api';
import PaymentFlow from '../components/PaymentFlow';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    paymentMethod: 'cod'
  });

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.success) {
        setCart(response.data);
        if (response.data.items.length === 0) {
          navigate('/cart');
        }
      }
    } catch (err) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    console.log('Validating form with data:', formData);
    
    if (!formData.fullName || !formData.fullName.trim()) {
      setError('❌ Full name is required');
      console.log('Validation failed: Full name missing');
      return false;
    }
    if (!formData.email || !formData.email.trim() || !formData.email.includes('@')) {
      setError('❌ Valid email is required');
      console.log('Validation failed: Email invalid');
      return false;
    }
    if (!formData.phone || !formData.phone.trim() || formData.phone.trim().length < 10) {
      setError('❌ Valid phone number required (at least 10 digits)');
      console.log('Validation failed: Phone invalid, length:', formData.phone.length);
      return false;
    }
    if (!formData.address || !formData.address.trim()) {
      setError('❌ Street address is required');
      console.log('Validation failed: Address missing');
      return false;
    }
    if (!formData.city || !formData.city.trim()) {
      setError('❌ City is required');
      console.log('Validation failed: City missing');
      return false;
    }
    if (!formData.state || !formData.state.trim()) {
      setError('❌ State/Province is required');
      console.log('Validation failed: State missing');
      return false;
    }
    if (!formData.zipCode || !formData.zipCode.trim()) {
      setError('❌ ZIP/Postal code is required');
      console.log('Validation failed: ZIP code missing');
      return false;
    }
    console.log('✓ Form validation passed!');
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Place Order clicked - Cart state:', cart);

    // Verify cart has items
    if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      console.error('❌ Cart is empty or invalid:', cart);
      setError('❌ Your cart is empty. Add items before placing an order.');
      return;
    }

    console.log('✓ Cart verified with', cart.items.length, 'items');

    // Validate form fields
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });  // Scroll to error message
      return;
    }

    console.log('✓ Form validation passed');

    setIsProcessing(true);

    try {
      console.log('Sending order to backend...');
      const response = await ordersAPI.createOrder({
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod
      });

      console.log('Order API Response:', response);

      if (response.success) {
        const orderData = response.data;
        
        // Check if payment method is online payment
        const onlinePaymentMethods = ['debit-card', 'credit-card', 'stripe', 'easypaisa', 'jazzcash', 'bank-transfer'];
        
        if (onlinePaymentMethods.includes(formData.paymentMethod)) {
          // Show payment flow instead of immediately completing
          console.log('Showing payment flow for order:', orderData._id);
          setOrderCreated(orderData);
          setShowPaymentFlow(true);
          setSuccess('✓ Order created. Now complete the payment.');
        } else {
          // COD - directly complete the order
          setSuccess('✓ Order placed successfully!');
          setTimeout(() => {
            navigate('/order-confirmation', {
              state: {
                orderNumber: orderData.orderNumber,
                trackingNumber: orderData.trackingNumber,
                totalPrice: orderData.totalPrice,
                estimatedDelivery: orderData.estimatedDelivery,
                message: orderData.message
              }
            });
          }, 2000);
        }
      } else {
        console.error('Order creation failed:', response.message);
        setError('❌ ' + (response.message || 'Failed to place order. Please try again.'));
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError('❌ ' + (err.message || 'Failed to place order. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentComplete = () => {
    console.log('Payment completed for order:', orderCreated._id);
    setSuccess('✓ Payment verified! Order confirmed.');
    
    setTimeout(() => {
      navigate('/order-confirmation', {
        state: {
          orderNumber: orderCreated.orderNumber,
          trackingNumber: orderCreated.trackingNumber,
          totalPrice: orderCreated.totalPrice,
          estimatedDelivery: orderCreated.estimatedDelivery,
          message: 'Thank you! Your payment has been successfully processed.'
        }
      });
    }, 2000);
  };

  const handlePaymentCancel = () => {
    if (window.confirm('Are you sure you want to cancel the payment? Your order will be saved as pending.')) {
      navigate('/profile');
    }
  };

  if (loading) {
    return <div className="checkout-loading">Loading checkout...</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-continue-shopping">
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <div className="checkout-container">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Show PaymentFlow instead of form when online payment is selected */}
      {showPaymentFlow && orderCreated ? (
        <div className="payment-flow-wrapper">
          <PaymentFlow 
            order={orderCreated}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        </div>
      ) : (
        <div className="checkout-content">
          {/* Shipping Information */}
          <div className="checkout-form-section">
            <h2>Shipping Address</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-row">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State/Province"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP/Postal Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="USA">United States</option>
                  <option value="CAN">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              {/* Payment Method */}
              <h2 style={{marginTop: '30px'}}>Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <span>��� Cash on Delivery (COD)</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === 'credit-card'}
                    onChange={handleInputChange}
                  />
                  <span>��� Credit Card (Stripe)</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit-card"
                    checked={formData.paymentMethod === 'debit-card'}
                    onChange={handleInputChange}
                  />
                  <span>��� Debit Card (Stripe)</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={formData.paymentMethod === 'stripe'}
                    onChange={handleInputChange}
                  />
                  <span>��� Stripe Payment</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="easypaisa"
                    checked={formData.paymentMethod === 'easypaisa'}
                    onChange={handleInputChange}
                  />
                  <span>��� EasyPaisa</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="jazzcash"
                    checked={formData.paymentMethod === 'jazzcash'}
                    onChange={handleInputChange}
                  />
                  <span>��� JazzCash</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank-transfer"
                    checked={formData.paymentMethod === 'bank-transfer'}
                    onChange={handleInputChange}
                  />
                  <span>��� Bank Transfer</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-place-order"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.productId} className="summary-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="totals-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-info">
              <p>✓ Free shipping on orders over $50</p>
              <p>✓ 30-day money back guarantee</p>
              <p>✓ Secure checkout</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
