# ⚡ Quick Reference Card

Bookmark this! Common commands and shortcuts for debugging.

---

## 🚀 Starting Everything

```bash
# Terminal 1 - Backend:
cd c:\Users\DELL\Desktop\DevelopersHub\Ecommerse\backend
npm run dev

# Terminal 2 - Frontend:
cd c:\Users\DELL\Desktop\DevelopersHub\Ecommerse\frontend
npm start

# Terminal 3 - Database (if using local MongoDB):
mongosh
```

---

## 🔍 Browser Developer Tools (F12)

| Action          | Shortcut            |
| --------------- | ------------------- |
| Open DevTools   | `F12`               |
| Console tab     | `Ctrl+Shift+K`      |
| Network tab     | `Ctrl+Shift+E`      |
| Application tab | `Ctrl+Shift+I`      |
| Clear console   | `Ctrl+L`            |
| Clear cache     | `Ctrl+Shift+Delete` |

---

## 📱 Browser Console One-Liners

```javascript
// Check if logged in
localStorage.getItem("authToken") ? "Logged in ✓" : "Not logged in ✗";

// Check cart
fetch("/api/cart", {
  headers: { Authorization: "Bearer " + localStorage.getItem("authToken") },
})
  .then((r) => r.json())
  .then((d) => console.log(d));

// Check user info
JSON.parse(atob(localStorage.getItem("authToken").split(".")[1]));

// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Check what's in localStorage
console.table(Object.entries(localStorage));

// Test API endpoint
fetch("/api/cart", {
  headers: { Authorization: "Bearer " + localStorage.getItem("authToken") },
})
  .then((r) => r.json())
  .then((d) => console.log("✓ API works:", d.success));
```

---

## 🗄️ MongoDB Commands

```bash
# Start MongoDB shell
mongosh

# After connected:
# List databases
show dbs

# Use your database
use ecommerse

# Show collections
show collections

# View first cart
db.carts.findOne()

# View first order
db.orders.findOne()

# Count orders
db.orders.countDocuments()

# Find orders by user
db.orders.find({ userId: ObjectId("USER_ID_HERE") })

# Clear all orders (careful!)
db.orders.deleteMany({})

# Clear all carts
db.carts.deleteMany({})

# Exit
exit
```

---

## 🧪 Testing Quick Flows

### Add Item to Cart (via console)

