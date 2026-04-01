# Integration Example - How to Use PaymentFlow in Your Checkout

## Current CheckoutPage Structure (Simplified)

```jsx
// frontend/src/pages/CheckoutPage.js
const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    // ... shipping fields ...
    paymentMethod: 'cod'  // Current payment method
  });

  return (
    <div className="checkout-container">
      {/* Shipping Form */}
      {/* Order Summary */}

      {/* Choice 1: Show PaymentFlow for online payments */}
      {formData.paymentMethod !== 'cod' && (
        <PaymentFlow
          order={currentOrder}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setFormData(...)}
        />
      )}
    </div>
  );
};
```

## Integration Pattern 1: Simple (Recommended for MVP)

### Step 1: Import Component

```jsx
import PaymentFlow from "../components/PaymentFlow";
import { ordersAPI } from "../utils/api";

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    paymentMethod: "cod",
  });

  const [cart, setCart] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // ... existing code ...

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    // If COD, proceed normally
    if (formData.paymentMethod === "cod") {
      // Create order directly
      const response = await ordersAPI.createOrder({
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
      });
      // Handle response...
      return;
    }

    // If online payment, create order first
    try {
      const response = await ordersAPI.createOrder({
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
      });

      if (response.success) {
        setCurrentOrder(response.data);
        setShowPaymentFlow(true); // Show PaymentFlow component
      }
    } catch (err) {
      setError("Error creating order: " + err.message);
    }
  };

  const handlePaymentComplete = (paymentData) => {
    setSuccess(
      "✅ Payment screenshot uploaded successfully! Your order will be confirmed shortly.",
    );

    // Redirect to confirmation after 2 seconds
    setTimeout(() => {
      navigate("/order-confirmation", {
        state: {
          orderNumber: currentOrder.orderNumber,
          trackingNumber: currentOrder.trackingNumber,
          totalPrice: currentOrder.totalPrice,
          message: "Awaiting admin verification of payment",
        },
      });
    }, 2000);
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setCurrentOrder(null);
    setFormData((prev) => ({
      ...prev,
      paymentMethod: "cod",
    }));
  };

  // Render logic
  if (showPaymentFlow && currentOrder) {
    return (
      <PaymentFlow
        order={currentOrder}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handlePaymentCancel}
      />
    );
  }

  // Regular checkout form
  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="checkout-content">
        {/* Shipping Form */}
        <div className="checkout-form-section">
          <h2>Shipping Address</h2>
          <form onSubmit={handlePlaceOrder}>
            {/* All existing form fields */}

            {/* Payment Method */}
            <h2>Payment Method</h2>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="easypaisa"
                  checked={formData.paymentMethod === "easypaisa"}
                  onChange={handleInputChange}
                />
                <span>💳 EasyPaisa</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="jazzcash"
                  checked={formData.paymentMethod === "jazzcash"}
                  onChange={handleInputChange}
                />
                <span>📱 JazzCash</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank-transfer"
                  checked={formData.paymentMethod === "bank-transfer"}
                  onChange={handleInputChange}
                />
                <span>🏦 Bank Transfer</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-place-order"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">{/* Existing summary code */}</div>
      </div>
    </div>
  );
};

export default CheckoutPage;
```

## Integration Pattern 2: Multi-Step Checkout (Advanced)

### For a more advanced checkout flow:

```jsx
const CheckoutPage = () => {
  const [step, setStep] = useState("shipping"); // shipping, payment-method, review, payment-flow

  // ... other state ...

  const handlePaymentMethodSelect = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));

    if (method === "cod") {
      setStep("review"); // Skip payment flow for COD
    } else {
      setStep("payment-flow"); // Go to payment flow
    }
  };

  switch (step) {
    case "shipping":
      return <ShippingForm onNext={() => setStep("payment-method")} />;

    case "payment-method":
      return (
        <div className="payment-selection">
          <h2>Select Payment Method</h2>
          {/* Payment method selection UI */}
          <button onClick={() => handlePaymentMethodSelect("cod")}>
            Cash on Delivery
          </button>
          <button onClick={() => handlePaymentMethodSelect("easypaisa")}>
            EasyPaisa
          </button>
          {/* etc... */}
        </div>
      );

    case "review":
      return <OrderReview onConfirm={handlePlaceOrder} />;

    case "payment-flow":
      return (
        <PaymentFlow
          order={currentOrder}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setStep("payment-method")}
        />
      );
  }
};
```

