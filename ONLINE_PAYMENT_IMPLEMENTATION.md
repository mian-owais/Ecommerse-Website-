# Online Payment Integration Guide

## Overview

This feature implements a complete online payment flow with OTP verification specifically for EasyPaisa, JazzCash, and Bank Transfer payment methods.

## Architecture

### Backend Components

#### 1. **Models** (`backend/src/models/Order.js`)

- **onlinePaymentDetails**: Stores payment account information
- **otpVerification**: Tracks OTP status and attempts
- **paymentScreenshot**: Stores payment proof with admin verification status
- **paymentStatus**: Updated states for online payments

#### 2. **Services** (`backend/src/services/otpService.js`)

- `generateOTP()`: Generates 6-digit OTP
- `sendOTP()`: Sends OTP to user (10-minute expiry)
- `verifyOTP()`: Validates entered OTP with attempt tracking
- `resendOTP()`: Allows resending OTP with cooldown
- In-memory storage (use Redis in production)

#### 3. **Controllers** (`backend/src/controllers/paymentController.js`)

- `initializePayment`: Starts payment flow, sends OTP
- `verifyPaymentOTP`: Validates OTP, unlocks screenshot upload
- `resendPaymentOTP`: Resends OTP with 30-second cooldown
- `uploadPaymentScreenshot`: Handles payment proof upload
- `verifyPaymentScreenshot`: Admin verification of payment
- `getPaymentDetails`: User views payment status
- `getPaymentMethods`: Lists available payment methods

#### 4. **Routes** (`backend/src/routes/payments.js`)

```
POST   /api/payments/initialize           - Start payment
POST   /api/payments/verify-otp            - Verify OTP
POST   /api/payments/resend-otp            - Resend OTP
POST   /api/payments/upload-screenshot     - Upload proof
GET    /api/payments/:orderId              - Get details
GET    /api/payments/methods               - Get methods (public)
PUT    /api/payments/:orderId/verify-screenshot - Admin verify
```

#### 5. **Config** (`backend/src/config/paymentConfig.js`)

Payment method configurations with account details.

### Frontend Components

#### 1. **PaymentFlow Component** (`frontend/src/components/PaymentFlow.js`)

3-Step Payment Process:

1. **Select Payment Method**: Choose EasyPaisa, JazzCash, or Bank Transfer
2. **OTP Verification**: Enter 6-digit OTP with resend capability
3. **Screenshot Upload**: Upload payment confirmation with optional reference

#### 2. **PaymentFlow Styling** (`frontend/src/styles/PaymentFlow.css`)

- Responsive design
- Gradient backgrounds
- Step indicators
- Error/Success alerts with animations
- File upload preview

#### 3. **API Utilities** (`frontend/src/utils/api.js`)

- `paymentAPI.initializePayment()`
- `paymentAPI.verifyOTP()`
- `paymentAPI.resendOTP()`
- `paymentAPI.uploadScreenshot()`
- `paymentAPI.getPaymentDetails()`
- `paymentAPI.verifyPaymentScreenshot()`

## Payment Flow

### User (Customer) Flow

```
1. Checkout Page
   ↓
2. Select Online Payment Method (instead of COD)
   ↓
3. Click "Pay Online"
   ↓
4. System initializes payment & sends OTP
   ↓
5. User receives OTP via SMS/Email
   ↓
6. User enters OTP in app
   ↓
7. OTP verified successfully
   ↓
8. Payment Method Details shown (Account #, Amount, Reference)
   ↓
9. User makes payment externally (EasyPaisa/JazzCash/Bank)
   ↓
10. User uploads screenshot of payment confirmation
    ↓
11. System receives screenshot
    ↓
12. Order status: "Awaiting Admin Verification"
    ↓
13. Admin verifies screenshot
    ↓
14. Order confirmed (Payment Verified)
    ↓
15. Order Processing begins
```

### Admin (Store) Flow

```
1. Admin Panel → Payments/Orders
   ↓
2. View pending payment screenshots
   ↓
3. Admin reviews screenshot proof
   ↓
4. Verify payment received via payment portal
   ↓
5. Click "Approve Payment"
   ↓
6. System sends notification to user
   ↓
7. Order moves to processing stage
```

## Payment Statuses

| Status                | Meaning                           | Next Action             |
| --------------------- | --------------------------------- | ----------------------- |
| `pending`             | COD order, awaiting COD selection | Admin confirms receipt  |
| `otp-sent`            | OTP sent to user                  | User enters OTP         |
| `otp-verified`        | OTP successfully verified         | User uploads screenshot |
| `awaiting-screenshot` | Waiting for payment proof         | User uploads screenshot |
| `screenshot-uploaded` | Proof received, pending review    | Admin verifies          |
| `verified`            | Payment verified by admin         | Order processing        |
| `failed`              | Payment rejected by admin         | User retries            |
| `cancelled`           | User cancelled payment            | Restart checkout        |

## OTP Configuration

