import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid grid grid-3">
            <div className="footer-section">
              <h3>About Us</h3>
              <p>E-Commerce Store is your one-stop destination for premium quality products with exceptional customer service.</p>
            </div>

            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/products">Products</a></li>
                <li><a href="/cart">Cart</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Contact Us</h3>
              <p>Email: mianowais980@gmail.com</p>
              <p>Phone: +92 (349) 8977120</p>
              <p>Address: GIKI, Topi, Swabi, KPK, Pakistan </p>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom text-center">
            <p>&copy; {currentYear} E-Commerce Store. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
