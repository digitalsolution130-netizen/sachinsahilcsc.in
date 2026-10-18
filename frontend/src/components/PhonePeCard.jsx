import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import qrImage from '../assets/phonepe-qr.png';

export default function PhonePeCard({ onEnlarge }) {
  const [copied, setCopied] = useState(false);
  const upiId = "Q141422457@ybl";

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="phonepe-image-card" onClick={onEnlarge} style={{ cursor: onEnlarge ? 'pointer' : 'default' }}>
      <div className="qr-image-wrapper">
        <img 
          src={qrImage} 
          alt="PhonePe QR Code - Sahil csc" 
          className="phonepe-uploaded-img"
        />
      </div>

      <div className="upi-copy-strip">
        <span className="upi-text">UPI ID: <strong>{upiId}</strong></span>
        <button 
          type="button" 
          className="btn-copy-upi"
          onClick={handleCopy}
          title="Copy UPI ID"
        >
          {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}
