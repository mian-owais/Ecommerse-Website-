import React, { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading orders...</div>

  if (orders.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-orders">
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="order-meta">
                <span className={`order-status status-${order.status}`}>{order.status}</span>
                <span className="order-total">${order.total.toFixed(2)}</span>
              </div>
            </div>
            {order.shipping_name && (
              <p className="order-shipping">Shipping to: {order.shipping_name}, {order.shipping_address}, {order.shipping_city} {order.shipping_zip}</p>
            )}
            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <img src={item.image} alt={item.name} className="order-item-image" />
                  <span>{item.name}</span>
                  <span>×{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
