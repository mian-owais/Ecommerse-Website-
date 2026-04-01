import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, cartTotal, fetchCart } = useCart()
  const [form, setForm] = useState({ name: '', address: '', city: '', zip: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.address || !form.city || !form.zip) {
      setError('All fields are required'); return
    }
    setLoading(true); setError('')
    try {
      await api.post('/orders', {
        shippingName: form.name,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingZip: form.zip
      })
      await fetchCart()
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart'); return null
  }

  return (
    <div className="page-container">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <div className="checkout-form">
          <h2>Shipping Information</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="form-input" />
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" className="form-input" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="New York" className="form-input" />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input name="zip" value={form.zip} onChange={handleChange} placeholder="10001" className="form-input" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? 'Placing Order...' : `Place Order — $${cartTotal.toFixed(2)}`}
            </button>
          </form>
        </div>
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.id} className="summary-item">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