## Integration Pattern 3: Conditional Payment Methods

### Show different payment methods based on cart value or region:

```jsx
const getAvailablePaymentMethods = () => {
  return [
    {
      id: "cod",
      name: "Cash on Delivery",
      available: true,
      minAmount: 0,
      maxAmount: Infinity,
    },
    {
      id: "easypaisa",
      name: "EasyPaisa",
      available: cartTotal >= 500,
      minAmount: 500,
      maxAmount: 100000,
    },
    {
      id: "jazzcash",
      name: "JazzCash",
      available: cartTotal >= 500,
      minAmount: 500,
      maxAmount: 100000,
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      available: cartTotal >= 1000,
      minAmount: 1000,
      maxAmount: 500000,
    },
  ];
};

// In JSX:
<div className="payment-methods">
  {getAvailablePaymentMethods().map((method) => (
    <label key={method.id} className={!method.available ? "disabled" : ""}>
      <input
        type="radio"
        name="paymentMethod"
        value={method.id}
        checked={formData.paymentMethod === method.id}
        onChange={handleInputChange}
        disabled={!method.available}
      />
      <span>
        {method.name}
        {!method.available && ` (Min ${method.minAmount} required)`}
      </span>
    </label>
  ))}
</div>;
```

## CSS Addition for Payment Methods

```css
/* Add to CheckoutPage.css or PaymentFlow.css */

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.payment-option:hover {
  border-color: var(--secondary-color);
  background-color: rgba(255, 107, 53, 0.05);
}

.payment-option input[type="radio"] {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.payment-option input:checked + span {
  color: var(--secondary-color);
  font-weight: 600;
}

.payment-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-option.disabled input {
  cursor: not-allowed;
}
```

## Data Flow Diagram

```
User selects online payment method
        ↓
Click "Proceed to Payment"
        ↓
Create Order (saved to DB with pending payment)
        ↓
Show PaymentFlow component
        ↓
Step 1: User selects payment method (EasyPaisa/JazzCash/Bank)
        ↓
Backend sends OTP
        ↓
Step 2: User enters OTP
        ↓
OTP verified, payment details shown
        ↓
Step 3: User uploads payment screenshot
        ↓
Backend saves screenshot
        ↓
Order status: "awaiting-admin-verification"
        ↓
Admin reviews screenshot → Approves/Rejects
        ↓
Order status: "verified" or "failed"
        ↓
User redirected to confirmation/error page
```

## Testing the Integration

### Manual Testing Steps

1. Go to checkout page
2. Fill shipping information
3. Select online payment method (e.g., EasyPaisa)
4. Click "Proceed to Payment"
5. PaymentFlow component should display
6. Select payment method
7. Enter OTP (check console/browser logs during dev)
8. Upload screenshot (use any image file)
9. Verify success message

### Expected PaymentFlow Stages

```
Stage 1: Payment Method Selection
├─ User sees 3 payment methods
├─ Selects one method
└─ System initializes payment, sends OTP

Stage 2: OTP Verification
├─ OTP sent to user
├─ Form shows OTP input
├─ User enters OTP
├─ Can resend, Max 5 attempts
└─ OTP verified → Move to Stage 3

Stage 3: Screenshot Upload
├─ Payment details displayed
├─ User uploads screenshot
├─ File validated
├─ Screenshot uploaded
└─ Success → Order awaiting admin verification
```

## Handling Different Scenarios

```jsx
// Success Scenario
if (paymentData.status === "verified") {
  // Order confirmed, show confirmation page
  navigate("/order-confirmation", { state: paymentData });
}

// Pending Scenario
if (paymentData.status === "pending-verification") {
  // Show "Awaiting Admin Verification" message
  showMessage("Your order is awaiting admin verification");
  navigate("/order-status", { state: { orderId: paymentData.orderId } });
}

// Error Scenario
if (paymentData.status === "failed") {
  // Show error and allow retry
  setError("Payment verification failed. Please contact support.");
}
```

## Next Steps After Integration

1. ✅ Import PaymentFlow component
2. ✅ Update handlePlaceOrder logic
3. ✅ Add payment method radio buttons to checkout form
4. ✅ Test with EasyPaisa method
5. ✅ Create Admin Payment Verification UI
6. ✅ Add notification emails
7. ✅ Setup real payment gateway
8. ✅ Deploy to production

---

**Ready to integrate?** Start with Pattern 1 (Simple) and upgrade to Pattern 2 (Multi-Step) if needed!
