// Storage & Mock Service Layer (Ready to be switched to MongoDB/Express backend API)
const STORAGE_KEYS = {
  USERS: 'portal_users_v2',
  WALLETS: 'portal_wallets_v2',
  PENDING_TOPUPS: 'portal_pending_topups_v2',
  APPLICATIONS: 'portal_apps_v2',
  ACTIVE_USER: 'portal_active_user_v2',
  ADMIN_LOGGED_IN: 'portal_admin_session_v2'
};

function safeGet(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// Initial seed data if empty
export function initSeedData() {
  const users = safeGet(STORAGE_KEYS.USERS, null);
  if (!users) {
    safeSet(STORAGE_KEYS.USERS, {
      "9876543210": { name: "Ramesh Kumar", phone: "9876543210" },
      "9123456789": { name: "Pooja Sharma", phone: "9123456789" }
    });
  }

  const wallets = safeGet(STORAGE_KEYS.WALLETS, null);
  if (!wallets) {
    safeSet(STORAGE_KEYS.WALLETS, {
      "9876543210": 250,
      "9123456789": 100
    });
  }

  const apps = safeGet(STORAGE_KEYS.APPLICATIONS, null);
  if (!apps) {
    safeSet(STORAGE_KEYS.APPLICATIONS, {
      "DSK-842911": {
        ackId: "DSK-842911",
        applicantName: "Ramesh Kumar",
        phone: "9876543210",
        serviceName: "Voter ID Card Download",
        fee: 100,
        date: "18/10/2026, 11:30 AM",
        status: "Completed",
        remarks: "Digital voter slip issued and verified.",
        document: null
      }
    });
  }

  const topups = safeGet(STORAGE_KEYS.PENDING_TOPUPS, null);
  if (!topups) {
    safeSet(STORAGE_KEYS.PENDING_TOPUPS, [
      {
        id: "TOP-1001",
        phone: "9123456789",
        amount: 200,
        utr: "428791054321",
        date: "18/10/2026, 01:15 PM",
        status: "Pending"
      }
    ]);
  }
}

// User Auth
export function getActiveUser() {
  return safeGet(STORAGE_KEYS.ACTIVE_USER, null);
}

export function setActiveUser(user) {
  safeSet(STORAGE_KEYS.ACTIVE_USER, user);
}

export function logoutUser() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  } catch (e) {}
}

export function registerUser(name, phone) {
  const users = safeGet(STORAGE_KEYS.USERS, {});
  users[phone] = { name, phone };
  safeSet(STORAGE_KEYS.USERS, users);

  // Initialize wallet for new user with 0
  const wallets = safeGet(STORAGE_KEYS.WALLETS, {});
  if (wallets[phone] === undefined) {
    wallets[phone] = 0;
    safeSet(STORAGE_KEYS.WALLETS, wallets);
  }

  const user = { name, phone };
  setActiveUser(user);
  return user;
}

export function loginUser(phone) {
  const users = safeGet(STORAGE_KEYS.USERS, {});
  const name = users[phone]?.name || `Citizen ${phone.slice(-4)}`;
  const user = { name, phone };
  
  // ensure user is recorded
  users[phone] = user;
  safeSet(STORAGE_KEYS.USERS, users);

  // ensure wallet exists
  const wallets = safeGet(STORAGE_KEYS.WALLETS, {});
  if (wallets[phone] === undefined) {
    wallets[phone] = 0;
    safeSet(STORAGE_KEYS.WALLETS, wallets);
  }

  setActiveUser(user);
  return user;
}

// Wallet
export function getWalletBalance(phone) {
  if (!phone) return 0;
  const wallets = safeGet(STORAGE_KEYS.WALLETS, {});
  return wallets[phone] !== undefined ? wallets[phone] : 0;
}

export function updateWalletBalance(identifier, newBalance) {
  if (!identifier) return 0;
  const wallets = safeGet(STORAGE_KEYS.WALLETS, {});
  wallets[identifier] = Math.max(0, newBalance);
  safeSet(STORAGE_KEYS.WALLETS, wallets);
  return wallets[identifier];
}

export const setWalletBalance = updateWalletBalance;

