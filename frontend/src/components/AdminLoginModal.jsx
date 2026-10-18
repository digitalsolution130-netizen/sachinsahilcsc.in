import React, { useState } from 'react';
import { ShieldCheck, X, KeyRound } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess, showToast }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password === 'admin123') {
      showToast('🛡️ एडमिन लॉगिन सफल!', 'success');
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setErrorMsg('❌ अमान्य पासवर्ड! सही एडमिन पासवर्ड दर्ज करें (admin123)');
      showToast('अमान्य एडमिन पासवर्ड', 'error');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content admin-login-modal">
        <div className="modal-header">
          <div className="modal-title-row">
            <ShieldCheck size={20} color="#0a2540" />
            <h3 className="modal-title">🔒 Admin Portal Login</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="admin-login-body">
          <p className="admin-login-subtitle">
            केवल अधिकृत संचालकों के लिए। वॉलेट अप्रूवल एवं सर्विस प्रोसेसिंग।
          </p>

          {errorMsg && <div className="alert-msg alert-error">{errorMsg}</div>}

          <div className="form-group text-left">
            <label htmlFor="adminPass">Admin Security Password *</label>
            <div className="input-with-icon">
              <KeyRound size={16} className="input-icon" />
              <input 
                type="password" 
                id="adminPass" 
                placeholder="Enter password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
              Default Master Password: <strong>admin123</strong>
            </small>
          </div>

          <button type="submit" className="btn-submit btn-navy-submit">
            Login as Admin
          </button>
          <button type="button" className="btn-submit btn-secondary-submit" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

