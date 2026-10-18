import React from 'react';
import { Home, ShieldCheck, LogOut, Phone, Mail, User } from 'lucide-react';

export default function Navbar({ currentUser, onGoHome, onOpenAdminLogin, onLogout, isAdminView }) {
  return (
    <>
      <header className="gov-header">
        <div className="gov-brand" onClick={onGoHome} role="button" tabIndex={0}>
          <div className="emblem-circle">🏛️</div>
          <div className="gov-title">
            <h1>DIGITAL <span>SOLUTIONS</span> PORTAL</h1>
            <p>Common Service Centre (CSC) & E-District Citizen Services</p>
          </div>
        </div>

        <div className="header-right">
          <div className="helpline-pill">
            <div className="pill-line">
              <Phone size={13} className="pill-icon" />
              <span>हेल्पलाइन: </span>
              <a href="tel:01307966590">0130-7966590</a>
            </div>
            <div className="pill-line">
              <Mail size={13} className="pill-icon" />
              <span>ईमेल: </span>
              <a href="mailto:digitalsolution130@gmail.com">digitalsolution130@gmail.com</a>
            </div>
          </div>
          <div className="csc-badge">
            <span className="dot-live">●</span> डिजिटल सेवा केंद्र (Authorized)
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-links">
          <button type="button" className={`nav-link-item ${!isAdminView ? 'active' : ''}`} onClick={onGoHome}>
            <Home size={15} />
            <span>मुख्य पृष्ठ (Home)</span>
          </button>
          {!isAdminView && (
            <button type="button" className="nav-link-item" onClick={onOpenAdminLogin}>
              <ShieldCheck size={15} />
              <span>एडमिन पैनल लॉगिन (Admin Login)</span>
            </button>
          )}
        </div>

        <div className="nav-right-group">
          {currentUser && (
            <div className="user-pill">
              <User size={15} />
              <span>{currentUser.name} ({currentUser.email || currentUser.phone})</span>
            </div>
          )}
          {currentUser && (
            <button type="button" className="logout-btn" onClick={onLogout} title="Logout">
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

