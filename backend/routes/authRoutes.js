import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { sendOtpEmail } from '../config/email.js';
import { getDbStatus } from '../config/db.js';

const router = express.Router();

// In-memory fallback if MongoDB is not yet connected
const memoryUsers = new Map();
const memoryOtps = new Map();

// Helper to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 1. Send OTP to Email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'कृपया मान्य ईमेल पता (Valid Email) दर्ज करें।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in MongoDB if connected, otherwise in-memory
    if (getDbStatus()) {
      await Otp.deleteMany({ email: cleanEmail });
      await Otp.create({
        email: cleanEmail,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
    } else {
      memoryOtps.set(cleanEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    }

    // Send email via Nodemailer
    const emailResult = await sendOtpEmail(cleanEmail, otp);

    return res.status(200).json({
      success: true,
      message: `OTP ${cleanEmail} पर भेजा गया है। कृपया अपना इनबॉक्स / स्पैम फोल्डर चेक करें।`,
      devMode: emailResult.devMode,
      devOtp: emailResult.devMode ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: 'OTP भेजने में समस्या आई। पुनः प्रयास करें।' });
  }
});

// 2. Verify OTP & Login / Register
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'ईमेल और OTP दोनों आवश्यक हैं।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    let isMatch = false;

    if (getDbStatus()) {
      const record = await Otp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
      if (record && record.otp === cleanOtp && record.expiresAt > new Date()) {
        isMatch = true;
        await Otp.deleteOne({ _id: record._id });
      }
    } else {
      const record = memoryOtps.get(cleanEmail);
      if (record && record.otp === cleanOtp && record.expiresAt > Date.now()) {
        isMatch = true;
        memoryOtps.delete(cleanEmail);
      }
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'अमान्य अथवा समाप्त (Expired) OTP दर्ज किया गया है।' });
    }

    // Find or create User
    let user = null;
    const userName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];

    if (getDbStatus()) {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: userName,
          email: cleanEmail,
          walletBalance: 0,
          role: 'citizen'
        });
      }
    } else {
      if (!memoryUsers.has(cleanEmail)) {
        user = {
          _id: `mem_${Date.now()}`,
          name: userName,
          email: cleanEmail,
          walletBalance: 0,
          role: 'citizen'
        };
        memoryUsers.set(cleanEmail, user);
      } else {
        user = memoryUsers.get(cleanEmail);
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'digital_solutions_jwt_secret',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: `स्वागत है, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'सत्यापन में त्रुटि हुई।' });
  }
});

export default router;

