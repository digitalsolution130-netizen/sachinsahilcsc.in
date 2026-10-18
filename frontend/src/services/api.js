const API_BASE = 'https://sachinsahilcsc-in.onrender.com';

// Helper for fetch with JSON
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('portal_token_v2');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`API call to ${endpoint} failed, checking fallback:`, err.message);
    throw err;
  }
}

// 1. Auth APIs (Email OTP)
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

// 3. Application APIs
export const apiSubmitApplication = async (appData) => {
  // If document is a standard File, we can use FormData or JSON with dataUrl
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

// 4. Admin APIs
export const apiAdminLogin = async (password) => {
  return await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password })
  });
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

export const apiAdminGetApplications = async () => {
  return await request('/admin/applications', { method: 'GET' });
};

export const apiAdminUpdateAppStatus = async (ackId, status) => {
  return await request(`/admin/applications/${ackId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

