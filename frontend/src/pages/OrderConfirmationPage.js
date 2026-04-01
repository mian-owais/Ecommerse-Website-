import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/OrderConfirmation.css';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state;

  if (!orderData) {
    return (
      <div className="confirmation-container">
        <div className="error-state">
          <h2>Order Not Found</h2>
          <p>Please complete your checkout to view confirmation.</p>
          <button onClick={() => navigate('/cart')} className="btn-primary">
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        {/* Success Icon */}
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1>Order Confirmed! 🎉</h1>
        <p className="confirmation-message">Your order has been successfully placed.</p>

        {/* Order Details Box */}
        <div className="order-details">
          <div className="detail-item">
            <span className="detail-label">Order Number:</span>
            <span className="detail-value">{orderData.orderNumber}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Tracking ID:</span>
            <span className="detail-value tracking-id">{orderData.trackingNumber}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Total Amount:</span>
            <span className="detail-value amount">${orderData.totalPrice.toFixed(2)}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Estimated Delivery:</span>
            <span className="detail-value">
              {new Date(orderData.estimatedDelivery).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="email-confirmation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <p>{orderData.message}</p>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>✓ You'll receive an order confirmation email shortly</li>
            <li>✓ We'll send tracking information once your package ships</li>
            <li>✓ Use tracking ID below to monitor your delivery</li>
            <li>✓ Items will arrive within 2-3 business days</li>
          </ul>
        </div>

        {/* Tracking Box */}
        <div className="tracking-box">
          <h4>Track Your Order</h4>
          <p>Use this tracking number to track your package:</p>
          <div className="tracking-number">
            {orderData.trackingNumber}
            <button 
              className="btn-copy"
              onClick={() => {
                navigator.clipboard.writeText(orderData.trackingNumber);
                alert('Tracking number copied!');
              }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
          <button onClick={() => navigate('/products')} className="btn-secondary">
            Continue Shopping
          </button>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h4>Frequently Asked Questions</h4>
          <div className="faq-item">
            <p><strong>Can I cancel my order?</strong></p>
            <p>Yes, you can cancel orders in 'pending' or 'processing' status. Check your order status immediately.</p>
          </div>
          <div className="faq-item">
            <p><strong>How long will delivery take?</strong></p>
            <p>Standard delivery takes 2-3 business days. Express shipping may be available for additional cost.</p>
          </div>
          <div className="faq-item">
            <p><strong>What if I receive a damaged item?</strong></p>
            <p>Contact our support team within 48 hours of delivery with photos for immediate replacement.</p>
          </div>
        </div>

        {/* Support Contact */}
        <div className="support-contact">
          <p>Questions? Contact us at <strong>support@ecommerce.com</strong></p>
          <p>Or call us at <strong>1-800-SHOP-NOW</strong></p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
