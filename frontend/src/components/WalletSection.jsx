import React from 'react';
import { Wallet, PlusCircle, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function WalletSection({ walletBalance, onOpenQRModal }) {
  return (
    <div className="card wallet-card-compact">
      <div className="wallet-compact-left">
        <div className="wallet-badge-circle">
          <Wallet size={24} color="#15803d" />
        </div>
        <div className="wallet-compact-info">
          <span className="wallet-compact-label">नागरिक वॉलेट बैलेंस (Citizen Wallet Balance)</span>
          <div className="wallet-compact-balance">₹{Number(walletBalance).toFixed(2)}</div>
          <span className="wallet-compact-sub">
            💡 आप सेवाओं के लिए सीधे फॉर्म में भी PhonePe QR से पेमेंट कर सकते हैं, या वॉलेट में बैलेंस जोड़ सकते हैं।
          </span>
        </div>
      </div>

      <div className="wallet-compact-right">
        <button 
          type="button" 
          className="btn-add-money"
          onClick={onOpenQRModal}
        >
          <PlusCircle size={17} />
          <span>+ Add Money to Wallet (QR Top-Up)</span>
        </button>
      </div>
    </div>
  );
}
