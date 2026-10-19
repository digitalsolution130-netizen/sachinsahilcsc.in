import express from 'express';
import jwt from 'jsonwebtoken';
import { Topup } from '../models/Topup.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { getDbStatus } from '../config/db.js';
import { memoryTopups, memoryBalances } from './walletRoutes.js';
import { memoryApps } from './applicationRoutes.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'digital_solutions_jwt_secret_key_2026_secure';
const MASTER_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Sachin@9034';

// Middleware to verify admin authentication
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers['x-admin-key'];

  // Direct key check
  if (adminKey && (adminKey === 'Sachin@9034' || adminKey === process.env.ADMIN_PASSWORD)) {
    return next();
  }

  // Bearer Token check
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.role === 'admin') {
        req.admin = decoded;
        return next();
      }
    } catch (err) {
      return res.status(401).json({ success: false, message: 'सत्र समाप्त हो चुका है। कृपया पुनः एडमिन लॉगिन करें।' });
    }
  }

  return res.status(401).json({ success: false, message: 'अनधिकृत प्रवेश! एडमिन पासवर्ड आवश्यक है।' });
};

// 1. Admin Login (Multi-system access with JWT token)
router.post('/login', (req, res) => {
  const { password } = req.body;
  const currentMaster = (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== 'admin123') 
    ? process.env.ADMIN_PASSWORD 
    : 'Sachin@9034';

  const isPasswordValid = password && (password.trim() === 'Sachin@9034' || password.trim() === currentMaster.trim());

  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'गलत एडमिन पासवर्ड!' });
  }

  // Generate Admin JWT token valid for 7 days
  const token = jwt.sign(
    { role: 'admin', portal: 'DIGITAL_SOLUTIONS_GOV' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    success: true,
    message: '🛡️ एडमिन लॉगिन सफल! पूर्ण नियंत्रण सक्रिय।',
    token,
    role: 'admin'
  });
});

