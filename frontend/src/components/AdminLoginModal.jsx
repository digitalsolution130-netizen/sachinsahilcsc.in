import React, { useState } from 'react';
import { ShieldCheck, X, KeyRound, Loader2 } from 'lucide-react';
import { apiAdminLogin } from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess, showToast }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('कृपया एडमिन सुरक्षा पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await apiAdminLogin(password.trim());
      if (res.success) {
        showToast('🛡️ एडमिन लॉगिन सफल! पूर्ण नियंत्रण सक्रिय।', 'success');
        setPassword('');
        onLoginSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'गलत एडमिन पासवर्ड!');
        showToast('गलत एडमिन पासवर्ड', 'error');
      }
    } catch (err) {
      // Direct emergency match if offline/server disconnected
      if (password.trim() === 'Sachin@9034') {
        showToast('🛡️ एडमिन लॉगिन सफल (Offline Mode)', 'success');
        setPassword('');
        onLoginSuccess();
        onClose();
      } else {
        setErrorMsg('गलत एडमिन पासवर्ड अथवा सर्वर से संपर्क नहीं हो पाया।');
        showToast('अमान्य एडमिन पासवर्ड', 'error');
      }
    } finally {
      setLoading(false);
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
          <button type="button" className="btn-close-modal" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleVerify} className="admin-login-body">
          <p className="admin-login-subtitle">
            केवल अधिकृत संचालकों के लिए। वॉलेट अप्रूवल, सर्विस मैनेजमेंट एवं नागरिक नियंत्रण।
          </p>

          {errorMsg && <div className="alert-msg alert-error">{errorMsg}</div>}

          <div className="form-group text-left">
            <label htmlFor="adminPass">Admin Master Password *</label>
            <div className="input-with-icon">
              <KeyRound size={16} className="input-icon" />
              <input 
                type="password" 
                id="adminPass" 
                placeholder="Enter private admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-submit btn-navy-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>सत्यापित किया जा रहा है...</span>
              </>
            ) : (
              <span>Login as Admin (पूर्ण नियंत्रण)</span>
            )}
          </button>

          <button 
            type="button" 
            className="btn-submit btn-secondary-submit" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
