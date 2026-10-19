import React, { useState } from 'react';
import { ShieldCheck, Mail, KeyRound, UserCheck, Send, Loader2 } from 'lucide-react';
import { apiSendEmailOtp, apiVerifyEmailOtp } from '../services/api';
import { setActiveUser } from '../services/storageService';

export default function AuthSection({ onLoginSuccess, onOpenAdminLogin, showToast }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpVisible, setOtpVisible] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 1. Send OTP for Login
  const handleSendLoginOTP = async () => {
    setLoginError('');
    setOtpSentMsg('');
    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setLoginError('❌ कृपया सही ईमेल पता दर्ज करें (उदा: example@gmail.com)');
      showToast('कृपया मान्य ईमेल पता दर्ज करें।', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiSendEmailOtp(cleanEmail);
      if (res && res.success) {
        setOtpVisible(true);
        setLoginOtp(''); // Strictly empty, user must enter from their email inbox
        setOtpSentMsg(`📩 OTP आपके ईमेल (${cleanEmail}) पर भेजा गया है। कृपया इनबॉक्स या स्पैम चेक करें।`);
        showToast('OTP आपके ईमेल पर भेज दिया गया है!', 'success');
      } else {
        setLoginError(res?.message || 'OTP भेजने में त्रुटि हुई।');
        showToast(res?.message || 'OTP भेजने में त्रुटि हुई।', 'error');
      }
    } catch (err) {
      setLoginError('ईमेल सर्वर से संपर्क नहीं हो पाया। कृपया इंटरनेट कनेक्शन या सर्वर चेक करें।');
      showToast('OTP भेजने में समस्या आई।', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP for Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setLoginError('❌ कृपया सही ईमेल पता दर्ज करें।');
      showToast('कृपया सही ईमेल दर्ज करें।', 'error');
      return;
    }

    if (!loginOtp.trim()) {
      setLoginError('❌ कृपया अपने ईमेल पर आया 6-अंकों का OTP दर्ज करें।');
      showToast('कृपया OTP दर्ज करें।', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiVerifyEmailOtp(cleanEmail, loginOtp.trim());
      if (res && res.success && res.user) {
        setActiveUser(res.user);
        showToast(`🎉 स्वागत है, ${res.user.name}!`, 'success');
        onLoginSuccess(res.user);
      } else {
        setLoginError(res?.message || '❌ अमान्य OTP! कृपया अपने ईमेल पर आया सही OTP दर्ज करें।');
        showToast('गलत OTP दर्ज किया गया है।', 'error');
      }
    } catch (err) {
      setLoginError('वेरिफिकेशन के दौरान सर्वर त्रुटि हुई। पुनः प्रयास करें।');
      showToast('OTP वेरिफिकेशन विफल।', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Send OTP for Registration
  const handleRegisterSendOTP = async () => {
    setRegError('');
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      setRegError('❌ कृपया अपना पूरा नाम दर्ज करें।');
      showToast('कृपया अपना नाम दर्ज करें।', 'error');
      return;
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setRegError('❌ कृपया सही ईमेल पता दर्ज करें।');
      showToast('कृपया मान्य ईमेल पता दर्ज करें।', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const res = await apiSendEmailOtp(cleanEmail);
      if (res && res.success) {
        setRegOtpSent(true);
        setRegOtp(''); // Strictly empty, user enters from inbox
        showToast('OTP आपके ईमेल पर भेज दिया गया है!', 'success');
      } else {
        setRegError(res?.message || 'OTP भेजने में त्रुटि हुई।');
        showToast(res?.message || 'OTP भेजने में त्रुटि हुई।', 'error');
      }
    } catch (err) {
      setRegError('सर्वर से संपर्क नहीं हो पाया।');
      showToast('OTP भेजने में समस्या आई।', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  // 4. Verify OTP for Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !isValidEmail(cleanEmail)) {
      setRegError('❌ कृपया नाम और सही ईमेल भरें।');
      return;
    }

    if (!regOtp.trim()) {
      setRegError('❌ कृपया अपने ईमेल पर आया 6-अंकों का OTP दर्ज करें।');
      showToast('कृपया OTP दर्ज करें।', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const res = await apiVerifyEmailOtp(cleanEmail, regOtp.trim(), cleanName);
      if (res && res.success && res.user) {
        setActiveUser(res.user);
        showToast(`🎉 पंजीकरण सफल! स्वागत है, ${cleanName}!`, 'success');
        onLoginSuccess(res.user);
      } else {
        setRegError(res?.message || '❌ अमान्य OTP! कृपया सही OTP दर्ज करें।');
        showToast('गलत OTP दर्ज किया गया है।', 'error');
      }
    } catch (err) {
      setRegError('पंजीकरण में त्रुटि हुई। पुनः प्रयास करें।');
      showToast('रजिस्ट्रेशन विफल।', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-hero-wrapper">
      <div className="gov-hero">
        <div>
          <h2>🏛️ DIGITAL SOLUTIONS - CITIZEN PORTAL</h2>
          <p>
            Common Service Centre (CSC) E-Governance Services. सभी सरकारी योजनाओं व डिजिटल सेवाओं के लिए ईमेल OTP द्वारा सुरक्षित लॉगिन व नागरिक पंजीकरण।
          </p>
        </div>
        <div className="official-emblem-badge">
          🇮🇳 Digital India | Atmanirbhar Bharat
        </div>
      </div>

      <div className="container">
        <div className="auth-card-modern">
          {/* Official Portal Header */}
          <div className="auth-card-header">
            <div className="auth-header-emblem">🏛️</div>
            <h3>Citizen Authentication & Services Portal</h3>
            <p>नागरिक ई-सेवा केंद्र लॉगिन एवं पंजीकरण (Email OTP Verification)</p>
          </div>

          {/* Toggle Tabs: Login vs Register */}
          <div className="auth-tab-buttons">
            <button 
              type="button" 
              className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setLoginError(''); setOtpSentMsg(''); }}
            >
              <UserCheck size={16} />
              <span>Login (लॉगिन करें)</span>
            </button>
            <button 
              type="button" 
              className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setRegError(''); }}
            >
              <Mail size={16} />
              <span>New Registration (नया पंजीकरण)</span>
            </button>
          </div>

          <div className="auth-card-body">
            {tab === 'login' ? (
              /* TAB 1: CITIZEN LOGIN VIA STRICT EMAIL OTP */
              <form onSubmit={handleLoginSubmit} className="auth-form">
                {loginError && <div className="alert-msg alert-error">{loginError}</div>}
                {otpSentMsg && <div className="alert-msg alert-info">{otpSentMsg}</div>}

                <div className="form-group text-left">
                  <label htmlFor="loginEmail">पंजीकृत ईमेल पता (Registered Email Address) *</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      id="loginEmail" 
                      placeholder="उदा: yourname@gmail.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loading || otpVisible}
                      autoFocus
                    />
                  </div>
                </div>

                {!otpVisible ? (
                  <button 
                    type="button" 
                    className="btn-submit btn-navy-submit"
                    onClick={handleSendLoginOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin-icon" />
                        <span>OTP ईमेल पर भेजा जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>ईमेल पर OTP भेजें (Send Email OTP)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <div className="form-group text-left" style={{ marginTop: '16px' }}>
                      <label htmlFor="loginOtp">ईमेल में आया 6-अंकों का OTP दर्ज करें *</label>
                      <div className="input-with-icon">
                        <KeyRound size={18} className="input-icon" />
                        <input 
                          type="text" 
                          id="loginOtp" 
                          placeholder="6-digit OTP दर्ज करें" 
                          maxLength={6}
                          value={loginOtp}
                          onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                          autoFocus
                        />
                      </div>
                      <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                        💡 अपने ईमेल का इनबॉक्स व स्पैम फोल्डर चेक करें। OTP 10 मिनट के लिए मान्य है।
                      </small>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button 
                        type="submit" 
                        className="btn-submit btn-green-submit"
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="spin-icon" />
                            <span>सत्यापित हो रहा है...</span>
                          </>
                        ) : (
                          <span>सत्यापित करें एवं लॉगिन करें</span>
                        )}
                      </button>

                      <button 
                        type="button" 
                        className="btn-submit btn-secondary-submit"
                        onClick={() => {
                          setOtpVisible(false);
                          setLoginOtp('');
                          setOtpSentMsg('');
                        }}
                        style={{ width: 'auto', padding: '10px 14px' }}
                      >
                        ईमेल बदलें
                      </button>
                    </div>
                  </>
                )}
              </form>
            ) : (
              /* TAB 2: CITIZEN REGISTRATION VIA EMAIL OTP */
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                {regError && <div className="alert-msg alert-error">{regError}</div>}

                <div className="form-group text-left">
                  <label htmlFor="regName">नागरिक का पूरा नाम (Full Name) *</label>
                  <input 
                    type="text" 
                    id="regName" 
                    placeholder="उदा: Ramesh Kumar" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={regLoading || regOtpSent}
                  />
                </div>

                <div className="form-group text-left">
                  <label htmlFor="regEmail">ईमेल पता (Email Address) *</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      id="regEmail" 
                      placeholder="उदा: ramesh@gmail.com" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      disabled={regLoading || regOtpSent}
                    />
                  </div>
                </div>

                {!regOtpSent ? (
                  <button 
                    type="button" 
                    className="btn-submit btn-navy-submit"
                    onClick={handleRegisterSendOTP}
                    disabled={regLoading}
                  >
                    {regLoading ? (
                      <>
                        <Loader2 size={16} className="spin-icon" />
                        <span>OTP ईमेल पर भेजा जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>OTP भेजें एवं रजिस्टर करें</span>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <div className="form-group text-left" style={{ marginTop: '16px' }}>
                      <label htmlFor="regOtp">ईमेल में आया 6-अंकों का OTP दर्ज करें *</label>
                      <div className="input-with-icon">
                        <KeyRound size={18} className="input-icon" />
                        <input 
                          type="text" 
                          id="regOtp" 
                          placeholder="6-digit OTP दर्ज करें" 
                          maxLength={6}
                          value={regOtp}
                          onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                          autoFocus
                        />
                      </div>
                      <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                        📩 {regEmail} पर OTP भेजा गया है। इनबॉक्स चेक करें।
                      </small>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button 
                        type="submit" 
                        className="btn-submit btn-green-submit"
                        disabled={regLoading}
                        style={{ flex: 1 }}
                      >
                        {regLoading ? (
                          <>
                            <Loader2 size={16} className="spin-icon" />
                            <span>रजिस्टर हो रहा है...</span>
                          </>
                        ) : (
                          <span>सत्यापित करें एवं खाता बनाएं</span>
                        )}
                      </button>

                      <button 
                        type="button" 
                        className="btn-submit btn-secondary-submit"
                        onClick={() => {
                          setRegOtpSent(false);
                          setRegOtp('');
                        }}
                        style={{ width: 'auto', padding: '10px 14px' }}
                      >
                        वापस जाएं
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* Quick Admin Portal Access Link */}
            <div className="auth-footer-help">
              <span className="auth-help-text">Are you a CSC Portal Operator?</span>
              <button 
                type="button" 
                className="btn-link-admin"
                onClick={onOpenAdminLogin}
              >
                <ShieldCheck size={14} />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
