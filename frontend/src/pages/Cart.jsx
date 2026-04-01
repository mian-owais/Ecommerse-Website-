import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, loading, updateQuantity, removeFromCart, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="loading">Loading cart...</div>

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Browse our products and add items to your cart.</p>
          <Link to="/" className="btn btn-primary">Shop Now</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-category">{item.category}</p>
                <p className="cart-item-price">${item.price.toFixed(2)} each</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1} className="qty-btn">−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="qty-btn">+</button>
                </div>
                <p className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.product_id)} className="btn btn-danger btn-sm">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {user ? (
            <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-full">
              Proceed to Checkout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-full">Login to Checkout</Link>
          )}
        </div>
      </div>
    </div>
  )
}
