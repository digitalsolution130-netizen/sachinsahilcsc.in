import React from 'react';
import { Bell } from 'lucide-react';

export default function MarqueeNotice() {
  return (
    <div className="marquee-wrapper">
      <div className="marquee-badge">
        <Bell size={15} style={{ marginRight: '6px' }} />
        <span>📢 नवीनतम सूचना</span>
      </div>
      <div className="marquee-track">
        <div className="marquee-text">
          ⚡ <strong>Digital solutions</strong> में आपका स्वागत है! | सभी सरकारी एवं गैर-सरकारी ऑनलाइन सेवाएं (Voter ID, PAN Card, Family ID, Passport, Caste/Income Certificate, Bill Payment) अब एक ही पोर्टल पर उपलब्ध हैं | <span className="highlight">Digital solutions</span> जन सेवा केंद्र - त्वरित सेवा, सुरक्षित पोर्टल | किसी भी सहायता के लिए हेल्पलाइन नंबर <strong>0130-7966590</strong> या ईमेल <strong>digitalsolution130@gmail.com</strong> पर संपर्क करें।
        </div>
      </div>
    </div>
  );
}

