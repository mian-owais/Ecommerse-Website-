# Quick Test Guide - Checkout & Email System

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Email Service

Choose your email testing service:

#### Option A: Gmail (Fast - 2 mins)

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" → "Windows Computer"
3. Copy the 16-character password
4. Update `backend/.env`:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=paste-the-16-char-password
EMAIL_FROM=noreply@ecommerce.com
```

#### Option B: Mailtrap (Best - 3 mins)

1. Sign up free at https://mailtrap.io
2. Go to Inbox → SMTP Settings
3. Copy settings to `backend/.env`:

```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=465
EMAIL_USER=copy-from-mailtrap
EMAIL_PASSWORD=copy-from-mailtrap
EMAIL_FROM=noreply@ecommerce.com
```

#### Option C: Ethereal (No Account - 1 min)

```env
# Ethereal gives free test emails - no signup needed
EMAIL_USER=ephemeral@example.com
EMAIL_PASSWORD=ephemeral-password
```

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

Wait for: `Server running on http://localhost:5000`

### Step 3: Start Frontend

```bash
cd frontend
npm start
```

Wait for: Page opens at localhost:3000

---

## 🧪 Test the Complete Flow (3 Minutes)

### 1. Register & Login

- Click "Sign Up" in top-right
- Create account: `test@example.com` / `Test@123`
- You'll auto-login and see cart page

### 2. Add Products to Cart

- Click "Home" or Products → Add 2-3 items to cart
- Click "View Cart" or go to `/cart`

### 3. Go to Checkout

- In CartPage, click **"Proceed to Checkout"** button
- You're now on CheckoutPage (`/checkout`)

### 4. Fill Shipping Form

```
Full Name: John Test User
Email: test@example.com  (← important for email)
Phone: 1234567890
Address: 123 Main Street
City: New York
State: NY
ZIP: 10001
Country: USA
Payment: Select "Cash on Delivery"
```

### 5. Place Order

- Click **"Place Order"** button
- Wait 2 seconds (you'll see "Processing...")
- SUCCESS! Redirected to `/order-confirmation`

### 6. Check Email Received!

#### If using Gmail:

- Go to your Gmail inbox in a new tab
- **Subject:** "Order Confirmation - Order #ORD-..."
- Contains: Order number, Tracking ID, Items, Total Price, etc.

#### If using Mailtrap:

- Go to https://mailtrap.io
- Click Inbox
- **New email arrived!** Click to view
- See complete email template with all order details

---

## ✅ What You Should See

### Email Section:

```
📧 Order Confirmation Email Contains:

✓ Order Number: ORD-1711353600000-1
✓ Tracking ID: TRK-1711353600000-ABC123XYZ
✓ Order Items Table
  - Product Name | Qty | Price
✓ Pricing Breakdown
  - Subtotal: $XX.XX
  - Tax (8%): $XX.XX
  - Shipping: FREE / $10
  - Total: $XX.XX
✓ Shipping Address
✓ Estimated Delivery Date
✓ Next Steps (includes tracking info)
```

### Confirmation Page (`/order-confirmation`):

```
✓ Success checkmark icon 🎉
✓ Order number displayed
✓ Tracking number (can copy with button)
✓ Total amount
✓ Estimated delivery date
✓ Email confirmation message
✓ Next steps bullet points
✓ FAQ section
✓ Support contact info
✓ "Back to Home" & "Continue Shopping" buttons
```

---

## 🔍 Verify Order in Database

### Option 1: MongoDB Compass GUI

```
1. Open MongoDB Compass
2. Connect to: mongodb://localhost:27017
3. Navigate to: ecommerce > orders collection
4. Find your order by email
5. View all fields including orderNumber, trackingNumber
```

### Option 2: MongoDB Shell

```bash
# In a new terminal:
mongo
> use ecommerce
> db.orders.findOne({ "shippingAddress.email": "test@example.com" })
```

You should see:

```json
{
  _id: ObjectId(...),
  orderNumber: "ORD-1711353600000-1",
  trackingNumber: "TRK-1711353600000-ABC123",
  userId: ObjectId(...),
  totalPrice: 99.99,
  orderStatus: "pending",
  paymentStatus: "pending",
  items: [...]
}
```

---

## 📱 Test Responsiveness

### Desktop (1200px+)

- CheckoutPage: 2-column layout (form on left, summary on right)
- Summary sticky on right side
- All fields full width

### Tablet (768px-1024px)

- CheckoutPage: 1-column layout (stacked)
- Summary below form
- Fields still readable

### Mobile (< 480px)

- All fields single column
- Summary full width
- Buttons large for touch
- Font sizes increased

**Test in browser DevTools:**

```
Inspect → Device Toolbar → Select device (iPhone 12, iPad, etc.)
```

---

## 🐛 Troubleshooting

### Issue: "Cart is empty" on checkout

**Solution:** Make sure you added items before clicking checkout

### Issue: No email received

**Solutions:**

1. Check email service credentials in `.env`
2. Restart backend: `npm run dev`
3. **For Gmail:** Allow less secure apps or use App Password
4. **For Mailtrap:** Check "Demo Inbox" (not spam folder)
5. Check backend console for errors

### Issue: Order creation fails with 500 error

**Solution:**

1. Check backend console for error message
2. Verify MongoDB is running: `mongod` in separate terminal
3. Verify JWT token is valid (user is logged in)
4. Restart backend

### Issue: Form validation errors

**Solution:** Ensure all fields are filled:

- Email must contain @
- Phone must be 10+ digits
- All address fields required

---

## 🎯 Advanced Testing

### Test Order Tracking

1. Copy Tracking Number from confirmation page
2. Open browser console and run:

```javascript
fetch("/api/orders/track/TRK-...-ABC123")
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Test Order History

1. After placing order, reload the app
2. Create a "My Orders" page or check backend:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/orders/my-orders
```

### Test Admin Status Update (Backend)

```bash
# Get order ID from MongoDB first
curl -X PUT http://localhost:5000/api/orders/ORDER_ID_HERE/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "orderStatus": "shipped" }'
```

This should trigger shipment notification email!

---

## 📊 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Can register new account
- [ ] Can add items to cart
- [ ] Checkout page loads
- [ ] Form fields validate properly
- [ ] Order created in database
- [ ] Email received in inbox
- [ ] Email contains correct order number
- [ ] Email contains correct tracking ID
- [ ] Email contains correct totals
- [ ] Confirmation page displays
- [ ] Can copy tracking number
- [ ] Responsive on mobile
- [ ] Responsive on tablet

---

## 📞 Support Contacts

**Gmail Issues?**

- https://support.google.com/accounts/answer/185833

**Mailtrap Issues?**

- https://mailtrap.io/blog/smtp-errors/

**MongoDB Issues?**

- `mongod --version` to verify installed
- Check port 27017 not blocked

---

## 🎉 Next Features to Build

After verifying this works, consider:

1. **Payment Integration** - Stripe/PayPal (replace COD option)
2. **Order Tracking Page** - Public tracking without login
3. **Email Templates Customization** - Branding colors/logos
4. **SMS Notifications** - Twilio integration for updates
5. **Invoice Generation** - PDF download in confirmation email
6. **Customer Reviews** - After delivery
7. **Refunds System** - Process returns
8. **Analytics Dashboard** - Order metrics for admin

---

**Happy Testing! 🚀**

If everything works, you have a complete e-commerce platform with:
✅ Shopping cart
✅ User authentication  
✅ Product catalog
✅ Checkout system
✅ Email notifications
✅ Order management
✅ Admin panel

Ready for deployment! 🎊
