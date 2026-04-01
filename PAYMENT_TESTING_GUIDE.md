# 🧪 Payment System - Quick Testing Guide

## ⚡ Quick Start (5 minutes)

### Prerequisites

- Backend running on port 5000
- Frontend running on port 3000
- Logged in user account

---

## 📱 Test Case 1: Debit Card Payment

### Expected Flow:

```
Checkout → Select Debit Card → See BANK/ACCOUNT DETAILS →
Upload Screenshot → Order Confirmed
```

### Steps:

1. **Go to Checkout**
   - Add products to cart
   - Click "Proceed to Checkout"
   - Fill all shipping fields

2. **Select Payment Method**
   - Choose: "💳 Debit Card (Stripe)"
   - Click "Place Order"

3. **Review Account Details** ⭐ NEW
   - You should see an account details box
   - Look for: Account Number, Bank Name, IBAN
   - Do NOT close this page

4. **Make Payment** (Simulated)
   - Copy the account number displayed
   - Send exact amount to the account (in real scenario)
   - For testing: just click "✅ I Have Made The Payment"

5. **Enter OTP**
   - Check browser console for test OTP
   - Enter the 6-digit code shown in console
   - Click "Verify OTP"

6. **Upload Screenshot**
   - Select any image file (JPG/PNG, max 5MB)
   - (For testing, use any screenshot image from your computer)
   - Click "Upload Screenshot & Complete Order"

7. **Verify Completion**
   - Should show "Order placed successfully!"
   - Redirected to order confirmation page
   - Order number displayed with tracking info

---

## 💳 Test Case 2: Stripe Payment

### Steps:

1. Same as above, but select "💳 Stripe Payment"
2. You should see Stripe payment method indicator
3. Click "I Have Made The Payment"
4. Continue with OTP and screenshot

---

## 📱 Test Case 3: EasyPaisa

### Expected:

- Account Number: **03001234567**
- Account Name: **DevHub Store**
- Amount Range: PKR 500 - 100,000

### Steps:

1. Select "📱 EasyPaisa" from payment methods
2. Review account details with EasyPaisa number
3. Continue with OTP verification
4. Upload screenshot

---

## 🏦 Test Case 4: Bank Transfer

### Expected:

- Bank Name: **National Bank**
- Account #: **1234567890123**
- IBAN: **PK36NWAB0000001234567890123**
- Amount Range: PKR 1,000 - 500,000

### Steps:

1. Select "🏦 Bank Transfer"
2. Review full bank account details with IBAN
3. Continue with OTP verification
4. Upload screenshot

---

## 💰 Test Case 5: Cash on Delivery (COD)

### Expected:

- **No payment details screen**
- **No OTP required**
- **No screenshot upload**
- Order placed immediately

### Steps:

1. Select "💵 Cash on Delivery (COD)"
2. Click "Place Order"
3. Should redirect to order confirmation **immediately**
4. No payment screens should appear

---

## 🔍 What to Look For

### ✅ Should See:

- [ ] Account details box appears for online payment
- [ ] Account number/EasyPaisa number is visible
- [ ] Payment instructions are clear
- [ ] Amount to pay is displayed prominently
- [ ] "I Have Made The Payment" button appears
- [ ] OTP input field appears after clicking button
- [ ] File upload area appears after OTP verification
- [ ] Image preview after selecting file
- [ ] Success message after upload
- [ ] Redirect to order confirmation

### ❌ Should NOT See:

- [ ] Direct redirect to confirmation (for online payment)
- [ ] Blank account details box
- [ ] Missing payment instructions
- [ ] No OTP field after selecting payment method

---

## 🐛 Debugging

### If Step 2 (Account Details) Doesn't Appear:

1. Open Browser Console (F12)
2. Check for JavaScript errors
3. Verify PaymentFlow component is imported in CheckoutPage
4. Check that order was created (should see order ID in console)

### If OTP Doesn't Appear:

1. Check backend logs for `/api/payments/initialize` endpoint
2. Verify JWT token is being sent in requests
3. Check if backend payment routes are registered

### If Screenshot Can't Be Uploaded:

1. Verify file is JPEG or PNG
2. Check file size is under 5MB
3. Ensure JWT token is valid
4. Check backend `/api/payments/upload-screenshot` endpoint

---

## 📊 Test Checklist

Create a test session and check off each item:

### Payment Method Selection

- [ ] Debit Card option available
- [ ] Stripe option available
- [ ] EasyPaisa option available
- [ ] JazzCash option available
- [ ] Bank Transfer option available

### Account Details Display

- [ ] Details appear after selecting payment method
- [ ] For Cards: Shows card type
- [ ] For EasyPaisa: Shows mobile number (0300...)
- [ ] For Bank: Shows account number and IBAN

### OTP Flow

- [ ] OTP input appears after "I Have Made Payment"
- [ ] Can enter 6 digits
- [ ] Resend button works
- [ ] Cooldown timer shows 30 seconds

### Screenshot Upload

- [ ] Can select image file
- [ ] Image preview appears
- [ ] Can change file
- [ ] File size validation works
- [ ] Only JPG/PNG accepted

### Final Confirmation

- [ ] Order confirmation page appears
- [ ] Order number is visible
- [ ] Payment method is saved
- [ ] Order status shows "pending verification"

---

## 🎬 Video Test Scenario

**Duration: ~2 minutes**

1. (0:00-0:15) Fill shipping form
2. (0:15-0:20) Select Debit Card
3. (0:20-0:25) Review account details
4. (0:25-0:30) Click "I Have Made Payment"
5. (0:30-0:40) Enter OTP from console
6. (0:40-1:00) Select and upload screenshot
7. (1:00-1:10) Verify order confirmation
8. (1:10-2:00) Check admin panel for pending payment verification

---

## 📞 Support Test Checklist

Test these scenarios for support:

- [ ] User updates payment method after rejection
- [ ] User cancels and retries payment
- [ ] User uploads wrong screenshot (should reject)
- [ ] User enters wrong OTP (should show attempt counter)
- [ ] User tries payment twice for same order
- [ ] Payment timeout handling

---

## ✅ Acceptance Criteria

All tests PASS if:

1. ✅ Debit Card shows account details (not blank)
2. ✅ User can review payment info before confirming
3. ✅ OTP flow works (verify + resend)
4. ✅ Screenshot upload works
5. ✅ Order is created AFTER payment completion
6. ✅ COD bypasses payment flow
7. ✅ All error messages are user-friendly
8. ✅ Mobile responsive and works on all devices

---

**Ready to Test?** Start with Test Case 1! 🚀
