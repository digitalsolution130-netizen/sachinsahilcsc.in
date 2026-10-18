import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TopStrip from './components/TopStrip';
import MarqueeNotice from './components/MarqueeNotice';
import Navbar from './components/Navbar';
import AuthSection from './components/AuthSection';
import WalletSection from './components/WalletSection';
import TrackStatus from './components/TrackStatus';
import ServicesGrid from './components/ServicesGrid';
import ApplicationForm from './components/ApplicationForm';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import EnlargedQRModal from './components/EnlargedQRModal';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';

import { 
  initSeedData, 
  getActiveUser, 
  logoutUser, 
  getWalletBalance 
} from './services/storageService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast notifier
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize and check saved citizen session
  useEffect(() => {
    initSeedData();
    const active = getActiveUser();
    if (active && active.phone) {
      setCurrentUser(active);
      const bal = getWalletBalance(active.phone);
      setWalletBalance(bal);
    }
  }, []);

  const refreshBalance = useCallback(() => {
    if (currentUser && currentUser.phone) {
      const bal = getWalletBalance(currentUser.phone);
      setWalletBalance(bal);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const bal = getWalletBalance(user.phone);
    setWalletBalance(bal);
    setIsAdminView(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setWalletBalance(0);
    setIsAdminView(false);
    showToast('सफलतापूर्वक लॉगआउट हो गए।', 'info');
  };

  const handleGoHome = () => {
    setIsAdminView(false);
  };

  return (
    <div className="portal-app">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Strip with Gov Contacts */}
      <TopStrip />

      {/* Running Notice Marquee */}
      <MarqueeNotice />

      {/* Official Gov Header & Navigation */}
      <Navbar 
        currentUser={currentUser}
        onGoHome={handleGoHome}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
        isAdminView={isAdminView}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {isAdminView ? (
          /* 3. Admin Control Panel */
          <AdminPanel 
            onExit={() => {
              setIsAdminView(false);
              refreshBalance();
            }}
            showToast={showToast}
          />
        ) : !currentUser ? (
          /* 1. Citizen Login / Registration View */
          <AuthSection 
            onLoginSuccess={handleLoginSuccess}
            onOpenAdminLogin={() => setIsAdminModalOpen(true)}
            showToast={showToast}
          />
        ) : (
          /* 2. Citizen Dashboard View */
          <div className="dashboard-wrapper">
            <div className="gov-hero">
              <div>
                <h2>🏛️ Digital Solutions - Citizen Service Dashboard</h2>
                <p>
                  आपका स्वागत है, <strong>{currentUser.name}</strong>! नीचे दी गई सरकारी सेवाओं में से चुनें और आवेदन करें। फीस भुगतान के लिए सबमिट करते ही PhonePe QR खुलेगा।
                </p>
              </div>
              <div className="citizen-session-badge">
                Status: <strong style={{ color: '#4ade80' }}>● Active Citizen Session</strong>
              </div>
            </div>

            <div className="container">
              {/* Compact Citizen Wallet Dashboard */}
              <WalletSection 
                walletBalance={walletBalance}
                onOpenQRModal={() => setIsQRModalOpen(true)}
              />

              {/* Track Status Card */}
              <TrackStatus showToast={showToast} />

              {/* 18 E-Governance Services Grid */}
              <ServicesGrid onSelectService={setSelectedService} />

              {/* Service Application Form */}
              <ApplicationForm 
                currentUser={currentUser}
                walletBalance={walletBalance}
                selectedService={selectedService}
                onSelectService={setSelectedService}
                onOpenQRModal={() => setIsQRModalOpen(true)}
                onApplicationCreated={(newBalance) => setWalletBalance(newBalance)}
                showToast={showToast}
              />
            </div>
          </div>
        )}
      </main>

      {/* Enlarged QR Modal */}
      <EnlargedQRModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        userEmail={currentUser ? currentUser.email : ''}
        userPhone={currentUser ? currentUser.phone : ''}
        onTopupSubmitted={refreshBalance}
        showToast={showToast}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => setIsAdminView(true)}
        showToast={showToast}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
