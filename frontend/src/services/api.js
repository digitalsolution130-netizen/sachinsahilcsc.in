// Smart API Base URL resolver: works on localhost, local Wi-Fi / LAN, and live cloud deployment
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `http://${host}:5000/api`;
    }
  }
  // Production Cloud deployment fallback
  return 'https://sachinsahilcsc-in.onrender.com/api';
};

const API_BASE = getApiBaseUrl();

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('portal_token_v2');
  const adminToken = localStorage.getItem('admin_token_v2');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(adminToken ? { 'x-admin-token': adminToken } : {}),
    ...(options.headers || {})
  };

  // If calling an admin route and adminToken exists, pass Bearer adminToken
  if (endpoint.startsWith('/admin') && adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  const base = getApiBaseUrl();
  const url = `${base}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[API] Error contacting ${url}:`, err.message);
    throw err;
  }
}

// 1. Auth APIs (Strict Email OTP)
export const apiSendEmailOtp = async (email) => {
  return await request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const apiVerifyEmailOtp = async (email, otp, name = '') => {
  const data = await request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp, name })
  });
  if (data.token) {
    localStorage.setItem('portal_token_v2', data.token);
  }
  return data;
};

// 2. Wallet APIs
export const apiSubmitTopup = async (email, amount, utr) => {
  return await request('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ email, amount, utr })
  });
};

export const apiGetBalance = async (email) => {
  return await request(`/wallet/balance/${encodeURIComponent(email)}`, {
    method: 'GET'
  });
};

export const apiGetWalletHistory = async (email) => {
  return await request(`/wallet/history/${encodeURIComponent(email)}`, {
    method: 'GET'
  });
};

// 3. Application APIs
export const apiSubmitApplication = async (appData) => {
  return await request('/applications', {
    method: 'POST',
    body: JSON.stringify({
      applicantName: appData.applicantName,
      email: appData.email,
      phone: appData.phone,
      serviceName: appData.serviceName,
      fee: appData.fee,
      paymentMethod: appData.paymentMethod,
      utr: appData.utr,
      remarks: appData.remarks,
      documentDataUrl: appData.document?.dataUrl || null,
      documentName: appData.document?.name || null
    })
  });
};

export const apiTrackApplication = async (ackId) => {
  return await request(`/applications/track/${encodeURIComponent(ackId)}`, {
    method: 'GET'
  });
};

// 4. Admin APIs (Multi-System Remote Access)
export const apiAdminLogin = async (password) => {
  const data = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password })
  });
  if (data.success && data.token) {
    localStorage.setItem('admin_token_v2', data.token);
  }
  return data;
};

export const apiAdminGetTopups = async () => {
  return await request('/admin/topups', { method: 'GET' });
};

export const apiAdminApproveTopup = async (topupId) => {
  return await request(`/admin/topups/${topupId}/approve`, { method: 'PUT' });
};

export const apiAdminRejectTopup = async (topupId) => {
  return await request(`/admin/topups/${topupId}/reject`, { method: 'PUT' });
};

export const apiAdminAdjustWallet = async (email, amount, type, note) => {
  return await request('/admin/wallet/adjust', {
    method: 'POST',
    body: JSON.stringify({ email, amount, type, note })
  });
};

export const apiAdminGetApplications = async () => {
  return await request('/admin/applications', { method: 'GET' });
};

export const apiAdminUpdateAppStatus = async (ackId, status) => {
  return await request(`/admin/applications/${ackId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

export const apiAdminGetUsers = async () => {
  return await request('/admin/users', { method: 'GET' });
};

export const apiAdminLogout = () => {
  localStorage.removeItem('admin_token_v2');
};