```javascript
fetch("/api/cart/add", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + localStorage.getItem("authToken"),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    productId: "PRODUCT_ID_HERE",
    name: "Test Product",
    quantity: 1,
    price: 99.99,
    image: "url...",
  }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Create Order (via console)

```javascript
fetch("/api/orders/create", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + localStorage.getItem("authToken"),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    shippingAddress: {
      fullName: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      address: "123 Main St",
      city: "NYC",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    paymentMethod: "cod",
  }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

---

## 🔧 Quick Fixes

### Clear Everything & Start Fresh

```bash
# Terminal:
# 1. Stop backend (Ctrl+C in Terminal 1)
# 2. Stop frontend (Ctrl+C in Terminal 2)
# 3. Clear cache:

# In browser:
# - F12
# - Ctrl+Shift+Delete
# - Clear all

# Then restart:
npm run dev  # Terminal 1
npm start    # Terminal 2
```

### Restart Just Backend

```bash
# Terminal 1:
Ctrl+C  # Stop process
npm run dev  # Restart
```

### Restart Just Frontend

```bash
# Terminal 2:
Ctrl+C  # Stop process
npm start  # Restart
```

### Force Logout

```javascript
// In browser console:
localStorage.clear();
// Then refresh page
location.reload();
```

---

## 🐛 Common Error Fixes

| Error                   | Command                                                    |
| ----------------------- | ---------------------------------------------------------- |
| "Port already in use"   | Kill process: `npx kill-port 5000` or `npx kill-port 3000` |
| "MongoDb not connected" | Check MongoDB is running: `mongosh` in Terminal 3          |
| "Cannot GET /api/cart"  | Backend not running - run `npm run dev`                    |
| "Unexpected token"      | Clear browser cache & logout/login                         |
| "Not authorized"        | Token expired - logout and login again                     |

---

## 📊 File Locations

| File                     | Path                                          |
| ------------------------ | --------------------------------------------- |
| CheckoutPage.js          | `frontend/src/pages/CheckoutPage.js`          |
| OrderConfirmationPage.js | `frontend/src/pages/OrderConfirmationPage.js` |
| Order Model              | `backend/src/models/Order.js`                 |
| Order Controller         | `backend/src/controllers/orderController.js`  |
| Orders Routes            | `backend/src/routes/orders.js`                |
| Email Service            | `backend/src/services/emailService.js`        |
| Cart Routes              | `backend/src/routes/cart.js`                  |
| Backend .env             | `backend/.env`                                |
| Frontend .env            | `frontend/.env`                               |

---

## 🎯 Debugging Checklist

```
When something doesn't work, check in this order:

1. ✓ Backend running? (Terminal 1 output)
2. ✓ Frontend running? (Browser shows http://localhost:3000)
3. ✓ Logged in? (localStorage.getItem('authToken'))
4. ✓ Items in cart? (cartAPI.getCart())
5. ✓ No console errors? (F12 → Console)
6. ✓ Network requests working? (F12 → Network tab)
7. ✓ Database connected? (MongoDB shows collections)
8. ✓ API responding? (curl or fetch test)
```

---

## 📞 Getting Help

### Step 1: Check Browser Console

```
F12 → Console tab → Look for red errors
```

### Step 2: Check Backend Terminal

```
Look at Terminal 1 output when you perform action
```

### Step 3: Run Diagnostic

```javascript
// Copy this entire block into browser console:
console.clear();
console.log("%c=== DIAGNOSTIC ===", "color: blue; font-size: 14px");
console.log("Token:", !!localStorage.getItem("authToken"));
fetch("/api/cart", {
  headers: { Authorization: "Bearer " + localStorage.getItem("authToken") },
})
  .then((r) => r.json())
  .then((d) => {
    console.log("Cart:", d);
    console.log("Items:", d.data?.items?.length || 0);
  });
```

---

## 🎓 Important URLs

| URL                                      | Purpose            |
| ---------------------------------------- | ------------------ |
| http://localhost:3000                    | Frontend home      |
| http://localhost:3000/products           | Product listing    |
| http://localhost:3000/cart               | Shopping cart      |
| http://localhost:3000/checkout           | Checkout page      |
| http://localhost:3000/order-confirmation | Order confirmation |
| http://localhost:5000                    | Backend API        |
| http://localhost:5000/api/cart           | Cart endpoint      |
| http://localhost:5000/api/orders         | Orders endpoint    |

---

## 🌐 API Endpoints (Quick Reference)

```
GET    /api/cart              → Get user's cart
POST   /api/cart/add          → Add item to cart
PUT    /api/cart/update       → Update item quantity
DELETE /api/cart/remove/:id   → Remove item

POST   /api/orders/create     → Create order (checkout)
GET    /api/orders/my-orders  → Get user's orders
GET    /api/orders/:id        → Get order details
GET    /api/orders/track/:trackingNumber → Track order
PUT    /api/orders/:id/status → Update order status
PUT    /api/orders/:id/cancel → Cancel order
```

---

## 📋 Hotkeys & Shortcuts

| Action             | Shortcut                       |
| ------------------ | ------------------------------ |
| Show/hide DevTools | `F12`                          |
| Reload page        | `F5` or `Ctrl+R`               |
| Hard reload        | `Ctrl+Shift+R`                 |
| Logout (force)     | Ctrl+Shift+Delete then refresh |
| Go to checkout     | `Ctrl+L` then type `/checkout` |
| Search in console  | `Ctrl+F` (in console)          |
| Clear console      | `Ctrl+L`                       |

---

## 🚢 Deployment Check

Before deploying to production:

- [ ] Backend .env has all required variables
- [ ] Frontend .env has correct API URL
- [ ] Database connection string is production
- [ ] Email service is configured
- [ ] Payment gateway integrated (if needed)
- [ ] CORS settings allow your domain
- [ ] SSL/HTTPS enabled
- [ ] Error logging configured
- [ ] Tested complete flow once

---

## 💡 Pro Tips

1. **Always check browser console first** - Most errors show there
2. **Use Firefox for better DevTools** - Often easier to debug
3. **Comment out code instead of deleting** - Easier to revert
4. **Keep Terminal windows side-by-side** - Check both at once
5. **Use `console.log()` extensively** - Best debugging tool
6. **Test with fresh login** - Cache issues are common
7. **MongoDB Compass is your friend** - View database visually
8. **Keep backend running while developing** - Faster fixes

---

## 🎯 Next Time You Need Help

1. **Save this file** - It's your quick reference
2. **Use the guides** - Check TROUBLES SHOOT_CART_EMPTY.md first
3. **Check console** - F12 shows most problems
4. **Restart everything** - Fixes 80% of issues
5. **Clear cache** - Fixes 10% of issues
6. **Database check** - Fixes remaining issues

---

**Bookmark this page! You'll need it.** 📌
