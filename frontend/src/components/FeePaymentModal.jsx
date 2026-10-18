import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Wallet, QrCode } from 'lucide-react';
import PhonePeCard from './PhonePeCard';

export default function FeePaymentModal({ 
  isOpen, 
  onClose, 
  service, 
  applicantName, 
  walletBalance, 
  onConfirmQR, 
  onConfirmWallet, 
  showToast 
}) {
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !service) return null;

  const fee = Number(service.fee) || 0;
  const hasWalletBalance = walletBalance >= fee;

  const handleQRSubmit = (e) => {
    e.preventDefault();
    const cleanUtr = utr.trim();

    if (!cleanUtr || cleanUtr.length < 8) {
      showToast('कृपया मान्य 12-अंकों का UTR / Transaction ID दर्ज करें।', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      onConfirmQR(cleanUtr);
      setUtr('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletSubmit = () => {
    if (!hasWalletBalance) {
      showToast('वॉलेट में पर्याप्त बैलेंस नहीं है। कृपया QR से भुगतान करें।', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      onConfirmWallet();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fee-payment-modal">
        <div className="modal-header">
          <div className="modal-title-row">
            <QrCode size={20} color="#ff6b00" />
            <h3 className="modal-title">💳 फीस भुगतान (Pay Service Fees)</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="fee-payment-body">
          {/* Service & Fee Highlight Strip */}
          <div className="fee-summary-strip">
            <div className="fee-summary-left">
              <span className="fee-applicant-label">आवेदक: <strong>{applicantName}</strong></span>
              <h4 className="fee-service-name">{service.icon} {service.name}</h4>
            </div>
            <div className="fee-summary-right">
              <span className="fee-due-label">कुल देय शुल्क (Total Fee):</span>
              <div className="fee-amount-badge">₹{fee}.00</div>
            </div>
          </div>

          {/* Wallet Quick Option (If citizen has enough balance) */}
          {hasWalletBalance && (
            <div className="wallet-quick-pay-card">
              <div className="wallet-quick-info">
                <Wallet size={18} color="#15803d" />
                <div>
                  <span className="wallet-avail-text">वॉलेट में बैलेंस उपलब्ध है:</span>
                  <strong>₹{Number(walletBalance).toFixed(2)}</strong>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-pay-wallet"
                onClick={handleWalletSubmit}
                disabled={isSubmitting}
              >
                <span>वॉलेट से तुरंत भुगतान करें (₹{fee})</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Direct PhonePe QR Section */}
          <div className="qr-payment-section">
            <div className="qr-step-banner">
              <span>👇 नीचे दिए गए PhonePe QR को स्कैन करके <strong>₹{fee}</strong> का भुगतान करें:</span>
            </div>

            {/* Exact Uploaded PhonePe QR Code */}
            <div className="qr-modal-preview">
              <PhonePeCard />
            </div>

            <form onSubmit={handleQRSubmit} className="utr-submit-form">
              <div className="form-group text-left">
                <label htmlFor="modalUtrInput">
                  पेमेंट के बाद प्राप्त 12-अंकों का UTR / UPI Transaction ID दर्ज करें: *
                </label>
                <input 
                  type="text" 
                  id="modalUtrInput" 
                  placeholder="उदा: 428791054321 (12 digits)" 
                  maxLength={24}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  autoFocus
                />
                <small className="utr-help-hint">
                  PhonePe / GPay / Paytm हिस्ट्री में पेमेंट डिटेल पर UTR नंबर दिया होता है।
                </small>
              </div>

              <button 
                type="submit" 
                className="btn-submit btn-saffron-submit"
                disabled={isSubmitting}
              >
                <CheckCircle2 size={16} />
                <span>
                  {isSubmitting ? 'Verifying & Submitting...' : `✅ Submit Payment & Generate Slip (₹${fee})`}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

