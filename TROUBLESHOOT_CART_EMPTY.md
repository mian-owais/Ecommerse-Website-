# 🔍 Troubleshoot: Cart Empty on Checkout

If you're getting "Your cart is empty" error on checkout, follow these steps:

## ✅ Step 1: Check if Items Are in CartPage

1. **Add items to cart** → Add 2-3 products
2. **Go to CartPage** → Click cart icon or `/cart`
3. **Check:**
   - ✓ Do you see the items listed?
   - ✓ Can you update quantities?
   - ✓ Do totals update?

If YES → Go to Step 2  
If NO → Issue is with cart storage, check backend

---

## ✅ Step 2: Open Browser Console & Test

1. **Open Developer Tools** → Press `F12`
2. **Go to Console tab**
3. **Add items to cart** then **Click "Proceed to Checkout"**
4. **Check console for messages** (look for "Cart response")

### What to Look For:

```javascript
// In console, you should see:
Cart response: {
  success: true,
  data: {
    _id: "...",
    userId: "...",
    items: [
      { productId: "...", name: "...", price: 99.99, quantity: 2 }
    ]
  }
}
```

If you see this → Step 3  
If you see empty items array → Items not saved to cart

---

## ✅ Step 3: Verify Backend Cart Endpoint

1. **Open Terminal** (keep backend running)
2. **Open new terminal** and test:

```bash
# First, get your JWT token (from localStorage in browser console)
# Then run this command (replace TOKEN with your actual token):

curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer TOKEN"
```

You should see cart with items:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "items": [
      { "productId": "...", "name": "...", "price": 99.99, "quantity": 2 }
    ]
  }
}
```

---

## ✅ Step 4: Check Network Requests

1. **Open Developer Tools** → `F12`
2. **Go to Network tab**
3. **Add items to cart**
4. **Filter for XHR requests**
5. **Look for requests to:**
   - `/api/cart/add` → Should have status 200
   - `/api/products/*` → Should have status 200

**Check the Response:**

- Click on `/api/cart/add` request
- Go to Response tab
- Verify success: true and items are in data

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cart is empty" shows immediately on checkout page

**Cause:** Items not in database  
**Fix:**

```javascript
// In browser console:
// Get your token
localStorage.getItem("authToken");

// Then add items to cart manually:
fetch("/api/cart/add", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_TOKEN_HERE",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    productId: "product-id-here",
    quantity: 2,
    price: 99.99,
    name: "Test Product",
    image: "📦",
  }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Issue 2: "Failed to load cart" error

**Cause:** JWT token expired or invalid  
**Fix:**

- Logout and login again
- Check if authToken exists: `localStorage.getItem('authToken')`

### Issue 3: Cart shows on CartPage but not on CheckoutPage

**Cause:** Cart fetch on CheckoutPage failing  
**Fix:**

- Check browser console for fetch errors
- Verify user is still logged in
- Try refreshing the page

---

## 🛠️ Quick Debugging Checklist

- [ ] Items show on CartPage
- [ ] Quantities can be updated
- [ ] Total price updates correctly
- [ ] Console shows "Cart response" with items
- [ ] curl command returns items
- [ ] Network request `/api/cart` has status 200
- [ ] JWT token exists in localStorage
- [ ] User is logged in

If all checked → Contact support with console screenshots

---

## 📊 Test Data to Use

```javascript
// Sample product to add to cart via console:
{
  productId: "637f1a1a1a1a1a1a1a1a1a1a",  // actual ID from url
  quantity: 1,
  price: 99.99,
  name: "Test Product",
  image: "📦"
}
```

---

## 🆘 If Still Failing

1. **Clear localStorage:**

```javascript
// In console:
localStorage.clear();
// Then refresh page and login again
```

2. **Check backend logs:**

```bash
# Terminal where backend runs
# Should show errors when you click "Proceed to Checkout"
```

3. **Restart everything:**

```bash
# Terminal 1:
cd backend
npm run dev

# Terminal 2 (new):
cd frontend
npm start
```

4. **Create fresh test:**
   - Logout completely
   - Login with new account
   - Add ONE item
   - Try checkout

---

## ✅ Success Indicators

✓ CartPage shows items  
✓ Checkout page loads (not empty cart message)  
✓ Form appears with shipping fields  
✓ Order summary shows items  
✓ Can fill form and click "Place Order"  
✓ Email received after order

---

**Still having issues?** Check the browser console for exact error messages and share them!