```javascript
{
  OTP_LENGTH: 6,           // Digits
  OTP_EXPIRY: 10 * 60 * 1000,    // 10 minutes
  MAX_ATTEMPTS: 5,         // Failed tries allowed
  RESEND_COOLDOWN: 30 * 1000    // 30 seconds between resends
}
```

## Payment Methods

### 1. EasyPaisa

- **Account**: 03001234567
- **Account Name**: DevHub Store
- **Min Amount**: PKR 500
- **Max Amount**: PKR 100,000
- **Fee**: 0%

### 2. JazzCash

- **Account**: 03100234567
- **Account Name**: DevHub Commerce
- **Min Amount**: PKR 500
- **Max Amount**: PKR 100,000
- **Fee**: 0%

### 3. Bank Transfer

- **Bank**: National Bank
- **Account Number**: 1234567890123
- **Account Title**: DevHub Store
- **IBAN**: PK36NWAB0000001234567890123
- **Min Amount**: PKR 1,000
- **Max Amount**: PKR 500,000
- **Fee**: 0.5%

## Implementation Steps

### Backend Setup (Completed)

1. ✅ Updated Order model with payment fields
2. ✅ Created OTP service
3. ✅ Created Payment config
4. ✅ Created Payment controller
5. ✅ Created Payment routes
6. ✅ Added routes to server
7. ✅ Created multer for file uploads

### Frontend Setup (Completed)

1. ✅ Created PaymentFlow component
2. ✅ Created PaymentFlow CSS
3. ✅ Added payment API utilities
4. ✅ Ready to integrate into CheckoutPage

## Security Features

1. **OTP Verification**: 6-digit OTP with expiration
2. **Attempt Limiting**: Max 5 failed attempts per OTP
3. **Rate Limiting**: 30-second cooldown on resends
4. **File Validation**: Only JPEG/PNG, max 5MB
5. **Authorization**: JWT authentication on all protected routes
6. **Admin Verification**: Two-step verification (screenshot + manual review)

## Error Handling

```javascript
// OTP Errors
-"OTP not found. Please request a new OTP." -
  "OTP has expired. Please request a new OTP." -
  "Too many failed attempts. Please request a new OTP." -
  `Invalid OTP. ${remainingAttempts} attempts remaining.` -
  // File Errors
  "Invalid file type. Only JPEG and PNG are allowed." -
  "File size exceeds 5MB limit" -
  // Authorization Errors
  "Unauthorized access" -
  "Order not found";
```

## Testing Checklist

- [ ] User selects online payment method
- [ ] OTP generated and sent
- [ ] OTP verification works
- [ ] OTP resend works with cooldown
- [ ] OTP expiration works
- [ ] Payment details displayed correctly
- [ ] File upload works with preview
- [ ] File validation works
- [ ] Screenshot upload succeeds
- [ ] Admin can view payment screenshots
- [ ] Admin can approve/reject payments
- [ ] Order status updates correctly
- [ ] User receives notifications

## Production Considerations

1. **OTP Service**: Replace in-memory with Redis
2. **SMS Gateway**: Integrate Twilio/AWS SNS for SMS OTP
3. **Email Service**: Send OTP via email backup
4. **Payment Verification**: Integrate with actual payment portals
5. **File Storage**: Use AWS S3/Cloudinary for screenshots
6. **Admin Dashboard**: Add payment verification UI
7. **Notifications**: Add real-time notifications for payment status
8. **Audit Logging**: Log all payment transactions

## Database Migrations

Order model updates:

```javascript
- paymentMethod enum: added 'easypaisa', 'jazzcash', 'bank-transfer'
- paymentStatus enum: added new statuses
- onlinePaymentDetails: stores account info
- otpVerification: tracks OTP attempts
- paymentScreenshot: stores proof with admin notes
```

## API Response Examples

### Initialize Payment

```json
{
  "success": true,
  "message": "Payment initialized. OTP sent successfully.",
  "data": {
    "orderId": "64...",
    "orderNumber": "ORD-...",
    "paymentInfo": {
      "method": "easypaisa",
      "amount": 4500,
      "accountNumber": "03001234567",
      "accountName": "DevHub Store"
    },
    "otpInfo": {
      "expiresIn": 600,
      "maskedContact": "***...7567",
      "note": "OTP has been sent to ***...7567"
    }
  }
}
```

### Verify OTP

```json
{
  "success": true,
  "message": "OTP verified successfully. Please upload payment screenshot.",
  "data": {
    "orderId": "64...",
    "nextStep": "upload-screenshot"
  }
}
```

### Upload Screenshot

```json
{
  "success": true,
  "message": "Payment screenshot uploaded successfully. Admin will verify within 24 hours.",
  "data": {
    "orderId": "64...",
    "orderNumber": "ORD-...",
    "screenshotUrl": "/uploads/payment-...",
    "status": "pending-verification"
  }
}
```

## Next Steps

1. Integrate PaymentFlow component into CheckoutPage
2. Add payment method selection logic to checkout
3. Create Admin Payment Verification UI
4. Add payment status notifications
5. Implement real payment gateway integration
6. Add transaction auditing
7. Performance testing and optimization
