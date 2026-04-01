import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      setMessage('Added to cart!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!product) return null

  return (
    <div className="page-container">
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <div className="product-detail-price">${product.price.toFixed(2)}</div>
          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">✓ {product.stock} in stock</span>
            ) : (
              <span className="out-of-stock">✗ Out of stock</span>
            )}
          </div>
          {product.stock > 0 && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn">−</button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="qty-btn">+</button>
              </div>
            </div>
          )}
          {message && <div className="success-message">{message}</div>}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="btn btn-primary btn-large"
          >
            {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
        </div>
      </div>
    </div>
  )
}
