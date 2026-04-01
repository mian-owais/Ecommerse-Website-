const fs = require('fs');

const file = 'c:/Users/DELL/Desktop/DevelopersHub/Ecommerse/frontend/src/pages/CheckoutPage.js';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  "import PaymentFlow from '../components/PaymentFlow';",
  "import PaymentFlow from '../components/PaymentFlow';\nimport PaymentMethodAccordion from '../components/PaymentMethodAccordion';\nimport OTPModal from '../components/OTPModal';"
);

// State additions
const statePattern = "const [orderCreated, setOrderCreated] = useState(null);";
const stateAdditions = `
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const paymentOptions = [
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      icon: 'í²µ',
      type: 'cod'
    },
    {
      id: 'credit-card',
      name: 'Debit / Credit Card (Stripe)',
      icon: 'í²³',
      type: 'card'
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: 'í³±',
      type: 'mobile-wallet',
      accountNumber: '03001234567'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: 'í³²',
      type: 'mobile-wallet',
      accountNumber: '03100234567'
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: 'í¿¦',
      type: 'bank',
      bankName: 'Meezan Bank',
      accountTitle: 'Store Official Account',
      accountNumber: '0123456789',
      iban: 'PK12MEZN000123456789',
      branchCode: '0123'
    }
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
    }
  };
`;
content = content.replace(statePattern, statePattern + "\n" + stateAdditions);

// Form data extension
content = content.replace(
  "country: 'USA',\n    paymentMethod: 'cod'\n  });",
  "country: 'USA',\n    paymentMethod: 'cod',\n    cardNumber: '',\n    cardExpiry: '',\n    cardCvc: '',\n    cardName: '',\n    paymentReference: ''\n  });"
);

// Form submit logic
const submitLogic = `
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate custom payment inputs
    if (['credit-card'].includes(formData.paymentMethod)) {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        setError('Please enter a valid card number');
        return;
      }
      if (!formData.cardExpiry || !formData.cardCvc || !formData.cardName) {
        setError('Please fill all card details');
        return;
      }
      // Show OTP modal for cards
      setShowOtpModal(true);
      return;
    }

    if (['easypaisa', 'jazzcash', 'bank-transfer'].includes(formData.paymentMethod)) {
      if (!paymentScreenshot) {
        setError('Please upload the payment screenshot/receipt');
        return;
      }
      if (!formData.paymentReference) {
        setError('Please enter the transaction reference ID');
        return;
      }
    }

    await processOrderExecution();
  };

  const verifyOtpAndPay = async (otp) => {
    setShowOtpModal(false);
    await processOrderExecution();
  };

  const processOrderExecution = async () => {
    console.log('Sending order to backend...');
    setIsProcessing(true);
`;

const getRestOfSubmit = `    try {
      const response = await ordersAPI.createOrder({
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod
      });

      if (response.success) {
        const orderData = response.data;
        
        // If screenshot is required, upload it
        if (paymentScreenshot && ['easypaisa', 'jazzcash', 'bank-transfer'].includes(formData.paymentMethod)) {
          const formDataObj = new FormData();
          formDataObj.append('orderId', orderData._id);
          formDataObj.append('screenshot', paymentScreenshot);
          formDataObj.append('paymentReference', formData.paymentReference);
          
          try {
            await fetch('/api/payments/upload-screenshot', {
              method: 'POST',
              headers: {
                'Authorization': \`Bearer \${localStorage.getItem('authToken')}\`
              },
              body: formDataObj
            });
          } catch(err) {
            console.error('Screenshot upload error, but order placed:', err);
          }
        }

        setSuccess('âœ“ Order placed successfully!');
        setCart({ items: [], totalAmount: 0 }); // Clear cart locally
        
        setTimeout(() => {
          navigate('/order-confirmation', {
            state: {
              orderNumber: orderData.orderNumber,
              trackingNumber: orderData.trackingNumber,
              totalPrice: orderData.totalPrice,
              estimatedDelivery: orderData.estimatedDelivery,
              message: \`Thank you! Your payment via \${formData.paymentMethod} has been received.\`
            }
          });
        }, 2000);
      } else {
        setError('âŒ ' + (response.message || 'Failed to place order.'));
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError('âŒ ' + (err.message || 'Failed to place order.'));
    } finally {
      setIsProcessing(false);
    }
  };
`;

// Looking for old handlePlaceOrder to replace
const startIdx = content.indexOf('const handlePlaceOrder = async (e) => {');
const endIdx = content.indexOf('const handlePaymentComplete = () => {');
content = content.substring(0, startIdx) + submitLogic + getRestOfSubmit + "\n  " + content.substring(endIdx);

// Removing JSX Payment Method section to replace with accordion
const jsxStart = content.indexOf('            {/* Payment Method */}');
const jsxEnd = content.indexOf('            <button\n              type="submit"');

if (jsxStart !== -1 && jsxEnd !== -1) {
  content = content.substring(0, jsxStart) + 
`            {/* Payment Method Accordions */}
            <h2 style={{marginTop: '30px', marginBottom: '15px'}}>Payment Method</h2>
            <div className="payment-methods-accordion-container">
              {paymentOptions.map(method => (
                <PaymentMethodAccordion
                  key={method.id}
                  method={method}
                  selectedMethod={formData.paymentMethod}
                  onChange={(id) => setFormData({...formData, paymentMethod: id})}
                  formData={formData}
                  setFormData={setFormData}
                  handleFileChange={handleFileChange}
                />
              ))}
            </div>

` + content.substring(jsxEnd);
}

// Add OTP Modal to Render
const finalDivIdx = content.lastIndexOf('</div>\n  );\n};');
if (finalDivIdx !== -1) {
    content = content.substring(0, finalDivIdx) + 
`      {showOtpModal && (
        <OTPModal 
          onVerify={verifyOtpAndPay}
          onCancel={() => setShowOtpModal(false)}
        />
      )}\n    ` + content.substring(finalDivIdx);
}


fs.writeFileSync(file, content);
console.log('CheckoutPage updated');
