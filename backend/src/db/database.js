const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../ecommerce.db');
const db = new Database(DB_PATH);

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_name TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_zip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Seed products if none exist
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count === 0) {
    const insert = db.prepare(
      'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const seedProducts = [
      ['Wireless Bluetooth Headphones', 'Premium noise-cancelling headphones with 30-hour battery life and crystal-clear audio.', 79.99, 'https://via.placeholder.com/300x200?text=Headphones', 'Electronics', 50],
      ['Mechanical Gaming Keyboard', 'RGB backlit mechanical keyboard with tactile switches, N-key rollover, and USB-C connectivity.', 129.99, 'https://via.placeholder.com/300x200?text=Keyboard', 'Electronics', 35],
      ['4K USB-C Monitor', '27-inch 4K IPS display with USB-C power delivery, HDR support, and ultra-thin bezels.', 399.99, 'https://via.placeholder.com/300x200?text=Monitor', 'Electronics', 20],
      ['Classic Fit Polo Shirt', 'Soft cotton-blend polo shirt available in multiple colors. Perfect for casual and semi-formal occasions.', 34.99, 'https://via.placeholder.com/300x200?text=Polo+Shirt', 'Clothing', 100],
      ['Slim Fit Chino Pants', 'Stretch chino pants with a modern slim fit. Wrinkle-resistant fabric for all-day comfort.', 49.99, 'https://via.placeholder.com/300x200?text=Chino+Pants', 'Clothing', 75],
      ['JavaScript: The Good Parts', 'A deep dive into the best features of JavaScript by Douglas Crockford. Essential for every developer.', 24.99, 'https://via.placeholder.com/300x200?text=JS+Book', 'Books', 60],
      ['Stainless Steel Water Bottle', 'Double-walled vacuum insulated bottle keeps drinks cold 24h or hot 12h. BPA-free, 32oz capacity.', 27.99, 'https://via.placeholder.com/300x200?text=Water+Bottle', 'Home', 80],
      ['Smart LED Desk Lamp', 'Touch-controlled desk lamp with adjustable color temperature, USB charging port, and memory function.', 44.99, 'https://via.placeholder.com/300x200?text=Desk+Lamp', 'Home', 45],
    ];
    const insertMany = db.transaction((products) => {
      for (const p of products) insert.run(...p);
    });
    insertMany(seedProducts);
    console.log('Seeded 8 products');
  }
}

module.exports = { db, initDB };
