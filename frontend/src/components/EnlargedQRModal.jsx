import React, { useState } from 'react';
import { X, CheckCircle2, Wallet, QrCode } from 'lucide-react';
import PhonePeCard from './PhonePeCard';
import { submitTopupRequest } from '../services/storageService';
import { apiSubmitTopup } from '../services/api';

export default function EnlargedQRModal({ isOpen, onClose, userEmail, userPhone, onTopupSubmitted, showToast }) {
  const [amount, setAmount] = useState('100');
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmt = Number(amount);
    const cleanUtr = utr.trim();

    if (!payAmt || payAmt < 10) {
      showToast('कृपया कम से कम ₹10 की राशि दर्ज करें।', 'error');
      return;
    }
    if (!cleanUtr || cleanUtr.length < 6) {
      showToast('कृपया 12-अंकों का मान्य UTR / UPI Transaction ID दर्ज करें।', 'error');
      return;
    }

    setSubmitting(true);
    const identifier = userEmail || userPhone || 'citizen@portal.gov.in';

    try {
      try {
        await apiSubmitTopup(identifier, payAmt, cleanUtr);
      } catch (e) {
        console.warn('Backend topup call failed, saving to local');
      }
      submitTopupRequest(identifier, payAmt, cleanUtr);
      showToast(`✅ ₹${payAmt} रीचार्ज रिक्वेस्ट सबमिट हुई! UTR: ${cleanUtr}`, 'success');
      setAmount('100');
      setUtr('');
      if (onTopupSubmitted) onTopupSubmitted();
      onClose();
    } catch (err) {
      showToast('अनपेक्षित त्रुटि, पुनः प्रयास करें।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fee-payment-modal">
        <div className="modal-header">
          <div className="modal-title-row">
            <Wallet size={20} color="#15803d" />
            <h3 className="modal-title">💰 वॉलेट रीचार्ज (Scan & Add Balance)</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="fee-payment-body">
          <div className="qr-step-banner">
            <span>नीचे दिए गए PhonePe QR को स्कैन करके पैसे भेजें और UTR नंबर दर्ज करें:</span>
          </div>

          <div className="qr-modal-preview">
            <PhonePeCard />
          </div>

          <form onSubmit={handleSubmit} className="utr-submit-form">
            <div className="form-group text-left">
              <label htmlFor="popupPayAmount">पेमेंट की गई राशि (Amount in ₹) *</label>
              <input 
                type="number" 
                id="popupPayAmount" 
                placeholder="उदा: 100, 200, 500" 
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group text-left">
              <label htmlFor="popupUtr">12-Digit UPI Transaction ID / UTR No *</label>
              <input 
                type="text" 
                id="popupUtr" 
                placeholder="PhonePe / UPI का 12-अंकों का UTR नंबर" 
                maxLength={24}
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit btn-green-submit"
              disabled={submitting}
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Submitting...' : '✅ सबमिट करें (Add Balance to Wallet)'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
