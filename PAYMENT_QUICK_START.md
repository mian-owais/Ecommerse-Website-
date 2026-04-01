# Quick Integration Guide - Online Payment Feature

## Files Created

### Backend

1. **`backend/src/services/otpService.js`** - OTP generation & verification
2. **`backend/src/config/paymentConfig.js`** - Payment method configurations
3. **`backend/src/controllers/paymentController.js`** - Payment business logic
4. **`backend/src/routes/payments.js`** - Payment API routes
5. **Updated `backend/src/models/Order.js`** - Added payment fields
6. **Updated `backend/src/server.js`** - Added payment routes

### Frontend

1. **`frontend/src/components/PaymentFlow.js`** - 3-step payment component
2. **`frontend/src/styles/PaymentFlow.css`** - Complete styling
3. **Updated `frontend/src/utils/api.js`** - Added payment API calls

### Documentation

1. **`ONLINE_PAYMENT_IMPLEMENTATION.md`** - Complete feature documentation

## Quick Start - 3 Steps

### Step 1: Backend is Ready ✅

All backend components are created and integrated:

- OTP service with 10-minute expiry
- Payment controller with all endpoints
- Routes registered in server.js
- File upload configured with multer

```bash
# Backend is ready to run
npm start
```

### Step 2: Test Payment APIs

```bash
# Example cURL commands to test backend

# Initialize Payment
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "paymentMethod": "easypaisa",
    "phoneNumber": "03001234567"
  }'

# Verify OTP
curl -X POST http://localhost:5000/api/payments/verify-otp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "otp": "123456"
  }'

# Upload Screenshot
curl -X POST http://localhost:5000/api/payments/upload-screenshot \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "orderId=ORDER_ID" \
  -F "screenshot=@/path/to/screenshot.jpg" \
  -F "paymentReference=TXN123456"
```

### Step 3: Frontend Integration (Choose Approach)

#### Option A: Simple Integration (Recommended)

Update CheckoutPage to show PaymentFlow component when user selects online payment:

```jsx
import PaymentFlow from "../components/PaymentFlow";

// In CheckoutPage JSX:
{
  formData.paymentMethod !== "cod" && !orderCreated && (
    <PaymentFlow
      order={orderData}
      onPaymentComplete={handlePaymentComplete}
      onCancel={() =>
        setFormData((prev) => ({ ...prev, paymentMethod: "cod" }))
      }
    />
  );
}
```

#### Option B: Full Checkout Flow

Create a multi-step checkout:

1. Step 1: Shipping address
2. Step 2: Payment method selection
3. Step 3: Order creation
4. Step 4: PaymentFlow (if online payment)

## Component Usage

### PaymentFlow Props

```jsx
<PaymentFlow
  order={{
    _id: "mongoid",
    totalPrice: 4500,
    shippingAddress: {
      email: "user@example.com",
    },
  }}
  onPaymentComplete={(paymentData) => {
    // Handle successful payment
    // Redirect to order confirmation
  }}
  onCancel={() => {
    // Handle payment cancellation
    // Go back to checkout
  }}
/>
```

### Payment Flow States

1. **select-payment**: Choose payment method
2. **otp-verification**: Enter OTP
3. **screenshot-upload**: Upload payment proof

## Configuration Options

### Payment Methods (in `paymentConfig.js`)

Edit to add/update payment account details:

```javascript
EASYPAISA: {
  name: 'EasyPaisa',
  icon: '💳',
  accountNumber: '03001234567',
  accountName: 'DevHub Store',
  // ... more config
}
```

### OTP Settings (in `paymentConfig.js`)

```javascript
OTP_CONFIG = {
  OTP_LENGTH: 6,
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN: 30 * 1000, // 30 seconds
};
```

## Testing Scenarios

### Test Case 1: Complete Payment Flow

```
1. Select EasyPaisa
2. Receive OTP (check console)
3. Enter OTP: 123456 (auto-generated in console)
4. Upload screenshot
5. Verify success
```

### Test Case 2: OTP Expiry

```
1. Initialize payment
2. Wait 10 minutes
3. Try to verify OTP
4. Should see: "OTP has expired"
5. Click Resend OTP
```

### Test Case 3: Max Attempts

```
1. Initialize payment
2. Enter wrong OTP 5 times
3. Should see: "Too many failed attempts"
4. Click Resend OTP to get new OTP
```

### Test Case 4: File Validation

```
1. OTP verified
2. Try uploading non-image file
3. Should be rejected
4. Try uploading >5MB image
5. Should be rejected
6. Upload valid image (JPEG/PNG, <5MB)
7. Should succeed
```

## Admin Payment Verification

### In Admin Panel (to be created)

1. View pending payments
2. Download screenshot
3. Verify in payment portal
4. Click "Approve" or "Reject"
5. System updates order status

### API Endpoint for Admin

```javascript
PUT /api/payments/:orderId/verify-screenshot
Body: {
  verified: true,
  notes: "Payment confirmed in portal"
}
```

## Development vs Production

### Development (Current State)

- OTP stored in memory (resets on server restart)
- OTP logged to console for testing
- File uploads to local /uploads folder
- Mock payment methods

### Production Changes Needed

1. **OTP Storage**: Redis instead of memory
2. **SMS Gateway**: Integrate Twilio/AWS SNS
3. **File Storage**: AWS S3 or Cloudinary
4. **Payment Verification**: Real payment portal API
5. **Notifications**: Email/SMS notification service

## Debugging

### Check OTP in Console

```javascript
// In browser console:
// OTP appears in backend terminal logs when initialized
```

### View Uploaded Screenshots

```
/public/uploads/payment-*.jpg
```

### Check Order Payment Status

```javascript
// In User Orders page:
order.paymentStatus; // 'verified', 'pending', etc.
order.paymentScreenshot.url; // Screenshot URL
order.otpVerification; // OTP status
```

## Common Issues & Solutions

| Issue                      | Cause                 | Solution              |
| -------------------------- | --------------------- | --------------------- |
| OTP not sending            | No SMS gateway        | Check console for OTP |
| Screenshot upload fails    | Wrong file type       | Use JPEG/PNG only     |
| Order not confirmed        | Admin not verified    | Check admin panel     |
| Payment endpoint not found | Routes not registered | Restart backend       |
| 401 Unauthorized           | Missing token         | Login first           |

## Next Features to Add

1. **Payment Gateway Integration**
   - EasyPaisa API
   - JazzCash API
   - Bank portal API

2. **Admin Payment Dashboard**
   - Pending payments list
   - Screenshot viewer
   - Approval workflow
   - Payment history

3. **Notifications**
   - Email on OTP
   - SMS on verification
   - Confirmation on approval

4. **Analytics**
   - Payment success rate
   - Failed transaction tracking
   - Revenue by payment method

5. **Refunds**
   - Refund request UI
   - Admin approval workflow
   - Payment reversal handler

## Support Files

- **Full Documentation**: `ONLINE_PAYMENT_IMPLEMENTATION.md`
- **API Examples**: See above or check routes file
- **Payment Config**: `backend/src/config/paymentConfig.js`
- **OTP Service**: `backend/src/services/otpService.js`

---

**Status**: ✅ Complete and Ready for Integration

All components are built and tested. Ready to integrate into the main checkout flow!
