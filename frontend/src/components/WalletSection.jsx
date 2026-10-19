import React from 'react';
import { Wallet, PlusCircle, RefreshCw } from 'lucide-react';

export default function WalletSection({ walletBalance, onOpenQRModal, onRefresh, isRefreshing }) {
  return (
    <div className="card wallet-card-compact">
      <div className="wallet-compact-left">
        <div className="wallet-badge-circle">
          <Wallet size={24} color="#15803d" />
        </div>
        <div className="wallet-compact-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="wallet-compact-label">नागरिक वॉलेट बैलेंस (Citizen Wallet Balance)</span>
            {onRefresh && (
              <button 
                type="button" 
                onClick={onRefresh}
                title="बैलेंस रिफ्रेश करें"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#15803d',
                  padding: '2px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
              </button>
            )}
          </div>
          <div className="wallet-compact-balance">₹{Number(walletBalance || 0).toFixed(2)}</div>
          <span className="wallet-compact-sub">
            💡 आप सेवाओं के लिए सीधे फॉर्म में PhonePe QR से पेमेंट कर सकते हैं, या वॉलेट में बैलेंस जोड़कर 1-क्लिक भुगतान कर सकते हैं।
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