// Top-ups
export function submitTopupRequest(phone, amount, utr) {
  const topups = safeGet(STORAGE_KEYS.PENDING_TOPUPS, []);
  const newTopup = {
    id: `TOP-${Math.floor(1000 + Math.random() * 9000)}`,
    phone,
    amount: Number(amount),
    utr: utr.trim(),
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    status: 'Pending'
  };
  topups.unshift(newTopup);
  safeSet(STORAGE_KEYS.PENDING_TOPUPS, topups);
  return newTopup;
}

export function getPendingTopups() {
  return safeGet(STORAGE_KEYS.PENDING_TOPUPS, []);
}

export function approveTopup(topupId) {
  const topups = safeGet(STORAGE_KEYS.PENDING_TOPUPS, []);
  const itemIndex = topups.findIndex(t => t.id === topupId);
  if (itemIndex === -1) return false;

  const item = topups[itemIndex];
  if (item.status === 'Approved') return false;

  // Credit the wallet
  const wallets = safeGet(STORAGE_KEYS.WALLETS, {});
  const current = wallets[item.phone] || 0;
  wallets[item.phone] = current + Number(item.amount);
  safeSet(STORAGE_KEYS.WALLETS, wallets);

  // Update status
  topups[itemIndex].status = 'Approved';
  safeSet(STORAGE_KEYS.PENDING_TOPUPS, topups);
  return { success: true, updatedBalance: wallets[item.phone], phone: item.phone };
}

export function rejectTopup(topupId) {
  const topups = safeGet(STORAGE_KEYS.PENDING_TOPUPS, []);
  const itemIndex = topups.findIndex(t => t.id === topupId);
  if (itemIndex === -1) return false;

  topups[itemIndex].status = 'Rejected';
  safeSet(STORAGE_KEYS.PENDING_TOPUPS, topups);
  return true;
}

// Service Applications
export function submitApplication(appData) {
  const apps = safeGet(STORAGE_KEYS.APPLICATIONS, {});
  const ackId = `DSK-${Math.floor(100000 + Math.random() * 900000)}`;

  const paymentMethod = appData.paymentMethod || 'UPI QR';
  const utr = appData.utr ? appData.utr.trim() : (paymentMethod === 'Wallet' ? 'WALLET-DEBIT' : 'N/A');

  const newApp = {
    ackId,
    applicantName: appData.applicantName,
    phone: appData.phone,
    serviceName: appData.serviceName,
    fee: Number(appData.fee),
    paymentMethod,
    utr,
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    status: 'Submitted / Processing',
    remarks: appData.remarks || 'None',
    document: appData.document || null
  };

  apps[ackId] = newApp;
  safeSet(STORAGE_KEYS.APPLICATIONS, apps);

  const wallets = safeGet(STORAGE_KEYS.WALLETS, {});
  if (paymentMethod === 'Wallet') {
    const current = wallets[appData.phone] || 0;
    wallets[appData.phone] = Math.max(0, current - Number(appData.fee));
    safeSet(STORAGE_KEYS.WALLETS, wallets);
  }

  return { newApp, remainingBalance: wallets[appData.phone] !== undefined ? wallets[appData.phone] : 0 };
}

export function getAllApplications() {
  const apps = safeGet(STORAGE_KEYS.APPLICATIONS, {});
  return Object.values(apps).reverse();
}

export function getApplicationByAck(ackId) {
  const apps = safeGet(STORAGE_KEYS.APPLICATIONS, {});
  return apps[ackId.trim()] || null;
}

export function updateApplicationStatus(ackId, status) {
  const apps = safeGet(STORAGE_KEYS.APPLICATIONS, {});
  if (apps[ackId]) {
    apps[ackId].status = status;
    safeSet(STORAGE_KEYS.APPLICATIONS, apps);
    return true;
  }
  return false;
}

// Admin Session
export function getAdminSession() {
  return safeGet(STORAGE_KEYS.ADMIN_LOGGED_IN, false);
}

export function setAdminSession(val) {
  safeSet(STORAGE_KEYS.ADMIN_LOGGED_IN, Boolean(val));
}

