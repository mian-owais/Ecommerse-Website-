# E-Commerce Platform - Week 3 Setup Instructions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas cloud)
- npm or yarn package manager

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:

- express, cors, body-parser (existing)
- mongoose (existing for MongoDB)
- jsonwebtoken (new for JWT auth)
- bcryptjs (new for password hashing)

### 2. Configure Environment Variables

Edit `backend/.env` and update as needed:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-environment
JWT_EXPIRE=7d
```

**Important:** In production, use a strong JWT_SECRET and update from environment variables.

### 3. Initialize Database

Run the seed script to populate with sample data:

```bash
npm run seed
```

This will create 10 sample products in MongoDB.

### 4. Start Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000/api`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will open on `http://localhost:3000`

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Product Routes (Public)

- `GET /api/products` - Get all products (with pagination, filtering, sorting)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get all categories
- `GET /api/products/search/:query` - Search products
- `GET /api/products/category/:category` - Filter by category
- `GET /api/products/:id` - Get single product

### Product Routes (Admin Only)

- `POST /api/products` - Create product (requires admin auth)
- `PUT /api/products/:id` - Update product (requires admin auth)
- `DELETE /api/products/:id` - Delete product (requires admin auth)

### Cart Routes (Requires Auth)

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders Routes (Requires Auth)

- `POST /api/orders/create` - Create order
- `GET /api/orders/user` - Get user's orders
- `GET /api/orders/:orderId` - Get order details

## Frontend Pages

### Public Pages

- `/` - Home page (featured products, categories)
- `/products` - Product listing (search, filter, sort, pagination)
- `/product/:id` - Product details (with related products)
- `/login` - Login page
- `/signup` - Signup page

### Protected Pages (Requires Login)

- `/cart` - Shopping cart
- `/orders` - Order history (to be implemented)

### Admin Pages (Requires Admin Role)

- `/admin` - Admin panel (add/edit/delete products)

## Testing the Application

### 1. Test Registration & Login

1. Go to `http://localhost:3000/signup`
2. Create a new account (min 6 char password)
3. You'll be logged in automatically
4. Check localStorage to see the JWT token

### 2. Test Product Browsing

1. Homepage shows featured products
2. Products page has search, filter, sort working
3. Click product to view details

### 3. Test Cart Functionality

1. Login first (important!)
2. Add products to cart
3. Go to cart page to see items
4. Update quantities, remove items
5. Cart persists across page navigation

### 4. Test Add to Cart from Product Page

1. Go to any product
2. Increase quantity
3. Click "Add to Cart"
4. Success message appears for 2 seconds
5. Cart count in header updates

### 5. Test Admin Panel

1. Create a new user during signup
2. Manually set role to 'admin' in MongoDB:
   ```
   db.users.updateOne(
     { email: "youremail@example.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Logout and login again
4. Click "Admin" link in header
5. Try adding/editing/deleting products

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  image: String,
  stock: Number,
  sku: String (unique),
  rating: Number,
  reviewsCount: Number,
  features: [String],
  specifications: Map,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features Implemented

✅ **User Authentication**

- Register with email/password
- Login with JWT token
- Password hashing with bcryptjs
- Protected routes middleware
- Logout functionality

✅ **Cart Persistence**

- MongoDB-backed cart storage
- Cart linked to authenticated user
- Add/update/remove items
- Cart calculations (subtotal, tax, shipping, total)

✅ **Admin Panel**

- Admin-only access with role checking
- Add new products form
- Edit existing products
- Delete products (soft delete)
- Product table with all details
- Form validation

✅ **Protected Routes**

- Cart routes require authentication
- Admin routes require admin role
- JWT bearer token validation
- Automatic redirect to login if not authenticated

✅ **Header Navigation**

- Display user greeting when logged in
- Show admin link for admin users
- Logout button
- Login/Signup links for guests

## Debugging

### Check if Backend is Running

```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"Backend server is running!"}`

### Check JWT Token

```javascript
// In browser console:
localStorage.getItem("authToken");
```

### View MongoDB Collections

```bash
# Using MongoDB CLI or Compass:
use ecommerce
db.users.find()
db.products.find()
db.carts.find()
```

### Common Issues

**Problem:** "Failed to fetch products" on Product page

- **Solution:** Ensure backend is running on port 5000
- Check MONGODB_URI in .env
- Ensure MongoDB connection is successful

**Problem:** "Not authorized to access this route" when adding to cart

- **Solution:** Make sure you're logged in
- Check localStorage for authToken
- Ensure JWT_SECRET matches between frontend and backend

**Problem:** Admin route showing "Not authorized as admin"

- **Solution:** Update user role in MongoDB to 'admin'
- Logout and login again to refresh token

## Next Steps (Future Enhancements)

- [ ] Order Management System
- [ ] Payment Integration (Stripe/PayPal)
- [ ] Email Notifications
- [ ] User Profile Management
- [ ] Product Reviews & Ratings
- [ ] Wishlist Functionality
- [ ] Inventory Management
- [ ] Analytics Dashboard
- [ ] Multi-currency Support
- [ ] Deployment to production server

## Deployment Checklist

Before deploying to production:

- [ ] Update JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas connection string (not local)
- [ ] Add HTTPS certificate
- [ ] Set up proper error logging
- [ ] Configure CORS for specific domains
- [ ] Set up environment variables on hosting platform
- [ ] Test all authentication flows
- [ ] Verify cart functionality with real data
- [ ] Test admin panel operations
- [ ] Set up automated backups for MongoDB
- [ ] Implement rate limiting for API endpoints
- [ ] Add security headers
- [ ] Test on multiple devices and browsers

## Support

For issues or questions, check:

1. Backend console logs (check for MongoDB connection errors)
2. Browser console (check for fetch/API errors)
3. Network tab (check API response codes)
4. MongoDB connection status
