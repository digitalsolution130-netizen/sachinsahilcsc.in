import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function TopStrip() {
  return (
    <div className="gov-top-strip">
      <div className="strip-left">
        <span>🇮🇳 डिजिटल जन सेवा पोर्टल (CSC E-Governance Services)</span>
      </div>
      <div className="strip-right">
        <a href="mailto:digitalsolution130@gmail.com" className="strip-item">
          <Mail size={13} />
          <span>digitalsolution130@gmail.com</span>
        </a>
        <span className="strip-divider">|</span>
        <a href="tel:7419353376" className="strip-item">
          <Phone size={13} />
          <span>7419353376</span>
        </a>
      </div>
    </div>
  );
}

