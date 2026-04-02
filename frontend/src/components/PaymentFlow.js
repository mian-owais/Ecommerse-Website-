import React, { useState, useEffect } from 'react';
import '../styles/PaymentFlow.css';

const PaymentFlow = ({ order, onPaymentComplete, onCancel }) => {
  const [step, setStep] = useState('select-payment'); // select-payment, payment-details, otp-verification, screenshot-upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Payment selection
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedMethodDetails, setSelectedMethodDetails] = useState(null);
  
  // OTP Verification
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Screenshot Upload
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Payment methods from config
  const [paymentMethods] = useState([
    {
      id: 'stripe',
      name: 'Stripe - Credit/Debit Card',
      icon: '💳',
      type: 'card',
      description: 'Pay with your credit or debit card instantly'
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: '📱',
      type: 'bank-transfer',
      description: 'Send payment to EasyPaisa number and upload screenshot'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: '📲',
      type: 'bank-transfer',
      description: 'Send payment to JazzCash number and upload screenshot'
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      type: 'bank-transfer',
      description: 'Transfer to our bank account and upload receipt'
    }
  ]);

  // Account details mapping
  const accountDetails = {
    stripe: {
      description: '💳 Pay securely with your credit or debit card using Stripe'
    },
    easypaisa: {
      accountNumber: '03001234567',
      accountName: 'DevHub Store',
      minAmount: 500,
      maxAmount: 100000,
      instructions: 'Send the payment amount to this EasyPaisa account number and upload the confirmation screenshot'
    },
    jazzcash: {
      accountNumber: '03100234567',
      accountName: 'DevHub Commerce',
      minAmount: 500,
      maxAmount: 100000,
      instructions: 'Send the payment amount to this JazzCash account number and upload the confirmation screenshot'
    },
    'bank-transfer': {
      bankName: 'National Bank',
      accountNumber: '1234567890123',
      accountTitle: 'DevHub Store',
      iban: 'PK36NWAB0000001234567890123',
      minAmount: 1000,
      maxAmount: 500000,
      instructions: 'Transfer the payment amount to this bank account and upload the transfer receipt screenshot'
    }
  };

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    const method = paymentMethods.find(m => m.id === methodId);
    const details = accountDetails[methodId];
    setSelectedMethodDetails({ ...method, ...details });
    setError('');
    setSuccess('');
    
    // Move to payment details step
    setStep('payment-details');
  };

  const handleProceedToOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          orderId: order._id,
          paymentMethod: selectedMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      setSuccess(`✅ OTP sent successfully!`);
      setStep('otp-verification');
      setOtp('');
      setOtpError('');
      setRemainingAttempts(5);
      setResendCooldown(0);

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');

    if (!otp.trim() || otp.length !== 6) {
      setOtpError('❌ Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/payments/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          orderId: order._id,
          otp: otp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setRemainingAttempts(data.remainingAttempts || 0);
        throw new Error(data.message || 'Failed to verify OTP');
      }

      setSuccess('✅ OTP verified successfully! Please upload payment screenshot.');
      setStep('screenshot-upload');
      setOtp('');

      // Auto-clear success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setOtpError('');

    try {
      const response = await fetch('/api/payments/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          orderId: order._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess(`✅ New OTP sent successfully!`);
      setOtp('');
      setResendCooldown(30); // 30 second cooldown
      setRemainingAttempts(5);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleScreenshotSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('❌ Only JPEG and PNG files are allowed');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('❌ File size exceeds 5MB limit');
        return;
      }

      setScreenshot(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreenshotUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setError('');

    if (!screenshot) {
      setError('❌ Please select a screenshot to upload');
      setUploadLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('screenshot', screenshot);
      if (paymentReference) {
        formData.append('paymentReference', paymentReference);
      }

      const response = await fetch('/api/payments/upload-screenshot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload screenshot');
      }

      setSuccess('✅ Screenshot uploaded successfully! Admin will verify within 24 hours.');
      setTimeout(() => {
        onPaymentComplete(data.data);
      }, 2000);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="payment-flow-container">
      {error && <div className="payment-alert alert-error">{error}</div>}
      {success && <div className="payment-alert alert-success">{success}</div>}

      {/* Step 1: Select Payment Method */}
      {step === 'select-payment' && (
        <div className="payment-step">
          <h3>💳 Select Payment Method</h3>
          <p className="payment-amount">Amount to pay: <strong>${order.totalPrice.toFixed(2)}</strong></p>

          <div className="payment-methods-grid">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodSelect(method.id)}
                disabled={loading}
              >
                <div className="method-icon">{method.icon}</div>
                <div className="method-name">{method.name}</div>
                <div className="method-description">{method.description}</div>
              </button>
            ))}
          </div>

          <div className="payment-info-box">
            <h4>📌 Payment Process:</h4>
            <ol>
              <li>Select your preferred payment method</li>
              <li>Review payment account details</li>
              <li>Make the payment to the displayed account</li>
              <li>We'll send you an OTP for verification</li>
              <li>Upload the payment screenshot</li>
              <li>Admin will verify and confirm your order</li>
            </ol>
          </div>

          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Back to Checkout
          </button>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 'payment-details' && selectedMethodDetails && (
        <div className="payment-step">
          <h3>📋 Payment Account Details</h3>
          <p className="payment-amount">Amount to pay: <strong>${order.totalPrice.toFixed(2)}</strong></p>

          <div className="account-details-box">
            <div className="detail-row">
              <span className="label">Payment Method:</span>
              <span className="value">{selectedMethodDetails.name}</span>
            </div>

            {selectedMethodDetails.bankName && (
              <>
                <div className="detail-row">
                  <span className="label">Bank Name:</span>
                  <span className="value">{selectedMethodDetails.bankName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Account Number:</span>
                  <span className="value" style={{fontWeight: 'bold', fontSize: '16px'}}>{selectedMethodDetails.accountNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Account Title:</span>
                  <span className="value">{selectedMethodDetails.accountTitle}</span>
                </div>
                {selectedMethodDetails.iban && (
                  <div className="detail-row">
                    <span className="label">IBAN:</span>
                    <span className="value">{selectedMethodDetails.iban}</span>
                  </div>
                )}
              </>
            )}

            {selectedMethodDetails.accountNumber && !selectedMethodDetails.bankName && (
              <>
                <div className="detail-row">
                  <span className="label">Account Number:</span>
                  <span className="value" style={{fontWeight: 'bold', fontSize: '18px'}}>{selectedMethodDetails.accountNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Account Name:</span>
                  <span className="value">{selectedMethodDetails.accountName}</span>
                </div>
                {selectedMethodDetails.minAmount && (
                  <div className="detail-row">
                    <span className="label">Amount Range:</span>
                    <span className="value">PKR {selectedMethodDetails.minAmount} - {selectedMethodDetails.maxAmount}</span>
                  </div>
                )}
              </>
            )}

            <div className="detail-row">
              <span className="label">Instructions:</span>
              <span className="value">{selectedMethodDetails.instructions || selectedMethodDetails.description}</span>
            </div>
          </div>

          <div className="payment-info-box" style={{backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107'}}>
            <h4>⚠️ Important:</h4>
            <ul>
              <li>Send the exact amount: <strong>${order.totalPrice.toFixed(2)}</strong></li>
              <li>Keep the payment receipt/screenshot ready</li>
              <li>Do not close this page during payment</li>
              <li>After payment, you must upload a screenshot for verification</li>
            </ul>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleProceedToOTP}
            disabled={loading}
            style={{marginTop: '20px'}}
          >
            {loading ? 'Processing...' : '✅ I Have Made The Payment'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setStep('select-payment');
              setSelectedMethod('');
              setSelectedMethodDetails(null);
            }}
            disabled={loading}
          >
            Change Payment Method
          </button>
        </div>
      )}

      {/* Step 3: OTP Verification */}
      {step === 'otp-verification' && (
        <div className="payment-step">
          <h3>🔐 Verify OTP</h3>
          <p>An OTP has been sent to your registered contact. Please enter it below.</p>

          <form onSubmit={handleOTPSubmit}>
            <div className="form-group">
              <label>6-Digit OTP</label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="otp-input"
              />
              {otpError && <span className="input-error">{otpError}</span>}
              <span className="input-hint">Remaining attempts: {remainingAttempts}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="resend-section">
            <p>Didn't receive OTP?</p>
            <button
              className="btn btn-outlined btn-small"
              onClick={handleResendOTP}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setStep('payment-details');
              setOtp('');
              setOtpError('');
            }}
            disabled={loading}
          >
            Back to Payment Details
          </button>
        </div>
      )}

      {/* Step 4: Screenshot Upload */}
      {step === 'screenshot-upload' && (
        <div className="payment-step">
          <h3>📸 Upload Payment Screenshot</h3>
          <p>Please upload a screenshot of your payment confirmation.</p>

          <form onSubmit={handleScreenshotUpload}>
            <div className="form-group">
              <label>Payment Reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Transaction ID or Reference Number"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                disabled={uploadLoading}
              />
            </div>

            <div className="form-group">
              <label>Payment Screenshot</label>
              <div className="file-upload-area">
                {screenshotPreview ? (
                  <>
                    <img src={screenshotPreview} alt="Preview" className="screenshot-preview" />
                    <label className="file-label">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleScreenshotSelect}
                        disabled={uploadLoading}
                        style={{ display: 'none' }}
                      />
                      <span className="change-file-btn">Change File</span>
                    </label>
                  </>
                ) : (
                  <label className="file-label">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleScreenshotSelect}
                      disabled={uploadLoading}
                    />
                    <div className="file-upload-content">
                      <div className="upload-icon">📤</div>
                      <p>Drag and drop your screenshot here or click to browse</p>
                      <small>Accepted formats: JPEG, PNG (Max 5MB)</small>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploadLoading || !screenshot}
            >
              {uploadLoading ? 'Uploading...' : 'Upload Screenshot & Complete Order'}
            </button>
          </form>

          <div className="payment-info-box">
            <h4>✅ What to include in screenshot:</h4>
            <ul>
              <li>Transaction status (success/completed)</li>
              <li>Transaction reference number</li>
              <li>Amount ($${order.totalPrice.toFixed(2)})</li>
              <li>Timestamp of transaction</li>
              <li>Payment method/account used</li>
            </ul>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setStep('otp-verification')}
            disabled={uploadLoading}
          >
            Back to OTP Verification
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentFlow;
