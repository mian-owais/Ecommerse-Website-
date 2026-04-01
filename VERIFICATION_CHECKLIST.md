# ✅ Pre-Checkout Verification Checklist

Use this checklist to ensure everything is ready before testing checkout.

---

## 🚀 Backend Status

- [ ] **Backend running?** Run in terminal: `npm run dev` (from backend folder)
  - Should see: `Server running on http://localhost:5000`
- [ ] **Database connected?**
  - Check logs for: `MongoDb database connected!`
  - Verify `.env` has valid `MONGODB_URI`

- [ ] **Environment variables set?**

  ```bash
  # frontend/.env should have:
  REACT_APP_API_URL=http://localhost:5000

  # backend/.env should have:
  PORT=5000
  MONGODB_URI=your_mongodb_connection
  JWT_SECRET=your_secret_key
  EMAIL_USER=your_email
  EMAIL_PASSWORD=your_password  # (optional for now)
  ```

- [ ] **Cart routes responding?** In terminal:

  ```bash
  # Get your token first from browser console:
  # localStorage.getItem('authToken')

  curl -X GET http://localhost:5000/api/cart \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```

  Should return: `{ "success": true, "data": { "items": [...] } }`

---

## 🎨 Frontend Status

- [ ] **Frontend running?** Run in terminal: `npm start` (from frontend folder)
  - Should open: `http://localhost:3000`
  - No errors in console

- [ ] **User logged in?**
  - Check browser console: `localStorage.getItem('authToken')`
  - Should return a token (long string starting with `eyJ`)
  - If not → Login page will redirect automatically

- [ ] **Products visible?**
  - Go to `/products` or `/`
  - See at least 2-3 products
  - Each product has image, name, price "Add to Cart" button

- [ ] **No console errors?**
  - Open DevTools: `F12`
  - Go to Console tab
  - Should be clean (no red errors)
  - Some warnings are OK

---

## 🛒 Cart Functionality

### Add Items to Cart

- [ ] **Product page loads**
  - Go to `/products` → See product list
  - Click any product → Details page opens

- [ ] **Add to Cart button works**
  - Click "Add to Cart" button
  - Should see success message or notification
  - No errors in console

- [ ] **Check browser storage**
  - Open DevTools → Application tab
  - Go to LocalStorage → http://localhost:3000
  - Look for anything related to cart (may be in authToken or separate)

### View Cart

- [ ] **Cart page loads**
  - Click cart icon (or go to `/cart`)
  - See the products you added
  - Quantities, prices, subtotal visible

- [ ] **Cart has correct data structure**
  - Open Console (`F12` → Console)
  - Run:

  ```javascript
  fetch("/api/cart", {
    headers: { Authorization: "Bearer " + localStorage.getItem("authToken") },
  })
    .then((r) => r.json())
    .then((d) => console.log(JSON.stringify(d, null, 2)));
  ```

  - Should show items array with products

- [ ] **Modify cart works**
  - Change quantity → Color updates
  - Remove item → Item disappears
  - Cart updates without page reload

---

## 🛵 Checkout Flow

### Before Checkout

- [ ] **Items in cart**
  - Cart page shows your items (not empty)
  - Total price shows correctly

- [ ] **"Proceed to Checkout" button visible**
  - On cart page, see the checkout button
  - Button is clickable (not grayed out)

### Checkout Page

- [ ] **Checkout page loads**
  - Click "Proceed to Checkout"
  - Page changes to `/checkout`
  - See checkout form

- [ ] **Order summary visible**
  - Right side shows "Order Summary"
  - Items listed with quantities
  - Subtotal, tax, shipping visible
  - Total price shown

- [ ] **Form fields present**
  - Full Name field
  - Email field
  - Phone field
  - Address fields (Street, City, State, Zip)
  - Country dropdown
  - Payment method dropdown
  - "Place Order" button

- [ ] **NOT seeing "Your cart is empty"**
  - If you see this message, items didn't load
  - Check console for errors (run QUICK_CONSOLE_TEST.md)

