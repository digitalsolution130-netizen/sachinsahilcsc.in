import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  KeyRound, 
  UserCheck, 
  UserPlus, 
  Send, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  apiCitizenLogin, 
  apiRegisterSendOtp, 
  apiRegisterComplete, 
  apiForgotPasswordOtp, 
  apiResetPassword 
} from '../services/api';
import { setActiveUser } from '../services/storageService';

export default function AuthSection({ onLoginSuccess, onOpenAdminLogin, showToast }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 1. CITIZEN LOGIN (Email + Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setLoginError('कृपया सही ईमेल पता दर्ज करें।');
      showToast('कृपया मान्य ईमेल पता दर्ज करें।', 'error');
      return;
    }

    if (!cleanPassword) {
      setLoginError('कृपया अपना पासवर्ड दर्ज करें।');
      showToast('कृपया पासवर्ड दर्ज करें।', 'error');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await apiCitizenLogin(cleanEmail, cleanPassword);
      if (res && res.success && res.user) {
        setActiveUser(res.user);
        showToast(`🎉 स्वागत है, ${res.user.name}!`, 'success');
        onLoginSuccess(res.user);
      } else {
        setLoginError(res?.message || 'गलत ईमेल या पासवर्ड!');
        showToast(res?.message || 'लॉगिन विफल', 'error');
      }
    } catch (err) {
      setLoginError('सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।');
      showToast('लॉगिन विफल।', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. REGISTRATION: Send OTP to Email
  const handleRegisterSendOtp = async (e) => {
    if (e) e.preventDefault();
    setRegError('');
    setRegSuccessMsg('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();

    if (!cleanName) {
      setRegError('कृपया अपना पूरा नाम दर्ज करें।');
      showToast('कृपया अपना नाम दर्ज करें।', 'error');
      return;
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setRegError('कृपया सही ईमेल पता दर्ज करें।');
      showToast('कृपया मान्य ईमेल पता दर्ज करें।', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const res = await apiRegisterSendOtp(cleanName, cleanEmail, cleanPhone);
      if (res && res.success) {
        setRegOtpSent(true);
        setRegOtp('');
        setRegSuccessMsg(`📩 OTP आपके ईमेल (${cleanEmail}) पर भेज दिया गया है। इनबॉक्स व स्पैम फोल्डर देखें।`);
        showToast('OTP आपके ईमेल पर भेजा गया!', 'success');
      } else {
        setRegError(res?.message || 'OTP भेजने में त्रुटि हुई।');
        showToast(res?.message || 'OTP भेजने में समस्या आई।', 'error');
      }
    } catch (err) {
      setRegError('सर्वर से संपर्क नहीं हो पाया।');
      showToast('OTP भेजने में समस्या आई।', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  // 3. REGISTRATION: Complete with OTP + Password
  const handleRegisterComplete = async (e) => {
    e.preventDefault();
    setRegError('');

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();
    const cleanOtp = regOtp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setRegError('कृपया ईमेल पर आया 6-अंकों का OTP दर्ज करें।');
      showToast('कृपया सही OTP दर्ज करें।', 'error');
      return;
    }

    if (!regPassword || regPassword.trim().length < 6) {
      setRegError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      showToast('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।', 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('दोनों पासवर्ड एक जैसे होने चाहिए।');
      showToast('पासवर्ड मेल नहीं खा रहे हैं।', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const res = await apiRegisterComplete(cleanName, cleanEmail, cleanPhone, cleanOtp, regPassword.trim());
      if (res && res.success && res.user) {
        setActiveUser(res.user);
        showToast(`🎉 पंजीकरण सफल! स्वागत है, ${res.user.name}!`, 'success');
        onLoginSuccess(res.user);
      } else {
        setRegError(res?.message || 'पंजीकरण विफल! सही OTP दर्ज करें।');
        showToast(res?.message || 'रजिस्ट्रेशन विफल', 'error');
      }
    } catch (err) {
      setRegError('पंजीकरण में त्रुटि हुई। पुनः प्रयास करें।');
      showToast('रजिस्ट्रेशन विफल।', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  // 4. FORGOT PASSWORD: Send Reset OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessMsg('');

    const cleanEmail = forgotEmail.trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setForgotError('कृपया मान्य ईमेल पता दर्ज करें।');
      showToast('कृपया मान्य ईमेल पता दर्ज करें।', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiForgotPasswordOtp(cleanEmail);
      if (res && res.success) {
        setForgotOtpSent(true);
        setForgotOtp('');
        setForgotSuccessMsg(`📩 पासवर्ड रीसेट OTP आपके ईमेल (${cleanEmail}) पर भेजा गया है।`);
        showToast('रीसेट OTP भेजा गया!', 'success');
      } else {
        setForgotError(res?.message || 'OTP भेजने में त्रुटि हुई।');
        showToast(res?.message || 'ईमेल नहीं मिला', 'error');
      }
    } catch (err) {
      setForgotError('सर्वर से संपर्क नहीं हो पाया।');
      showToast('OTP भेजने में समस्या आई।', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  // 5. RESET PASSWORD: Save New Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    const cleanOtp = forgotOtp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setForgotError('कृपया 6-अंकों का OTP दर्ज करें।');
      showToast('कृपया सही OTP दर्ज करें।', 'error');
      return;
    }

    if (!newPassword || newPassword.trim().length < 6) {
      setForgotError('नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      showToast('नया पासवर्ड कम से कम 6 अक्षरों का रखें।', 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('दोनों नए पासवर्ड एक जैसे होने चाहिए।');
      showToast('पासवर्ड मेल नहीं खा रहे हैं।', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiResetPassword(cleanEmail, cleanOtp, newPassword.trim());
      if (res && res.success) {
        showToast('✅ पासवर्ड अपडेट हो गया! अब लॉगिन करें।', 'success');
        setLoginEmail(cleanEmail);
        setLoginPassword('');
        setMode('login');
        setForgotOtpSent(false);
      } else {
        setForgotError(res?.message || 'पासवर्ड रीसेट विफल।');
        showToast(res?.message || 'रीसेट विफल', 'error');
      }
    } catch (err) {
      setForgotError('पासवर्ड बदलने में त्रुटि हुई।');
      showToast('रीसेट विफल।', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-hero-wrapper">
      <div className="gov-hero">
        <div>
          <h2>🏛️ DIGITAL SOLUTIONS - CITIZEN PORTAL</h2>
          <p>
            Common Service Centre (CSC) E-Governance Services. सभी 18+ सरकारी सेवाओं के लिए सुरक्षित ईमेल व पासवर्ड आधारित नागरिक पोर्टल।
          </p>
        </div>
        <div className="official-emblem-badge">
          🇮🇳 Digital India | Atmanirbhar Bharat
        </div>
      </div>

      <div className="container" style={{ maxWidth: '480px', margin: '0 auto 40px auto' }}>
        <div className="auth-card-modern" style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(10, 37, 64, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          borderTop: '5px solid #ff6b00',
          overflow: 'hidden'
        }}>
          {/* Official Portal Header */}
          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
            padding: '20px 22px 16px 22px',
            textAlign: 'center',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>🏛️</div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0a2540', fontWeight: '800', letterSpacing: '-0.3px' }}>
              Citizen Services Portal
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              ई-सेवा केंद्र डिजिटल लॉगिन एवं नागरिक पंजीकरण
            </p>
          </div>

          {/* Navigation Tabs (Only when not in Forgot Password) */}
          {mode !== 'forgot' && (
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              margin: '16px 20px 0 20px',
              borderRadius: '8px'
            }}>
              <button 
                type="button"
                onClick={() => { setMode('login'); setLoginError(''); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  background: mode === 'login' ? '#0a2540' : 'transparent',
                  color: mode === 'login' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserCheck size={16} />
                <span>Login (लॉगिन)</span>
              </button>

              <button 
                type="button"
                onClick={() => { setMode('register'); setRegError(''); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  background: mode === 'register' ? '#0a2540' : 'transparent',
                  color: mode === 'register' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserPlus size={16} />
                <span>New Registration</span>
              </button>
            </div>
          )}

          <div style={{ padding: '22px 24px' }}>
            {/* VIEW 1: CITIZEN LOGIN (Strict: Email + Password) */}
            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                {loginError && (
                  <div className="alert-msg alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="form-group text-left">
                  <label htmlFor="loginEmail">पंजीकृत ईमेल पता (Registered Email) *</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      id="loginEmail" 
                      placeholder="उदा: yourname@gmail.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loginLoading}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="form-group text-left">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="loginPass" style={{ margin: 0 }}>पासवर्ड (Password) *</label>
                    <button 
                      type="button" 
                      onClick={() => { setMode('forgot'); setForgotEmail(loginEmail); setForgotError(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      पासवर्ड भूल गए?
                    </button>
                  </div>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <Lock size={18} className="input-icon" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      id="loginPass" 
                      placeholder="अपना पासवर्ड दर्ज करें" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginLoading}
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-submit btn-navy-submit"
                  disabled={loginLoading}
                  style={{ marginTop: '16px', height: '46px', fontSize: '0.96rem' }}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 size={18} className="spin-icon" />
                      <span>लॉगिन किया जा रहा है...</span>
                    </>
                  ) : (
                    <span>लॉगिन करें (Citizen Login)</span>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem', color: '#64748b' }}>
                  नया खाता बनाना चाहते हैं?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setMode('register'); setRegError(''); }}
                    style={{ background: 'none', border: 'none', color: '#ff6b00', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    नया पंजीकरण करें
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 2: NEW REGISTRATION (Step 1: Enter Info -> Send Email OTP -> Step 2: Set Password) */}
            {mode === 'register' && (
              <div>
                {regError && (
                  <div className="alert-msg alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccessMsg && (
                  <div className="alert-msg alert-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#0284c7' }} />
                    <span>{regSuccessMsg}</span>
                  </div>
                )}

                {!regOtpSent ? (
                  /* STEP 1: Enter Name, Email, Phone */
                  <form onSubmit={handleRegisterSendOtp}>
                    <div className="form-group text-left">
                      <label htmlFor="regName">नागरिक का पूरा नाम (Full Name) *</label>
                      <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input 
                          type="text" 
                          id="regName" 
                          placeholder="उदा: Ramesh Kumar" 
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          disabled={regLoading}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group text-left">
                      <label htmlFor="regEmail">ईमेल पता (Email Address for OTP) *</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input 
                          type="email" 
                          id="regEmail" 
                          placeholder="उदा: ramesh@gmail.com" 
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          disabled={regLoading}
                          required
                        />
                      </div>
                      <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                        💡 इसी ईमेल पर 6-अंकों का वेरिफिकेशन OTP भेजा जाएगा।
                      </small>
                    </div>

                    <div className="form-group text-left">
                      <label htmlFor="regPhone">मोबाइल नंबर (Mobile No) - Optional</label>
                      <div className="input-with-icon">
                        <Phone size={18} className="input-icon" />
                        <input 
                          type="tel" 
                          id="regPhone" 
                          placeholder="उदा: 9876543210" 
                          maxLength={10}
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                          disabled={regLoading}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-submit btn-navy-submit"
                      disabled={regLoading}
                      style={{ marginTop: '16px', height: '46px', fontSize: '0.96rem' }}
                    >
                      {regLoading ? (
                        <>
                          <Loader2 size={18} className="spin-icon" />
                          <span>OTP ईमेल पर भेजा जा रहा है...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>ईमेल पर OTP भेजें (Send OTP)</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: Enter Email OTP & Create Password */
                  <form onSubmit={handleRegisterComplete}>
                    <div style={{
                      background: '#fff8eb',
                      border: '1px solid #fed7aa',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      marginBottom: '16px',
                      fontSize: '0.84rem',
                      color: '#9a3412',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>ईमेल: <strong>{regEmail}</strong></span>
                      <button 
                        type="button" 
                        onClick={() => { setRegOtpSent(false); setRegOtp(''); }}
                        style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', padding: 0 }}
                      >
                        बदलें
                      </button>
                    </div>

                    <div className="form-group text-left">
                      <label htmlFor="regOtp">ईमेल में आया 6-अंकों का OTP दर्ज करें *</label>
                      <div className="input-with-icon">
                        <KeyRound size={18} className="input-icon" />
                        <input 
                          type="text" 
                          id="regOtp" 
                          placeholder="6-अंकों का OTP" 
                          maxLength={6}
                          value={regOtp}
                          onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                          disabled={regLoading}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group text-left">
                      <label htmlFor="regPassword">नया पासवर्ड बनाएं (Create Password) *</label>
                      <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          id="regPassword" 
                          placeholder="कम से कम 6 अक्षर का पासवर्ड" 
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          disabled={regLoading}
                          required
                          minLength={6}
                          style={{ paddingRight: '40px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: 0
                          }}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group text-left">
                      <label htmlFor="regConfirmPassword">पासवर्ड दोबारा दर्ज करें (Confirm Password) *</label>
                      <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          id="regConfirmPassword" 
                          placeholder="पासवर्ड दोबारा लिखें" 
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          disabled={regLoading}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: 0
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-submit btn-green-submit"
                      disabled={regLoading}
                      style={{ marginTop: '16px', height: '46px', fontSize: '0.96rem' }}
                    >
                      {regLoading ? (
                        <>
                          <Loader2 size={18} className="spin-icon" />
                          <span>खाता बनाया जा रहा है...</span>
                        </>
                      ) : (
                        <span>पंजीकरण पूरा करें एवं लॉगिन करें</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* VIEW 3: FORGOT PASSWORD (Step 1: Enter Email -> Send Reset OTP -> Step 2: Set New Password) */}
            {mode === 'forgot' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setMode('login'); setForgotError(''); setForgotOtpSent(false); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0a2540', padding: 0 }}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0a2540' }}>
                    🔐 पासवर्ड रीसेट (Forgot Password)
                  </h4>
                </div>

                {forgotError && (
                  <div className="alert-msg alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{forgotError}</span>
                  </div>
                )}
                {forgotSuccessMsg && (
                  <div className="alert-msg alert-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#0284c7' }} />
                    <span>{forgotSuccessMsg}</span>
                  </div>
                )}

                {!forgotOtpSent ? (
                  <form onSubmit={handleForgotSendOtp}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>
                      अपना पंजीकृत ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट करने के लिए 6-अंकों का OTP भेजेंगे।
                    </p>

                    <div className="form-group text-left">
                      <label htmlFor="forgotEmail">पंजीकृत ईमेल (Registered Email) *</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input 
                          type="email" 
                          id="forgotEmail" 
                          placeholder="उदा: yourname@gmail.com" 
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          disabled={forgotLoading}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-submit btn-navy-submit"
                      disabled={forgotLoading}
                      style={{ marginTop: '16px', height: '46px', fontSize: '0.96rem' }}
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 size={18} className="spin-icon" />
                          <span>OTP भेजा जा रहा है...</span>
                        </>
                      ) : (
                        <span>रीसेट OTP भेजें (Send Reset OTP)</span>
                      )}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setMode('login')}
                      className="btn-submit btn-secondary-submit"
                      style={{ marginTop: '8px' }}
                    >
                      वापस लॉगिन पर जाएं
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit}>
                    <div className="form-group text-left">
                      <label htmlFor="forgotOtp">ईमेल में आया 6-अंकों का OTP दर्ज करें *</label>
                      <div className="input-with-icon">
                        <KeyRound size={18} className="input-icon" />
                        <input 
                          type="text" 
                          id="forgotOtp" 
                          placeholder="6-अंकों का OTP" 
                          maxLength={6}
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          disabled={forgotLoading}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group text-left">
                      <label htmlFor="newPassword">नया पासवर्ड बनाएं (New Password) *</label>
                      <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          id="newPassword" 
                          placeholder="कम से कम 6 अक्षर का पासवर्ड" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={forgotLoading}
                          required
                          minLength={6}
                          style={{ paddingRight: '40px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: 0
                          }}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group text-left">
                      <label htmlFor="confirmNewPassword">नया पासवर्ड दोबारा लिखें (Confirm Password) *</label>
                      <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Lock size={18} className="input-icon" />
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          id="confirmNewPassword" 
                          placeholder="नया पासवर्ड दोबारा दर्ज करें" 
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          disabled={forgotLoading}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: 0
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-submit btn-green-submit"
                      disabled={forgotLoading}
                      style={{ marginTop: '16px', height: '46px', fontSize: '0.96rem' }}
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 size={18} className="spin-icon" />
                          <span>पासवर्ड अपडेट हो रहा है...</span>
                        </>
                      ) : (
                        <span>नया पासवर्ड सेव करें एवं लॉगिन करें</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Admin Portal Access Link (Footer of Auth Card) */}
            <div style={{
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.82rem'
            }}>
              <span style={{ color: '#64748b' }}>CSC Operator Portal:</span>
              <button 
                type="button" 
                onClick={onOpenAdminLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0a2540',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <ShieldCheck size={14} color="#0a2540" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
