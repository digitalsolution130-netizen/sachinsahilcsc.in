import express from 'express';
import { Topup } from '../models/Topup.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { getDbStatus } from '../config/db.js';

const router = express.Router();

const memoryTopups = [];
const memoryBalances = new Map();

// 1. Submit Top-up Request
router.post('/topup', async (req, res) => {
  try {
    const { email, amount, utr } = req.body;

    const numAmount = Number(amount);
    if (!email || !numAmount || numAmount < 10) {
      return res.status(400).json({ success: false, message: 'कम से कम ₹10 का अमाउंट होना चाहिए।' });
    }
    if (!utr || utr.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'कृपया सही 12-अंकों का UTR नंबर दर्ज करें।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUtr = utr.trim();
    const requestId = `TOP-${Math.floor(1000 + Math.random() * 9000)}`;

    if (getDbStatus()) {
      // Ensure user document exists or prepare it
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          walletBalance: 0,
          role: 'citizen'
        });
      }

      const newTopup = await Topup.create({
        requestId,
        userEmail: cleanEmail,
        amount: numAmount,
        utr: cleanUtr,
        status: 'Pending'
      });
      return res.status(201).json({ success: true, message: 'रीचार्ज रिक्वेस्ट दर्ज हो गई।', topup: newTopup });
    } else {
      const topup = {
        _id: `mem_top_${Date.now()}`,
        requestId,
        userEmail: cleanEmail,
        amount: numAmount,
        utr: cleanUtr,
        status: 'Pending',
        createdAt: new Date()
      };
      memoryTopups.unshift(topup);
      return res.status(201).json({ success: true, message: 'रीचार्ज रिक्वेस्ट दर्ज हो गई।', topup });
    }
  } catch (error) {
    console.error('Wallet topup error:', error);
    return res.status(500).json({ success: false, message: 'वॉलेट रीचार्ज में त्रुटि हुई।' });
  }
});

// 2. Get User Balance
router.get('/balance/:email', async (req, res) => {
  try {
    if (!req.params.email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }
    const cleanEmail = req.params.email.trim().toLowerCase();

    if (getDbStatus()) {
      const user = await User.findOne({ email: cleanEmail });
      return res.status(200).json({ 
        success: true, 
        balance: user ? Number(user.walletBalance || 0) : 0,
        email: cleanEmail
      });
    } else {
      const bal = memoryBalances.get(cleanEmail) || 0;
      return res.status(200).json({ success: true, balance: bal, email: cleanEmail });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'बैलेंस प्राप्त करने में समस्या।' });
  }
});

// 3. Get User Transaction History (Credits & Debits)
router.get('/history/:email', async (req, res) => {
  try {
    const cleanEmail = req.params.email.trim().toLowerCase();

    if (getDbStatus()) {
      const topups = await Topup.find({ userEmail: cleanEmail }).sort({ createdAt: -1 });
      const walletApps = await Application.find({ 
        email: cleanEmail, 
        paymentMethod: 'Wallet' 
      }).sort({ createdAt: -1 });

      const transactions = [
        ...topups.map((t) => ({
          id: t.requestId,
          type: 'credit',
          amount: t.amount,
          title: `वॉलेट रीचार्ज (${t.status})`,
          status: t.status,
          utr: t.utr,
          date: t.createdAt
        })),
        ...walletApps.map((a) => ({
          id: a.ackId,
          type: 'debit',
          amount: a.fee,
          title: `सेवा शुल्क भुगतान: ${a.serviceName}`,
          status: 'Debited',
          utr: a.utr,
          date: a.createdAt
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.status(200).json({ success: true, transactions });
    } else {
      return res.status(200).json({ success: true, transactions: [] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export { memoryTopups, memoryBalances };
export default router;
