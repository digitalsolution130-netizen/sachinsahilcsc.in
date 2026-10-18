import express from 'express';
import { Topup } from '../models/Topup.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { getDbStatus } from '../config/db.js';
import { memoryTopups, memoryBalances } from './walletRoutes.js';
import { memoryApps } from './applicationRoutes.js';

const router = express.Router();

// 1. Admin Login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const masterPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === masterPassword) {
    return res.status(200).json({ success: true, message: 'एडमिन लॉगिन सफल।' });
  }
  return res.status(401).json({ success: false, message: 'गलत एडमिन पासवर्ड!' });
});

// 2. Get All Top-ups
router.get('/topups', async (req, res) => {
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

// 3. Approve Top-up
router.put('/topups/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const topup = await Topup.findOne({ requestId: id }) || await Topup.findById(id);
      if (!topup) {
        return res.status(404).json({ success: false, message: 'रिक्वेस्ट नहीं मिली।' });
      }

      if (topup.status === 'Approved') {
        return res.status(400).json({ success: false, message: 'यह पहले ही स्वीकृत हो चुका है।' });
      }

      // Credit wallet
      const user = await User.findOne({ email: topup.userEmail });
      if (user) {
        user.walletBalance += topup.amount;
        await user.save();
      }

      topup.status = 'Approved';
      await topup.save();

      return res.status(200).json({
        success: true,
        message: `₹${topup.amount} वॉलेट में सफलतापूर्वक जोड़े गए!`,
        topup
      });
    } else {
      const topup = memoryTopups.find((t) => t.requestId === id || t._id === id);
      if (!topup) {
        return res.status(404).json({ success: false, message: 'रिक्वेस्ट नहीं मिली।' });
      }

      const current = memoryBalances.get(topup.userEmail) || 0;
      memoryBalances.set(topup.userEmail, current + topup.amount);
      topup.status = 'Approved';

      return res.status(200).json({
        success: true,
        message: `₹${topup.amount} वॉलेट में सफलतापूर्वक जोड़े गए!`,
        topup
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Reject Top-up
router.put('/topups/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const topup = await Topup.findOne({ requestId: id }) || await Topup.findById(id);
      if (!topup) {
        return res.status(404).json({ success: false, message: 'रिक्वेस्ट नहीं मिली।' });
      }
      topup.status = 'Rejected';
      await topup.save();
      return res.status(200).json({ success: true, message: 'रीचार्ज रिजेक्ट कर दिया गया।', topup });
    } else {
      const topup = memoryTopups.find((t) => t.requestId === id || t._id === id);
      if (topup) topup.status = 'Rejected';
      return res.status(200).json({ success: true, message: 'रीचार्ज रिजेक्ट कर दिया गया।' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get All Applications
router.get('/applications', async (req, res) => {
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

// 6. Update Application Status
router.put('/applications/:ackId/status', async (req, res) => {
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
      return res.status(200).json({ success: true, message: 'स्टेटस अपडेट हो गया!', application: app });
    } else {
      const app = memoryApps.get(ackId);
      if (!app) {
        return res.status(404).json({ success: false, message: 'आवेदन नहीं मिला।' });
      }
      app.status = status;
      return res.status(200).json({ success: true, message: 'स्टेटस अपडेट हो गया!', application: app });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

