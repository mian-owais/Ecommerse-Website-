import React from 'react';
import '../styles/CheckoutAccordion.css';
import { FaCreditCard, FaUniversity, FaMobileAlt } from 'react-icons/fa';

const PaymentMethodAccordion = ({ method, selectedMethod, onChange, formData, setFormData, handleFileChange }) => {
  const isSelected = selectedMethod === method.id;

  const renderPaymentDetails = () => {
    if (!isSelected) return null;

    switch (method.type) {
      case 'card':
        return (
          <div className="payment-accordion">
            <h4><FaCreditCard /> Enter Card Details</h4>
            <div className="card-form-grid">
              <div className="form-group">
                <label>Card Number</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                  maxLength={19}
                  value={formData.cardNumber || ''}
                  onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    maxLength={5}
                    value={formData.cardExpiry || ''}
                    onChange={(e) => setFormData({...formData, cardExpiry: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input 
                    type="text" 
                    placeholder="123" 
                    maxLength={4}
                    value={formData.cardCvc || ''}
                    onChange={(e) => setFormData({...formData, cardCvc: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Name on Card</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={formData.cardName || ''}
                  onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
        );
      case 'mobile-wallet':
        return (
          <div className="payment-accordion">
            <div className="payment-details-box">
              <h4><FaMobileAlt /> {method.name} Instructions</h4>
              <p>1. Open your {method.name} App</p>
              <p>2. Send amount to: <strong>{method.accountNumber}</strong></p>
              <p>3. Account Title: <strong>Store Official</strong></p>
              <p>4. Take a screenshot of the successful transaction.</p>
            </div>
            
            <div className="file-upload-container">
              <label>Upload Payment Screenshot</label>
              <input 
                type="file" 
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                required
              />
              <small style={{display: 'block', color: '#666', marginTop: '4px'}}>Max 5MB (JPG, PNG)</small>
            </div>
            
            <div className="form-group" style={{marginTop: '15px'}}>
              <label>Transaction ID / Reference Number</label>
              <input 
                type="text" 
                placeholder="Enter Transaction ID"
                value={formData.paymentReference || ''}
                onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                required
              />
            </div>
          </div>
        );
      case 'bank':
        return (
          <div className="payment-accordion">
            <div className="payment-details-box">
              <h4><FaUniversity /> Bank Transfer Details</h4>
              <p>Bank: <strong>{method.bankName}</strong></p>
              <p>Account Title: <strong>{method.accountTitle}</strong></p>
              <p>Account Number: <strong>{method.accountNumber}</strong></p>
              <p>IBAN: <strong>{method.iban}</strong></p>
              <p>Branch Code: <strong>{method.branchCode}</strong></p>
            </div>
            
            <div className="file-upload-container">
              <label>Upload Transfer Receipt</label>
              <input 
                type="file" 
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                required
              />
            </div>
            
            <div className="form-group" style={{marginTop: '15px'}}>
              <label>Transaction Reference</label>
              <input 
                type="text" 
                placeholder="Enter Reference"
                value={formData.paymentReference || ''}
                onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                required
              />
            </div>
          </div>
        );
      case 'cod':
        return (
          <div className="payment-accordion">
            <p style={{margin: 0, color: '#555', fontSize: '14px'}}>
              Pay with cash upon delivery of your order.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`payment-method-wrapper ${isSelected ? 'is-selected' : ''}`} style={{marginBottom: '10px'}}>
      <label className="payment-option" style={{marginBottom: isSelected ? '0' : '10px', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', background: isSelected ? '#f5f9ff' : '#fff'}}>
        <input
          type="radio"
          name="paymentMethod"
          value={method.id}
          checked={isSelected}
          onChange={() => onChange(method.id)}
          style={{marginRight: '12px'}}
        />
        <span style={{fontWeight: isSelected ? '600' : 'normal', display: 'flex', alignItems: 'center', gap: '8px'}}>
          {method.icon} {method.name}
        </span>
      </label>
      {renderPaymentDetails()}
    </div>
  );
};

export default PaymentMethodAccordion;
