# 🚀 Quick Console Test - Copy & Paste

Use these commands in **Browser Console** (F12 → Console tab) to quickly test your cart.

---

## Test 1: Check if You're Logged In

```javascript
// Check your JWT token
const token = localStorage.getItem("authToken");
console.log("Token:", token ? "EXISTS ✓" : "MISSING ✗");
console.log("Token value:", token);
```

**Expected:** You see a long token string starting with `eyJ...`

---

## Test 2: Get Your Current Cart from Backend

```javascript
// Fetch your cart directly
fetch("/api/cart", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("authToken"),
    "Content-Type": "application/json",
  },
})
  .then((r) => r.json())
  .then((data) => {
    console.log("Cart from backend:", data);
    if (data.success && data.data.items) {
      console.log("✓ Cart items found:", data.data.items.length);
      data.data.items.forEach((item, i) => {
        console.log(
          `  ${i + 1}. ${item.name} × ${item.quantity} @ $${item.price}`,
        );
      });
    } else {
      console.log("✗ No items in cart or error");
    }
  });
```

**Expected:** You see your cart items listed with names, quantities, and prices

---

## Test 3: Manually Add Item to Cart (if it's empty)

```javascript
// Add a test product to cart
// First, get a productId from your database

fetch("/api/cart/add", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + localStorage.getItem("authToken"),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    productId: "6733a7a8c1b2d3e4f5g6h7i8", // REPLACE with actual product ID
    name: "Test Product",
    quantity: 2,
    price: 99.99,
    image: "https://via.placeholder.com/300",
  }),
})
  .then((r) => r.json())
  .then((data) => console.log("Add to cart response:", data));
```

**Note:** Replace `6733a7a8c1b2d3e4f5g6h7i8` with an actual product ID from your database

---

## Test 4: Check CheckoutPage Cart Fetch

```javascript
// Simulate what CheckoutPage does
const response = {
  success: true,
  data: {
    _id: "cart123",
    items: [
      { productId: "p1", name: "Product 1", quantity: 2, price: 50 },
      { productId: "p2", name: "Product 2", quantity: 1, price: 100 },
    ],
  },
};

// Verify the CheckoutPage logic
const cartData = response.data;
const cartItems = cartData.items || [];
const hasItems =
  cartData &&
  cartData.items &&
  Array.isArray(cartData.items) &&
  cartData.items.length > 0;

console.log("Cart items:", cartItems);
console.log("Has items?", hasItems);
console.log("Total items:", cartItems.length);
```

**Expected:** Should show `Has items? true` and list your items

---

## Test 5: Check User ID

```javascript
// Your user ID should be in your JWT token
// Decode it:
const token = localStorage.getItem("authToken");
const decoded = JSON.parse(atob(token.split(".")[1]));
console.log("User ID:", decoded.userId);
console.log("User Email:", decoded.email);
```

**Expected:** Shows your user ID and email

---

## Test 6: Verify Cart Collection in MongoDB

**If you have MongoDB Compass or Atlas open:**

```javascript
// Run this in MongoDB
db.carts.findOne(); // Shows first cart

// Or find your specific cart
db.carts.findOne({ userId: ObjectId("YOUR_USER_ID") });
```

---

## Test 7: Full Cart → Checkout Flow

```javascript
// Complete diagnostic:
console.log("=== CHECKOUT DIAGNOSTICS ===");
console.log("1. Token:", localStorage.getItem("authToken") ? "✓" : "✗");

fetch("/api/cart", {
  headers: { Authorization: "Bearer " + localStorage.getItem("authToken") },
})
  .then((r) => r.json())
  .then((cart) => {
    console.log("2. Cart fetch:", cart.success ? "✓" : "✗");
    console.log("3. Items in cart:", cart.data?.items?.length || 0);
    console.log(
      "4. Cart total:",
      cart.data?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0,
    );

    const hasItems = cart.data?.items?.length > 0;
    console.log("5. Ready for checkout:", hasItems ? "✓ YES" : "✗ NO");
  });
```

---

## 🎯 Step by Step Test

1. **Logout** → Clear cart from browser
2. **Login** → Get new token
3. **Add product to cart** → Through UI (click "Add to Cart" button)
4. **Run Test 1** → Verify token exists
5. **Run Test 2** → Verify items appear in cart
6. **Go to Checkout** → Should see items in summary
7. **Fill form** → Complete shipping address
8. **Click "Place Order"** → Should create order
9. **Check email** → Should receive confirmation (if email configured)

---

## ✅ What Success Looks Like

```javascript
// Test 2 output should look like:
Cart from backend: {
  success: true,
  data: {
    _id: "6733a7a8c1b2d3e4f5g6h7i8",
    userId: "6733a7a8c1b2d3e4f5g6h7i8",
    items: [
      {
        _id: "6733a7a8c1b2d3e4f5g6h7i9",
        productId: "6733a7a8c1b2d3e4f5g6h7ia",
        name: "Nike Air Jordan",
        price: 119.99,
        quantity: 2,
        image: "http://..."
      }
    ]
  }
}
✓ Cart items found: 1
  1. Nike Air Jordan × 2 @ $119.99
```

---

## 🆘 Troubleshooting by Test Result

| Test   | Pass            | Fail             | Solution                     |
| ------ | --------------- | ---------------- | ---------------------------- |
| Test 1 | Token exists    | No token         | Login again                  |
| Test 2 | Items shown     | Empty items      | Add items to cart first      |
| Test 3 | Added to cart   | Failed           | Check product ID format      |
| Test 4 | Has items: true | Has items: false | Cart data structure issue    |
| Test 5 | Shows user ID   | Error            | Invalid token format         |
| Test 7 | ✓ YES           | ✗ NO             | Token or cart endpoint issue |

---

## 📞 Paste Results Here If Stuck

If tests fail, run **Test 7** and share the output below (remove sensitive data):

```javascript
// Your output here - helps identify the exact issue!
```

---

**Still need help?** Check the main [TROUBLESHOOT_CART_EMPTY.md](TROUBLESHOOT_CART_EMPTY.md) file for more detailed debugging.
