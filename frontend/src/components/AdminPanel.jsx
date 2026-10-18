import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  FileText, 
  Wallet, 
  Users, 
  ExternalLink,
  Eye
} from 'lucide-react';
import { 
  getPendingTopups, 
  approveTopup, 
  rejectTopup, 
  getAllApplications, 
  updateApplicationStatus 
} from '../services/storageService';
import {
  apiAdminGetTopups,
  apiAdminApproveTopup,
  apiAdminRejectTopup,
  apiAdminGetApplications,
  apiAdminUpdateAppStatus
} from '../services/api';

export default function AdminPanel({ onExit, showToast }) {
  const [topups, setTopups] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);

  const reloadData = async () => {
    try {
      const topupRes = await apiAdminGetTopups();
      if (topupRes.success && topupRes.topups) {
        setTopups(topupRes.topups);
      } else {
        setTopups(getPendingTopups());
      }
    } catch (e) {
      setTopups(getPendingTopups());
    }

    try {
      const appRes = await apiAdminGetApplications();
      if (appRes.success && appRes.applications) {
        setApplications(appRes.applications);
      } else {
        setApplications(getAllApplications());
      }
    } catch (e) {
      setApplications(getAllApplications());
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleApprove = async (topupId) => {
    try {
      const apiRes = await apiAdminApproveTopup(topupId);
      if (apiRes.success) {
        showToast(`✅ पेमेंट स्वीकृत! ${apiRes.message}`, 'success');
        reloadData();
        return;
      }
    } catch (e) {
      console.warn('API approve failed, using fallback');
    }

    const res = approveTopup(topupId);
    if (res && res.success) {
      showToast(`✅ पेमेंट स्वीकृत! ₹${res.updatedBalance} वॉलेट में जोड़े गए`, 'success');
      reloadData();
    } else {
      showToast('यह पेमेंट पहले ही प्रोसेस हो चुका है।', 'error');
    }
  };

  const handleReject = async (topupId) => {
    try {
      const apiRes = await apiAdminRejectTopup(topupId);
      if (apiRes.success) {
        showToast('❌ पेमेंट रिजेक्ट कर दिया गया।', 'info');
        reloadData();
        return;
      }
    } catch (e) {
      console.warn('API reject failed, using fallback');
    }

    const res = rejectTopup(topupId);
    if (res) {
      showToast('❌ पेमेंट रिजेक्ट कर दिया गया।', 'info');
      reloadData();
    }
  };

  const handleStatusChange = async (ackId, newStatus) => {
    try {
      const apiRes = await apiAdminUpdateAppStatus(ackId, newStatus);
      if (apiRes.success) {
        showToast(`आवेदन ${ackId} का स्टेटस '${newStatus}' में बदला गया!`, 'success');
        reloadData();
        return;
      }
    } catch (e) {
      console.warn('API status update failed, using fallback');
    }

    const ok = updateApplicationStatus(ackId, newStatus);
    if (ok) {
      showToast(`आवेदन ${ackId} का स्टेटस '${newStatus}' में बदला गया!`, 'success');
      reloadData();
    }
  };

  const pendingCount = topups.filter((t) => t.status === 'Pending').length;

  return (
    <div className="admin-section-wrapper">
      <div className="gov-hero admin-hero">
        <div className="admin-hero-title">
          <ShieldCheck size={28} />
          <div>
            <h2>🛡️ Admin Control Panel - Digital Solutions</h2>
            <p>वॉलेट रीचार्ज अप्रूवल, UTR वेरिफिकेशन, और नागरिक सेवा आवेदनों का प्रबंधन।</p>
          </div>
        </div>
        <button type="button" className="track-btn btn-exit-admin" onClick={onExit}>
          <ArrowLeft size={16} />
          <span>← Exit Admin Panel</span>
        </button>
      </div>

      <div className="container">
        {/* Quick Stats Grid */}
        <div className="admin-stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-icon"><FileText size={22} /></div>
            <div>
              <span className="stat-label">कुल आवेदन (Total Apps)</span>
              <strong className="stat-number">{applications.length}</strong>
            </div>
          </div>
          <div className="stat-card stat-amber">
            <div className="stat-icon"><Clock size={22} /></div>
            <div>
              <span className="stat-label">पेंडिंग रीचार्ज (Pending UTR)</span>
              <strong className="stat-number">{pendingCount}</strong>
            </div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-icon"><Wallet size={22} /></div>
            <div>
              <span className="stat-label">कुल रीचार्ज रिक्वेस्ट्स</span>
              <strong className="stat-number">{topups.length}</strong>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon"><Users size={22} /></div>
            <div>
              <span className="stat-label">सिस्टम स्थिति</span>
              <strong className="stat-number">Live & Secure</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Pending Wallet Top-Ups Table */}
        <div className="card">
          <h2>
            <span>⏳ Wallet Top-Up Requests (Cross-Check 12-Digit UTR)</span>
            <span className="table-badge">{pendingCount} Pending</span>
          </h2>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>User Phone</th>
                  <th>Amount (₹)</th>
                  <th>UTR / Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      कोई रीचार्ज रिक्वेस्ट नहीं है।
                    </td>
                  </tr>
                ) : (
                  topups.map((item) => (
                    <tr key={item.id} className={item.status === 'Pending' ? 'row-pending' : ''}>
                      <td><strong>{item.id}</strong></td>
                      <td>{item.phone}</td>
                      <td><strong className="text-success">₹{item.amount}</strong></td>
                      <td>
                        <code className="utr-code">{item.utr}</code>
                      </td>
                      <td><small>{item.date}</small></td>
                      <td>
                        <span className={`status-pill status-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'Pending' ? (
                          <div className="btn-action-group">
                            <button 
                              type="button" 
                              className="btn-action btn-approve"
                              onClick={() => handleApprove(item.id)}
                              title="Approve and Credit Wallet"
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button 
                              type="button" 
                              className="btn-action btn-reject"
                              onClick={() => handleReject(item.id)}
                              title="Reject Top-up"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted text-sm">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: All Citizen Service Applications Table */}
        <div className="card">
          <h2>
            <span>📋 All Citizen Service Applications (सर्विस प्रोसेसिंग)</span>
            <span className="table-badge">{applications.length} Applications</span>
          </h2>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ack ID</th>
                  <th>Applicant Name</th>
                  <th>Phone</th>
                  <th>Service Requested</th>
                  <th>Fee Paid</th>
                  <th>Document</th>
                  <th>Current Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      अभी तक कोई आवेदन सबमिट नहीं हुआ है।
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.ackId}>
                      <td>
                        <strong className="text-navy">{app.ackId}</strong>
                        <div className="text-xs text-muted">{app.date}</div>
                      </td>
                      <td><strong>{app.applicantName}</strong></td>
                      <td>{app.phone}</td>
                      <td>{app.serviceName}</td>
                      <td>
                        <strong className="text-success">₹{app.fee}</strong>
                        <div className="text-xs" style={{ marginTop: '2px', color: '#475569', fontWeight: '600' }}>
                          {app.paymentMethod === 'Wallet' ? '💳 Wallet' : '📱 PhonePe QR'}
                        </div>
                        {app.utr && app.utr !== 'N/A' && (
                          <div style={{ marginTop: '2px' }}>
                            <code style={{ fontSize: '0.72rem', background: '#e2e8f0', padding: '1px 5px', borderRadius: '3px', fontWeight: '700' }}>
                              UTR: {app.utr}
                            </code>
                          </div>
                        )}
                      </td>
                      <td>
                        {app.document ? (
                          <button 
                            type="button" 
                            className="btn-view-doc"
                            onClick={() => setSelectedDocPreview(app.document)}
                          >
                            <Eye size={13} />
                            <span>View ({app.document.name.slice(0, 10)}...)</span>
                          </button>
                        ) : (
                          <span className="text-muted text-xs">None</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill status-${app.status.toLowerCase().replace(/[^a-z]/g, '')}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="status-selector"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.ackId, e.target.value)}
                        >
                          <option value="Submitted / Processing">Submitted / Processing</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocPreview && (
        <div className="modal-backdrop">
          <div className="modal-content doc-modal">
            <div className="modal-header">
              <h4 className="modal-title">📎 Document Preview: {selectedDocPreview.name}</h4>
              <button type="button" className="btn-close-modal" onClick={() => setSelectedDocPreview(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="doc-preview-modal-body">
              {selectedDocPreview.type && selectedDocPreview.type.includes('pdf') ? (
                <div className="pdf-view-box">
                  <p>📄 PDF File: <strong>{selectedDocPreview.name}</strong> ({selectedDocPreview.size})</p>
                  <a 
                    href={selectedDocPreview.dataUrl} 
                    download={selectedDocPreview.name}
                    className="btn-submit btn-green-submit"
                    style={{ display: 'inline-flex', width: 'auto', padding: '8px 16px', marginTop: '10px' }}
                  >
                    Open / Download PDF
                  </a>
                </div>
              ) : (
                <img 
                  src={selectedDocPreview.dataUrl} 
                  alt="Document Attachment" 
                  className="modal-preview-image"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

