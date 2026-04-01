import React, { useState } from 'react';
import '../styles/CheckoutAccordion.css';

const OTPModal = ({ onVerify, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    onVerify(otp);
  };

  return (
    <div className="otp-overlay">
      <div className="otp-modal">
        <h3>Verify Payment</h3>
        <p>A 6-digit OTP has been sent to your registered phone number / email.</p>
        
        <div className="otp-input-group">
          <input 
            type="text" 
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
          />
        </div>
        
        {error && <p style={{color: '#f44336', margin: '0 0 10px'}}>{error}</p>}
        
        <div className="otp-actions">
          <button className="otp-btn cancel" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="otp-btn verify" onClick={handleVerify} type="button">
            Verify & Pay
          </button>
        </div>
        <p style={{marginTop: '15px', fontSize: '13px', color: '#666'}}>
          Didn't receive the code? <button type="button" style={{background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline'}}>Resend OTP</button>
        </p>
      </div>
    </div>
  );
};

export default OTPModal;
