import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, cartAPI } from '../utils/api';
import { onCartUpdate } from '../utils/cartEvents';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userStr));
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setCartCount(0);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch cart count when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartCount();
      
      // Listen for cart update events
      const cleanup = onCartUpdate(() => {
        console.log('🔔 Cart update event received, fetching new count...');
        fetchCartCount();
      });
      
      // Set up interval to refresh cart count every 2 seconds
      const interval = setInterval(fetchCartCount, 2000);
      
      return () => {
        clearInterval(interval);
        cleanup();
      };
    }
  }, [isLoggedIn]);

  const fetchCartCount = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.success && response.data && response.data.items) {
        const count = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
        console.log('🛒 Cart count updated:', count);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userStr));
      // Fetch cart immediately after auth check
      setTimeout(() => fetchCartCount(), 100);
    } else {
      setIsLoggedIn(false);
      setCartCount(0);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      setCartCount(0);
      navigate('/');
      setMenuOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-wrapper flex-between">
          <div className="logo">
            <Link to="/">
              <h1>E-Commerce Store</h1>
            </Link>
          </div>

          <nav className={`nav ${menuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>Products</Link>
            <Link to="/cart" className="nav-link" onClick={() => setMenuOpen(false)}>Cart</Link>
            {isLoggedIn && user?.role === 'admin' && (
              <Link to="/admin" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>Admin</Link>
            )}
          </nav>

          <div className="header-actions flex">
            <Link to="/cart" className="cart-icon" onClick={() => setMenuOpen(false)}>
              🛒
              <span className="cart-count">{cartCount}</span>
            </Link>

            <div className="auth-actions flex">
              {isLoggedIn ? (
                <>
                  <span className="user-greeting">Hi, {user?.name}!</span>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="auth-link" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/signup" className="auth-link signup-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>

            <button 
              className="menu-toggle show-mobile"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