---

## 💳 Order Placement

- [ ] **Fill checkout form**
  - Full Name: "John Doe"
  - Email: "john@example.com"
  - Phone: "1234567890"
  - Address: "123 Main St"
  - City: "New York"
  - State: "NY"
  - Zip: "10001"
  - Country: "USA"
  - Payment: COD (default is fine)

- [ ] **Click "Place Order"**
  - Button should show loading state
  - Form validation triggers if missing fields

- [ ] **Order creates successfully**
  - See success message: "✓ Order placed successfully!"
  - Page redirects to `/order-confirmation`
  - Order number and tracking ID shown

---

## 📧 Order Confirmation

- [ ] **Confirmation page loads**
  - Shows "Order Confirmed!" heading
  - Order number displayed (e.g., "ORD-123456")
  - Tracking number/ID visible (copyable)

- [ ] **Confirmation details shown**
  - Total amount
  - Estimated delivery date
  - FAQ section
  - Support contact

- [ ] **Check database**
  - Backend running → Check MongoDB for new order in `orders` collection
  - Should see document with orderNumber, items, shippingAddress

- [ ] **Check email** (if configured)
  - Check your email inbox
  - Should have order confirmation from your app
  - Email shows order details, tracking ID, estimated delivery

---

## 🔍 Verify Data Persistence

### In Browser Console

```javascript
// Check cart is cleared after order
fetch("/api/cart", {
  headers: { Authorization: "Bearer " + localStorage.getItem("authToken") },
})
  .then((r) => r.json())
  .then((d) => {
    console.log("Cart after order:", d.data.items?.length || 0, "items");
    console.log("Should be empty: ", d.data.items?.length === 0);
  });
```

- [ ] **Cart is empty after order** (items were cleared)
- [ ] **Can add to cart again** (cart works after order)

### In MongoDB (if you have access)

```javascript
// Check order was saved
db.orders.findOne();

// Check user's orders
db.orders.find({ userId: ObjectId("YOUR_USER_ID") });

// Check cart was cleared
db.carts.findOne({ userId: ObjectId("YOUR_USER_ID") });
```

---

## 🆘 Emergency Restart (if things break)

```bash
# Terminal 1:
cd backend
npm run dev

# Terminal 2:
cd frontend
npm start

# Then in browser:
# 1. Clear cache: Ctrl+Shift+Delete
# 2. Close all browser tabs to your app
# 3. Open new tab to http://localhost:3000
# 4. Login again
# 5. Try fresh test
```

---

## 📋 Quick Status Check

Run this in console to see overall status:

```javascript
console.clear();
console.log("=== ECOMMERCE APP STATUS ===\n");

// 1. Token
const token = localStorage.getItem("authToken");
console.log("✓ Logged in:", !!token);

// 2. API Reachable
fetch("/api/cart", {
  headers: { Authorization: "Bearer " + token },
})
  .then((r) => r.json())
  .then((cart) => {
    console.log("✓ Backend connected:", cart.success);
    console.log("✓ Cart items:", cart.data?.items?.length || 0);
    console.log("\n=== READY FOR CHECKOUT ===");
    console.log(
      cart.data?.items?.length > 0
        ? "✅ YES - Proceed!"
        : "❌ NO - Add items first",
    );
  });
```

---

## ✅ Final Checklist Before Support

Before asking for help, confirm:

- [ ] Backend is running
- [ ] Frontend is running
- [ ] User is logged in (token exists)
- [ ] At least 1 item added to cart
- [ ] Cart page shows items correctly
- [ ] Checkout page loads (not showing "empty cart")
- [ ] Form can be filled
- [ ] "Place Order" can be clicked

If all ✅ → Checkout should work!  
If any ❌ → Run QUICK_CONSOLE_TEST.md for diagnosis

---

**Next Steps:**

1. Go through checklist above
2. Mark off what's working
3. For anything that fails → Run test from QUICK_CONSOLE_TEST.md
4. Share results if still stuck
