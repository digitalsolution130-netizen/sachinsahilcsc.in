import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function TopStrip() {
  return (
    <div className="gov-top-strip">
      <div className="strip-left">
        <span>🇮🇳 भारत सरकार | डिजिटल जन सेवा पोर्टल (CSC E-Governance Services)</span>
      </div>
      <div className="strip-right">
        <a href="mailto:digitalsolution130@gmail.com" className="strip-item">
          <Mail size={13} />
          <span>digitalsolution130@gmail.com</span>
        </a>
        <span className="strip-divider">|</span>
        <a href="tel:01307966590" className="strip-item">
          <Phone size={13} />
          <span>0130-7966590</span>
        </a>
      </div>
    </div>
  );
}

