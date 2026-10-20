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
  RefreshCw,
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import {
  apiAdminGetTopups,
  apiAdminApproveTopup,
  apiAdminRejectTopup,
  apiAdminGetApplications,
  apiAdminUpdateAppStatus,
  apiAdminGetUsers,
  apiAdminAdjustWallet,
  apiAdminLogout
} from '../services/api';

export default function AdminPanel({ onExit, showToast }) {
  const [topups, setTopups] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);

  // Manual wallet adjust state
  const [adjustEmail, setAdjustEmail] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('credit'); // 'credit' | 'debit'
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const reloadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live top-ups
      try {
        const topupRes = await apiAdminGetTopups();
        if (topupRes && topupRes.success && topupRes.topups) {
          setTopups(topupRes.topups);
        }
      } catch (err) {
        console.warn('Topups API fetch error:', err.message);
      }

      // 2. Fetch live applications
      try {
        const appRes = await apiAdminGetApplications();
        if (appRes && appRes.success && appRes.applications) {
          setApplications(appRes.applications);
        }
      } catch (err) {
        console.warn('Apps API fetch error:', err.message);
      }

      // 3. Fetch live users list
      try {
        const userRes = await apiAdminGetUsers();
        if (userRes && userRes.success && userRes.users) {
          setUsers(userRes.users);
        }
      } catch (err) {
        console.warn('Users API fetch error:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleApprove = async (topupItem) => {
    const idToUse = topupItem.requestId || topupItem._id || topupItem.id;
    try {
      const apiRes = await apiAdminApproveTopup(idToUse);
      if (apiRes.success) {
        showToast(`✅ रीचार्ज स्वीकृत! ₹${topupItem.amount} वॉलेट में सफलतापूर्वक क्रेडिट किए गए।`, 'success');
        reloadData();
        return;
      } else {
        showToast(apiRes.message || 'स्वीकृति में समस्या आई।', 'error');
      }
    } catch (e) {
      showToast('सर्वर से संपर्क करने में समस्या आई।', 'error');
    }
  };

  const handleReject = async (topupItem) => {
    const idToUse = topupItem.requestId || topupItem._id || topupItem.id;
    try {
      const apiRes = await apiAdminRejectTopup(idToUse);
      if (apiRes.success) {
        showToast('❌ रीचार्ज रिक्वेस्ट रिजेक्ट कर दी गई।', 'info');
        reloadData();
      } else {
        showToast(apiRes.message || 'रिजेक्शन में समस्या आई।', 'error');
      }
    } catch (e) {
      showToast('सर्वर से संपर्क करने में समस्या आई।', 'error');
    }
  };

  const handleStatusChange = async (ackId, newStatus) => {
    try {
      const apiRes = await apiAdminUpdateAppStatus(ackId, newStatus);
      if (apiRes.success) {
        showToast(`आवेदन ${ackId} का स्टेटस '${newStatus}' में बदला गया!`, 'success');
        reloadData();
      } else {
        showToast(apiRes.message || 'स्टेटस अपडेट विफल।', 'error');
      }
    } catch (e) {
      showToast('सर्वर से संपर्क करने में समस्या आई।', 'error');
    }
  };

  const handleManualWalletSubmit = async (e) => {
    e.preventDefault();
    if (!adjustEmail.trim() || !adjustAmount || Number(adjustAmount) <= 0) {
      showToast('कृपया मान्य यूजर ईमेल और राशि दर्ज करें।', 'error');
      return;
    }

    setAdjusting(true);
    try {
      const res = await apiAdminAdjustWallet(
        adjustEmail.trim(),
        Number(adjustAmount),
        adjustType,
        adjustNote.trim() || 'Admin Adjustment'
      );
      if (res.success) {
        showToast(`✅ ${adjustType === 'credit' ? 'क्रेडिट (+)' : 'डेबिट (-)'} सफल! नया बैलेंस: ₹${res.newBalance}`, 'success');
        setAdjustAmount('');
        setAdjustNote('');
        reloadData();
      } else {
        showToast(res.message || 'एडजस्टमेंट विफल।', 'error');
      }
    } catch (err) {
      showToast('सर्वर त्रुटि: वॉलेट एडजस्ट नहीं हो पाया।', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const pendingCount = topups.filter((t) => t.status === 'Pending').length;

  return (
    <div className="admin-section-wrapper">
      <div className="gov-hero admin-hero">
        <div className="admin-hero-title">
          <ShieldCheck size={28} />
          <div>
            <h2>🛡️ Admin Master Control Panel - Digital Solutions</h2>
            <p>किसी भी सिस्टम / डिवाइस से पूर्ण नियंत्रण: वॉलेट क्रेडिट/डेबिट, UTR वेरिफिकेशन, व सरकारी सेवा आवेदन।</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="track-btn" 
            onClick={reloadData} 
            title="Reload live data from MongoDB Atlas"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>रिफ्रेश डाटा</span>
          </button>
          <button 
            type="button" 
            className="track-btn btn-exit-admin" 
            onClick={() => {
              apiAdminLogout();
              onExit();
            }}
          >
            <ArrowLeft size={16} />
            <span>← Exit Admin</span>
          </button>
        </div>
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
              <span className="stat-label">पंजीकृत नागरिक (Users)</span>
              <strong className="stat-number">{users.length}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Pending Wallet Top-Ups Table */}
        <div className="card">
          <h2>
            <span>⏳ Wallet Top-Up Requests (Verify PhonePe UTR)</span>
            <span className="table-badge">{pendingCount} Pending</span>
          </h2>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>User Email</th>
                  <th>Amount (₹)</th>
                  <th>12-Digit UTR</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
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
                  topups.map((item) => {
                    const rowKey = item.requestId || item._id || item.id;
                    const displayDate = item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : (item.date || 'N/A');
                    const isPending = item.status === 'Pending';

                    return (
                      <tr key={rowKey} className={isPending ? 'row-pending' : ''}>
                        <td><strong>{item.requestId || item.id}</strong></td>
                        <td>{item.userEmail || item.phone || 'Citizen'}</td>
                        <td><strong className="text-success">₹{item.amount}</strong></td>
                        <td>
                          <code className="utr-code">{item.utr}</code>
                        </td>
                        <td><small>{displayDate}</small></td>
                        <td>
                          <span className={`status-pill status-${(item.status || 'pending').toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {isPending ? (
                            <div className="btn-action-group">
                              <button 
                                type="button" 
                                className="btn-action btn-approve"
                                onClick={() => handleApprove(item)}
                                title="Approve and Credit Wallet"
                              >
                                <Check size={13} />
                                <span>Approve (Credit)</span>
                              </button>
                              <button 
                                type="button" 
                                className="btn-action btn-reject"
                                onClick={() => handleReject(item)}
                                title="Reject Top-up"
                              >
                                <X size={13} />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted text-sm">
                              {item.status === 'Approved' ? '✅ Credited' : '❌ Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Direct Wallet Credit / Debit Control */}
        <div className="card">
          <h2>
            <span>💳 Direct Wallet Credit & Debit Tool (वॉलेट बैलेंस प्रबंधन)</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>
            आप किसी भी नागरिक के ईमेल पर सीधे पैसे जोड़ (Credit) या काट (Debit) सकते हैं:
          </p>

          <form onSubmit={handleManualWalletSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>नागरिक का ईमेल (Citizen Email) *</label>
              <input 
                type="email" 
                placeholder="उदा: user@gmail.com" 
                value={adjustEmail}
                onChange={(e) => setAdjustEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>राशि (Amount in ₹) *</label>
              <input 
                type="number" 
                placeholder="उदा: 100" 
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>प्रकार (Action Type)</label>
              <select 
                value={adjustType} 
                onChange={(e) => setAdjustType(e.target.value)}
                className="status-selector"
                style={{ width: '100%', padding: '9px 10px' }}
              >
                <option value="credit">➕ Credit (+ जोड़ें)</option>
                <option value="debit">➖ Debit (- काटें)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>रिमार्क / कारण (Optional)</label>
              <input 
                type="text" 
                placeholder="उदा: Special Refund / Service fee" 
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
              />
            </div>

            <div>
              <button 
                type="submit" 
                className={`btn-submit ${adjustType === 'credit' ? 'btn-green-submit' : 'btn-navy-submit'}`}
                style={{ margin: 0, padding: '10px 18px', height: '42px' }}
                disabled={adjusting}
              >
                {adjustType === 'credit' ? <Plus size={16} /> : <Minus size={16} />}
                <span>{adjusting ? 'प्रोसेसिंग...' : (adjustType === 'credit' ? 'Credit Balance' : 'Debit Balance')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Registered Citizens Live Balances */}
        {users.length > 0 && (
          <div className="card">
            <h2>
              <span>👥 Registered Citizens & Live Wallet Balances</span>
              <span className="table-badge">{users.length} Users</span>
            </h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Live Wallet Balance</th>
                    <th>Role</th>
                    <th>Quick Fill for Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.email}>
                      <td><strong>{u.name}</strong></td>
                      <td><code>{u.email}</code></td>
                      <td>
                        <strong className="text-success" style={{ fontSize: '1.05rem' }}>
                          ₹{Number(u.walletBalance || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className="status-pill status-approved">
                          {u.role || 'citizen'}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="btn-action btn-approve"
                          onClick={() => setAdjustEmail(u.email)}
                        >
                          Select Email
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: All Citizen Service Applications Table */}
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
                  <th>Email / Phone</th>
                  <th>Service Requested</th>
                  <th>Fee & Payment</th>
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
                  applications.map((app) => {
                    const displayDate = app.createdAt ? new Date(app.createdAt).toLocaleString('en-IN') : (app.date || 'N/A');

                    return (
                      <tr key={app.ackId || app._id}>
                        <td>
                          <strong className="text-navy">{app.ackId}</strong>
                          <div className="text-xs text-muted">{displayDate}</div>
                        </td>
                        <td><strong>{app.applicantName}</strong></td>
                        <td>
                          <div>{app.email}</div>
                          {app.phone && <small className="text-muted">{app.phone}</small>}
                        </td>
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
                          {app.documents && app.documents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {app.documents.map((d, dIdx) => (
                                <button 
                                  key={dIdx}
                                  type="button" 
                                  className="btn-view-doc"
                                  onClick={() => setSelectedDocPreview(d)}
                                  title={d.name}
                                  style={{ padding: '3px 6px', fontSize: '0.74rem' }}
                                >
                                  <Eye size={11} />
                                  <span>Doc {dIdx + 1}: {((d.name || 'File')).slice(0, 9)}...</span>
                                </button>
                              ))}
                            </div>
                          ) : app.document && (app.document.url || app.document.dataUrl) ? (
                            <button 
                              type="button" 
                              className="btn-view-doc"
                              onClick={() => setSelectedDocPreview(app.document)}
                            >
                              <Eye size={13} />
                              <span>View ({((app.document.name || 'Doc')).slice(0, 10)}...)</span>
                            </button>
                          ) : (
                            <span className="text-muted text-xs">None</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill status-${(app.status || 'submitted').toLowerCase().replace(/[^a-z]/g, '')}`}>
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
                    );
                  })
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
              <h4 className="modal-title">📎 Document Preview: {selectedDocPreview.name || 'Citizen Attachment'}</h4>
              <button type="button" className="btn-close-modal" onClick={() => setSelectedDocPreview(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="doc-preview-modal-body">
              {selectedDocPreview.type && selectedDocPreview.type.includes('pdf') ? (
                <div className="pdf-view-box">
                  <p>📄 PDF File: <strong>{selectedDocPreview.name}</strong> ({selectedDocPreview.size})</p>
                  <a 
                    href={selectedDocPreview.url || selectedDocPreview.dataUrl} 
                    download={selectedDocPreview.name || 'document.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-submit btn-green-submit"
                    style={{ display: 'inline-flex', width: 'auto', padding: '8px 16px', marginTop: '10px' }}
                  >
                    Open / Download PDF
                  </a>
                </div>
              ) : (
                <img 
                  src={selectedDocPreview.url || selectedDocPreview.dataUrl} 
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
