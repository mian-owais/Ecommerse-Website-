import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return }
    setLoading(true)
    try {
      const res = await api.get('/cart')
      setItems(res.data)
    } catch (err) {
      console.error('Failed to fetch cart', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    await api.post('/cart', { productId, quantity })
    await fetchCart()
  }

  const updateQuantity = async (productId, quantity) => {
    await api.put(`/cart/${productId}`, { quantity })
    await fetchCart()
  }

  const removeFromCart = async (productId) => {
    await api.delete(`/cart/${productId}`)
    await fetchCart()
  }

  const clearCart = async () => {
    await api.delete('/cart/clear')
    setItems([])
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
