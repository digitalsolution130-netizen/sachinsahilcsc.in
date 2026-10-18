import React, { useState, useEffect } from 'react';
import { FileEdit, Camera, FolderOpen, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SERVICES_LIST } from '../data/servicesData';
import { submitApplication } from '../services/storageService';
import { apiSubmitApplication } from '../services/api';
import CameraModal from './CameraModal';
import FeePaymentModal from './FeePaymentModal';
import AcknowledgmentSlip from './AcknowledgmentSlip';

export default function ApplicationForm({ 
  currentUser, 
  walletBalance, 
  selectedService, 
  onSelectService, 
  onApplicationCreated, 
  showToast 
}) {
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachedDoc, setAttachedDoc] = useState(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Pre-fill user data
  useEffect(() => {
    if (currentUser) {
      setApplicantName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Synchronize when a service card is clicked in ServicesGrid
  useEffect(() => {
    if (selectedService) {
      setServiceId(selectedService.id);
    }
  }, [selectedService]);

  const currentServiceObj = SERVICES_LIST.find((s) => s.id === serviceId) || null;
  const currentFee = currentServiceObj ? currentServiceObj.fee : 0;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('फ़ाइल का साइज़ 5MB से कम होना चाहिए।', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedDoc({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        dataUrl: reader.result,
        type: file.type
      });
      showToast(`📎 '${file.name}' सफलतापूर्वक अपलोड किया गया!`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCameraCapture = (capturedDoc) => {
    setAttachedDoc(capturedDoc);
  };

  const handleRemoveDoc = () => {
    setAttachedDoc(null);
    showToast('दस्तावेज़ हटा दिया गया।', 'info');
  };

  // Called when user clicks "Proceed to Pay Fees"
  const handleOpenPayment = (e) => {
    e.preventDefault();

    if (!applicantName.trim()) {
      showToast('कृपया आवेदक का पूरा नाम दर्ज करें।', 'error');
      return;
    }
    if (!currentServiceObj) {
      showToast('कृपया आवेदन के लिए एक सेवा चुनें।', 'error');
      return;
    }

    // Open Fee Payment QR Modal!
    setIsFeeModalOpen(true);
  };

  // Called when user completes QR Payment with UTR
  const handleConfirmQRPayment = async (utrNumber) => {
    const payload = {
      applicantName: applicantName.trim(),
      email: email.trim() || currentUser?.email || 'citizen@portal.gov.in',
      phone: phone.trim(),
      serviceId: currentServiceObj.id,
      serviceName: currentServiceObj.name,
      fee: currentFee,
      paymentMethod: 'UPI QR',
      utr: utrNumber,
      remarks: remarks.trim(),
      document: attachedDoc
    };

    let appResult = null;
    try {
      const apiRes = await apiSubmitApplication(payload);
      if (apiRes.success) {
        appResult = apiRes.application;
      }
    } catch (e) {
      console.warn('Backend call failed, using local fallback:', e);
    }

    if (!appResult) {
      const localRes = submitApplication(payload);
      appResult = localRes.newApp;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setIsFeeModalOpen(false);
    setSubmittedApp(appResult);
    showToast(`🎉 आवेदन सबमिट हुआ! Ack ID: ${appResult.ackId}`, 'success');
    if (onApplicationCreated) onApplicationCreated(walletBalance);
  };

  // Called when user chooses to pay from Wallet balance
  const handleConfirmWalletPayment = async () => {
    const payload = {
      applicantName: applicantName.trim(),
      email: email.trim() || currentUser?.email || 'citizen@portal.gov.in',
      phone: phone.trim(),
      serviceId: currentServiceObj.id,
      serviceName: currentServiceObj.name,
      fee: currentFee,
      paymentMethod: 'Wallet',
      utr: 'WALLET-DEBIT',
      remarks: remarks.trim(),
      document: attachedDoc
    };

    let appResult = null;
    let newBal = walletBalance - currentFee;

    try {
      const apiRes = await apiSubmitApplication(payload);
      if (apiRes.success) {
        appResult = apiRes.application;
        newBal = apiRes.remainingBalance;
      }
    } catch (e) {
      console.warn('Backend call failed, using local fallback:', e);
    }

    if (!appResult) {
      const localRes = submitApplication(payload);
      appResult = localRes.newApp;
      newBal = localRes.remainingBalance;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setIsFeeModalOpen(false);
    setSubmittedApp(appResult);
    showToast(`🎉 वॉलेट से ₹${currentFee} भुगतान सफल! Ack ID: ${appResult.ackId}`, 'success');
    if (onApplicationCreated) onApplicationCreated(newBal);
  };

  const handleResetForm = () => {
    setSubmittedApp(null);
    setRemarks('');
    setAttachedDoc(null);
  };

  return (
    <div className="card apply-card" id="applyFormSection">
      <h2>
        <div className="card-title-left">
          <FileEdit className="icon-title" size={20} />
          <span>📝 ऑनलाइन सेवा आवेदन पत्र (Service Application Form)</span>
        </div>
      </h2>

      {/* Camera Capture Modal */}
      <CameraModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        showToast={showToast}
      />

      {/* Fee Payment & PhonePe QR Modal */}
      <FeePaymentModal 
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        service={currentServiceObj}
        applicantName={applicantName}
        walletBalance={walletBalance}
        onConfirmQR={handleConfirmQRPayment}
        onConfirmWallet={handleConfirmWalletPayment}
        showToast={showToast}
      />

      {submittedApp ? (
        <AcknowledgmentSlip 
          application={submittedApp}
          onReset={handleResetForm}
          showToast={showToast}
        />
      ) : (
        <form onSubmit={handleOpenPayment} className="apply-form-body">
          <div className="form-group">
            <label htmlFor="custName">आवेदक का नाम (Applicant Name) *</label>
            <input 
              type="text" 
              id="custName"
              placeholder="पूरा नाम दर्ज करें"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="custEmail">ईमेल पता (Email Address) *</label>
            <input 
              type="email" 
              id="custEmail"
              placeholder="उदा: citizen@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="custPhone">व्हाट्सएप / मोबाइल नंबर (WhatsApp Contact No)</label>
            <input 
              type="tel" 
              id="custPhone"
              placeholder="10-अंकों का व्हाट्सएप नंबर (वैकल्पिक)"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="custService">सेवा चुनें (Select Service) *</label>
            <select 
              id="custService"
              value={serviceId}
              onChange={(e) => {
                const found = SERVICES_LIST.find((s) => s.id === e.target.value);
                setServiceId(e.target.value);
                if (onSelectService) onSelectService(found || null);
              }}
            >
              <option value="">-- Choose Service --</option>
              {SERVICES_LIST.map((srv, idx) => (
                <option key={srv.id} value={srv.id}>
                  {idx + 1}. {srv.icon} {srv.name} - ₹{srv.fee}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Highlight Strip */}
          {currentServiceObj && (
            <div className="service-selected-banner">
              <div className="selected-banner-left">
                <span>चुनी गई सेवा: <strong>{currentServiceObj.name}</strong></span>
                <span className="selected-hindi-name">{currentServiceObj.nameHi}</span>
              </div>
              <div className="selected-banner-right">
                <span className="selected-fee-label">सरकारी पोर्टल शुल्क:</span>
                <strong className="selected-fee-val">₹{currentFee}.00</strong>
              </div>
            </div>
          )}

          {/* Document Upload Box */}
          <div className="form-group">
            <label>दस्तावेज़ / फोटो अपलोड करें (Camera या File)</label>
            <div className="upload-options">
              <button 
                type="button" 
                className="upload-btn"
                onClick={() => setIsCameraOpen(true)}
              >
                <Camera size={16} />
                <span>📷 Live Camera से फोटो लें</span>
              </button>

              <label className="upload-btn" htmlFor="filePickerInput">
                <FolderOpen size={16} />
                <span>📁 File / PDF चुनें</span>
                <input 
                  type="file" 
                  id="filePickerInput" 
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Document Preview Card */}
            {attachedDoc && (
              <div className="doc-preview-card">
                <div className="doc-preview-left">
                  {attachedDoc.type && attachedDoc.type.includes('pdf') ? (
                    <div className="pdf-thumb-box">📄 PDF</div>
                  ) : (
                    <img 
                      src={attachedDoc.dataUrl} 
                      alt="Doc Preview" 
                      className="doc-thumb" 
                    />
                  )}
                  <div className="doc-info">
                    <strong>{attachedDoc.name}</strong>
                    <span>{attachedDoc.size} • Ready to submit</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-remove-doc"
                  onClick={handleRemoveDoc}
                >
                  <Trash2 size={15} />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="custRemarks">
              अतिरिक्त विवरण / दस्तावेज़ नंबर (Remarks / Reference No)
            </label>
            <textarea 
              id="custRemarks" 
              rows={3}
              placeholder="संबंधित पहचान पत्र संख्या, पुराना संदर्भ नंबर, या विशेष निर्देश दर्ज करें"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit btn-saffron-submit btn-large-submit"
          >
            <span>💳 फीस भुगतान करें {currentFee > 0 ? `(₹${currentFee})` : ''} एवं आवेदन सबमिट करें</span>
            <ArrowRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
