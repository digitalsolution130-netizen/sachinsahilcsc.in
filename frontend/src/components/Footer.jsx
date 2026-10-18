import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="gov-footer">
      <div className="footer-content">
        <p className="footer-title">
          © 2026 <strong>Digital Solutions Portal</strong> | Common Service Centre (CSC) & Citizen E-Governance Services
        </p>
        <p className="footer-contacts">
          <span>📞 Helpline: <a href="tel:01307966590">0130-7966590</a></span>
          <span className="footer-sep">•</span>
          <span>✉️ Email: <a href="mailto:digitalsolution130@gmail.com">digitalsolution130@gmail.com</a></span>
          <span className="footer-sep">•</span>
          <span>🏛️ Authorized Jan Seva Kendra Network</span>
        </p>
        <p className="footer-subtext">
          Digital India Initiative • Secure Portal • 24x7 Citizen Services
        </p>
      </div>
    </footer>
  );
}

