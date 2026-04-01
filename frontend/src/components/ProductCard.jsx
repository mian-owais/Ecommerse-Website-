import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    try {
      await addToCart(product.id, 1)
    } catch (err) {
      console.error('Failed to add to cart', err)
    }
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description?.slice(0, 80)}...</p>
          <div className="product-footer">
            <span className="product-price">${product.price.toFixed(2)}</span>
            <span className="product-stock">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        className="btn btn-primary btn-full"
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
