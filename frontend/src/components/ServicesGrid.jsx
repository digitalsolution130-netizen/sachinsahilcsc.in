import React from 'react';
import { Layers } from 'lucide-react';
import { SERVICES_LIST } from '../data/servicesData';

export default function ServicesGrid({ onSelectService }) {
  const handleClick = (service) => {
    onSelectService(service);
    // Smooth scroll to application form
    const formElement = document.getElementById('applyFormSection');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="card services-card">
      <h2>
        <div className="card-title-left">
          <Layers className="icon-title" size={20} />
          <span>📌 ऑनलाइन नागरिक सेवाएं (Available E-Governance Services)</span>
        </div>
        <span className="services-count-badge">{SERVICES_LIST.length} Services Active</span>
      </h2>

      <div className="grid services-grid">
        {SERVICES_LIST.map((service) => (
          <div 
            key={service.id} 
            className="item-card"
            onClick={() => handleClick(service)}
            role="button"
            tabIndex={0}
            title={`Apply for ${service.name} (₹${service.fee})`}
          >
            <div className="item-card-top">
              <span className="item-icon">{service.icon}</span>
              <span className="item-price">₹{service.fee}</span>
            </div>
            <h4>{service.name}</h4>
            <span className="item-hindi-title">{service.nameHi}</span>
            <span className="item-desc">{service.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

