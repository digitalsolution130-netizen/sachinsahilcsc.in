import React, { useRef, useState } from 'react';
import { Download, Printer, CheckCircle, FileCheck, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AcknowledgmentSlip({ application, onReset, showToast }) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!application) return null;

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    showToast('PDF जनरेट हो रहा है, कृपया प्रतीक्षा करें...', 'info');

    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      pdf.save(`Receipt_${application.ackId}.pdf`);
      showToast('✅ आधिकारिक PDF रसीद डाउनलोड हो गई!', 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('PDF डाउनलोड करने में त्रुटि हुई।', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ack-slip-wrapper">
      <div className="receipt-card" ref={receiptRef}>
        <div className="receipt-header">
          <div className="receipt-header-left">
            <div className="receipt-emblem">🏛️</div>
            <div>
              <h3>DIGITAL SOLUTIONS PORTAL</h3>
              <p className="receipt-sub">Official E-Governance Citizen Service Acknowledgment Slip</p>
              <p className="receipt-contacts">Helpline: 0130-7966590 | Email: digitalsolution130@gmail.com</p>
            </div>
          </div>
          <div className="receipt-header-right">
            <span className="receipt-date">{application.date}</span>
            <span className="badge-authorized-receipt">✓ Verified Citizen Receipt</span>
          </div>
        </div>

        <table className="receipt-table">
          <tbody>
            <tr>
              <td className="receipt-label">Acknowledgment Number:</td>
              <td className="receipt-val ack-id-highlight">{application.ackId}</td>
            </tr>
            <tr>
              <td className="receipt-label">Applicant Name:</td>
              <td className="receipt-val"><strong>{application.applicantName}</strong></td>
            </tr>
            <tr>
              <td className="receipt-label">Contact / WhatsApp:</td>
              <td className="receipt-val">{application.phone}</td>
            </tr>
            <tr>
              <td className="receipt-label">Selected Service:</td>
              <td className="receipt-val">
                <span className="service-highlight">{application.serviceName}</span>
              </td>
            </tr>
            <tr>
              <td className="receipt-label">Service Fee Paid:</td>
              <td className="receipt-val fee-highlight">
                ₹{application.fee}.00 ({application.paymentMethod === 'Wallet' ? 'Paid from Wallet' : 'Paid via PhonePe UPI QR'})
              </td>
            </tr>
            {application.utr && application.utr !== 'N/A' && (
              <tr>
                <td className="receipt-label">UPI Reference / UTR No:</td>
                <td className="receipt-val">
                  <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                    {application.utr}
                  </code>
                </td>
              </tr>
            )}
            <tr>
              <td className="receipt-label">Attached Document(s):</td>
              <td className="receipt-val">
                {application.documents && application.documents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {application.documents.map((d, i) => (
                      <span key={i} className="doc-attached-pill">
                        📎 #{i + 1} {d.name} ({d.size})
                      </span>
                    ))}
                  </div>
                ) : application.document ? (
                  <span className="doc-attached-pill">
                    📎 {application.document.name} ({application.document.size})
                  </span>
                ) : (
                  'कोई दस्तावेज़ संलग्न नहीं'
                )}
              </td>
            </tr>
            <tr>
              <td className="receipt-label">Current Application Status:</td>
              <td className="receipt-val">
                <span className="status-submitted-badge">
                  <CheckCircle size={14} />
                  <span>{application.status}</span>
                </span>
              </td>
            </tr>
            <tr>
              <td className="receipt-label">Remarks / Reference:</td>
              <td className="receipt-val">{application.remarks || 'None'}</td>
            </tr>
          </tbody>
        </table>

        <div className="receipt-footer-notes">
          <p>⚠️ इस Acknowledgment नंबर को सुरक्षित रखें। आप पोर्टल पर कभी भी अपने आवेदन की स्थिति ट्रैक कर सकते हैं।</p>
          <small>© 2026 Digital Solutions E-District Citizen Portal</small>
        </div>
      </div>

      <div className="receipt-action-buttons">
        <button 
          type="button" 
          className="btn-download"
          onClick={handleDownloadPDF}
          disabled={downloading}
        >
          <Download size={16} />
          <span>{downloading ? 'Generating PDF...' : '📥 Download Official PDF Receipt'}</span>
        </button>

        <button 
          type="button" 
          className="btn-print-slip"
          onClick={handlePrint}
        >
          <Printer size={16} />
          <span>🖨️ Print Receipt</span>
        </button>

        <button 
          type="button" 
          className="btn-new-app"
          onClick={onReset}
        >
          <ArrowLeft size={16} />
          <span>नया आवेदन भरें (New Application)</span>
        </button>
      </div>
    </div>
  );
}

