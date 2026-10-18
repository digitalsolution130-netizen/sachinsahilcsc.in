import React, { useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { getApplicationByAck } from '../services/storageService';
import { apiTrackApplication } from '../services/api';

export default function TrackStatus({ showToast }) {
  const [ackQuery, setAckQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    const query = ackQuery.trim();
    if (!query) {
      showToast('कृपया Acknowledgment नंबर दर्ज करें।', 'error');
      return;
    }

    setHasSearched(true);
    let result = null;

    try {
      const res = await apiTrackApplication(query);
      if (res.success && res.application) {
        result = res.application;
      }
    } catch (err) {
      console.warn('Backend track failed, trying local storage');
    }

    if (!result) {
      result = getApplicationByAck(query);
    }

    setSearchResult(result);

    if (result) {
      showToast('आवेदन की जानकारी मिल गई!', 'success');
    } else {
      showToast('इस Acknowledgment नंबर का कोई आवेदन नहीं मिला।', 'error');
    }
  };

  const getStatusBadge = (status) => {
    if (status.includes('Completed') || status.includes('Approved')) {
      return (
        <span className="status-pill status-success">
          <CheckCircle size={14} /> {status}
        </span>
      );
    }
    if (status.includes('Rejected')) {
      return (
        <span className="status-pill status-danger">
          <XCircle size={14} /> {status}
        </span>
      );
    }
    return (
      <span className="status-pill status-warning">
        <Clock size={14} /> {status}
      </span>
    );
  };

  return (
    <div className="card track-card">
      <h2>
        <div className="card-title-left">
          <Search className="icon-title" size={20} />
          <span>🔎 आवेदन की स्थिति जांचे (Track Application Status)</span>
        </div>
      </h2>

      <form onSubmit={handleTrack} className="track-box">
        <input 
          type="text" 
          placeholder="अपना Acknowledgment नंबर दर्ज करें (उदा: DSK-842911)"
          value={ackQuery}
          onChange={(e) => setAckQuery(e.target.value)}
        />
        <button type="submit" className="track-btn">
          <Search size={15} />
          <span>Check Status</span>
        </button>
      </form>

      {hasSearched && (
        <div className="track-result-wrapper">
          {searchResult ? (
            <div className="track-result-card track-success-box">
              <div className="track-result-header">
                <div>
                  <h4 className="track-app-title">
                    <FileText size={18} />
                    <span>{searchResult.serviceName}</span>
                  </h4>
                  <span className="track-ack-sub">Acknowledgment: <strong>{searchResult.ackId}</strong></span>
                </div>
                <div>{getStatusBadge(searchResult.status)}</div>
              </div>

              <div className="track-details-grid">
                <div className="track-detail-item">
                  <span className="detail-label">आवेदक का नाम:</span>
                  <strong className="detail-val">{searchResult.applicantName}</strong>
                </div>
                <div className="track-detail-item">
                  <span className="detail-label">संपर्क नंबर:</span>
                  <strong className="detail-val">{searchResult.phone}</strong>
                </div>
                <div className="track-detail-item">
                  <span className="detail-label">शुल्क भुगतान:</span>
                  <strong className="detail-val text-success">₹{searchResult.fee}</strong>
                </div>
                <div className="track-detail-item">
                  <span className="detail-label">आवेदन दिनांक:</span>
                  <strong className="detail-val">{searchResult.date}</strong>
                </div>
                <div className="track-detail-item full-width">
                  <span className="detail-label">पोर्टल रिमार्क्स / स्थिति विवरण:</span>
                  <p className="detail-remarks">{searchResult.remarks || 'कार्य प्रगति पर है।'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="track-result-card track-error-box">
              <XCircle size={20} />
              <span>❌ कोई रिकॉर्ड नहीं मिला। कृपया Acknowledgment नंबर की जांच करें।</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

