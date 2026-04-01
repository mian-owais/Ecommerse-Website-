import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home']

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = {}
        if (search) params.search = search
        if (category !== 'All') params.category = category
        const res = await api.get('/products', { params })
        setProducts(res.data)
      } catch (err) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    const debounce = setTimeout(fetchProducts, 300)
    return () => clearTimeout(debounce)
  }, [search, category])

  return (
    <div className="page-container">
      <div className="hero">
        <h1>Welcome to ShopEase</h1>
        <p>Discover amazing products at great prices</p>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty">No products found.</div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