// 2. Get All Top-ups (Protected)
router.get('/topups', requireAdmin, async (req, res) => {
  try {
    if (getDbStatus()) {
      const topups = await Topup.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, topups });
    } else {
      return res.status(200).json({ success: true, topups: memoryTopups });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Approve Top-up (Credits User Wallet atomically in MongoDB Atlas)
router.put('/topups/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const topup = await Topup.findOne({ requestId: id }) || await Topup.findById(id);
      if (!topup) {
        return res.status(404).json({ success: false, message: 'टॉप-अप रिक्वेस्ट नहीं मिली।' });
      }

      if (topup.status === 'Approved') {
        return res.status(400).json({ success: false, message: 'यह रीचार्ज पहले ही स्वीकृत हो चुका है।' });
      }

      const cleanEmail = topup.userEmail.trim().toLowerCase();
      const amountToAdd = Number(topup.amount) || 0;

      // Find or create User and update balance atomically
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          walletBalance: amountToAdd,
          role: 'citizen'
        });
      } else {
        user.walletBalance = (user.walletBalance || 0) + amountToAdd;
        await user.save();
      }

      topup.status = 'Approved';
      await topup.save();

      return res.status(200).json({
        success: true,
        message: `₹${topup.amount} सफलतापूर्वक वॉलेट में क्रेडिट किए गए!`,
        topup,
        updatedBalance: user.walletBalance
      });
    } else {
      const topup = memoryTopups.find((t) => t.requestId === id || t._id === id);
      if (!topup) {
        return res.status(404).json({ success: false, message: 'टॉप-अप रिक्वेस्ट नहीं मिली।' });
      }

      if (topup.status === 'Approved') {
        return res.status(400).json({ success: false, message: 'यह रीचार्ज पहले ही स्वीकृत हो चुका है।' });
      }

      const cleanEmail = topup.userEmail.trim().toLowerCase();
      const current = memoryBalances.get(cleanEmail) || 0;
      const newBal = current + Number(topup.amount);
      memoryBalances.set(cleanEmail, newBal);
      topup.status = 'Approved';

      return res.status(200).json({
        success: true,
        message: `₹${topup.amount} सफलतापूर्वक वॉलेट में क्रेडिट किए गए!`,
        topup,
        updatedBalance: newBal
      });
    }
  } catch (error) {
    console.error('Approve topup error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Reject Top-up
router.put('/topups/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const topup = await Topup.findOne({ requestId: id }) || await Topup.findById(id);
      if (!topup) {
        return res.status(404).json({ success: false, message: 'रिक्वेस्ट नहीं मिली।' });
      }
      topup.status = 'Rejected';
      await topup.save();
      return res.status(200).json({ success: true, message: 'रीचार्ज रिक्वेस्ट रिजेक्ट कर दी गई।', topup });
    } else {
      const topup = memoryTopups.find((t) => t.requestId === id || t._id === id);
      if (topup) topup.status = 'Rejected';
      return res.status(200).json({ success: true, message: 'रीचार्ज रिक्वेस्ट रिजेक्ट कर दी गई।' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Manual Wallet Adjust (Credit or Debit by Admin)
router.post('/wallet/adjust', requireAdmin, async (req, res) => {
  try {
    const { email, amount, type, note } = req.body;
    if (!email || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'कृपया मान्य ईमेल और राशि दर्ज करें।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adjustAmount = Number(amount);
    const isCredit = type === 'credit';

    if (getDbStatus()) {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        if (!isCredit) {
          return res.status(404).json({ success: false, message: 'यूजर नहीं मिला।' });
        }
        user = await User.create({
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          walletBalance: 0,
          role: 'citizen'
        });
      }

      if (!isCredit && (user.walletBalance || 0) < adjustAmount) {
        return res.status(400).json({ success: false, message: 'उपयोगकर्ता के वॉलेट में पर्याप्त बैलेंस नहीं है।' });
      }

      user.walletBalance = isCredit 
        ? (user.walletBalance || 0) + adjustAmount 
        : Math.max(0, (user.walletBalance || 0) - adjustAmount);

      await user.save();

      return res.status(200).json({
        success: true,
        message: `वॉलेट ${isCredit ? 'क्रेडिट (+)' : 'डेबिट (-)'} सफल! नया बैलेंस: ₹${user.walletBalance}`,
        newBalance: user.walletBalance,
        user
      });
    } else {
      const current = memoryBalances.get(cleanEmail) || 0;
      if (!isCredit && current < adjustAmount) {
        return res.status(400).json({ success: false, message: 'पर्याप्त बैलेंस नहीं है।' });
      }
      const newBal = isCredit ? current + adjustAmount : Math.max(0, current - adjustAmount);
      memoryBalances.set(cleanEmail, newBal);

      return res.status(200).json({
        success: true,
        message: `वॉलेट ${isCredit ? 'क्रेडिट (+)' : 'डेबिट (-)'} सफल! नया बैलेंस: ₹${newBal}`,
        newBalance: newBal
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Get All Applications (Protected)
router.get('/applications', requireAdmin, async (req, res) => {
  try {
    if (getDbStatus()) {
      const applications = await Application.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, applications });
    } else {
      const apps = Array.from(memoryApps.values()).reverse();
      return res.status(200).json({ success: true, applications: apps });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Update Application Status (Protected)
router.put('/applications/:ackId/status', requireAdmin, async (req, res) => {
  try {
    const { ackId } = req.params;
    const { status } = req.body;

    if (getDbStatus()) {
      const app = await Application.findOne({ ackId });
      if (!app) {
        return res.status(404).json({ success: false, message: 'आवेदन नहीं मिला।' });
      }
      app.status = status;
      await app.save();
      return res.status(200).json({ success: true, message: 'आवेदन स्टेटस अपडेट हो गया!', application: app });
    } else {
      const app = memoryApps.get(ackId);
      if (!app) {
        return res.status(404).json({ success: false, message: 'आवेदन नहीं मिला।' });
      }
      app.status = status;
      return res.status(200).json({ success: true, message: 'आवेदन स्टेटस अपडेट हो गया!', application: app });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Get All Users (Protected)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    if (getDbStatus()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, users });
    } else {
      return res.status(200).json({ success: true, users: [] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
