import React from 'react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        <p className="footer-tagline">Quality products delivered to your door.</p>
      </div>
    </footer>
  )
}
