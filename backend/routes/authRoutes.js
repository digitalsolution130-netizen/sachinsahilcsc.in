import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { sendOtpEmail } from '../config/email.js';
import { getDbStatus } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'digital_solutions_jwt_secret_key_2026_secure';

// In-memory fallback if MongoDB Atlas is momentarily disconnected
const memoryUsers = new Map();
const memoryOtps = new Map();

// Helper to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper to hash password securely
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
};

// 1. REGISTRATION: Send OTP to Email (Check if already registered)
router.post('/register-send-otp', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'कृपया मान्य ईमेल पता (Valid Email) दर्ज करें।' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is already registered (Registration check)
    if (getDbStatus()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser && existingUser.password) {
        return res.status(400).json({
          success: false,
          message: 'यह ईमेल पहले से पंजीकृत है! कृपया अपने पासवर्ड से लॉगिन करें।'
        });
      }
    } else {
      if (memoryUsers.has(cleanEmail) && memoryUsers.get(cleanEmail).password) {
        return res.status(400).json({
          success: false,
          message: 'यह ईमेल पहले से पंजीकृत है! कृपया लॉगिन करें।'
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in MongoDB / Memory
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

    // Send email asynchronously in background for instantaneous (<50ms) response
    sendOtpEmail(cleanEmail, otp, 'registration')
      .then((emailRes) => {
        if (emailRes && emailRes.success) {
          console.log(`✅ [OTP Delivery] Registration OTP sent to ${cleanEmail}`);
        } else {
          console.error(`⚠️ [OTP Delivery Warning] ${cleanEmail}:`, emailRes?.error);
        }
      })
      .catch((err) => {
        console.error(`❌ [OTP Delivery Exception] ${cleanEmail}:`, err.message);
      });

    return res.status(200).json({
      success: true,
      message: `OTP आपके ईमेल (${cleanEmail}) पर भेज दिया गया है। कृपया अपना इनबॉक्स या स्पैम फोल्डर चेक करें।`
    });
  } catch (error) {
    console.error('Register send OTP error:', error);
    return res.status(500).json({ success: false, message: 'OTP भेजने में त्रुटि हुई।' });
  }
});

// 2. REGISTRATION: Verify OTP & Create Account with Password
router.post('/register-complete', async (req, res) => {
  try {
    const { name, email, phone, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'ईमेल, OTP और पासवर्ड अनिवार्य हैं।' });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' });
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

    const hashedPassword = hashPassword(password);
    const userName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];
    const userPhone = phone ? phone.trim() : '';

    let user = null;

    if (getDbStatus()) {
      user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.name = userName;
        user.phone = userPhone || user.phone;
        user.password = hashedPassword;
        await user.save();
      } else {
        user = await User.create({
          name: userName,
          email: cleanEmail,
          phone: userPhone,
          password: hashedPassword,
          walletBalance: 0,
          role: 'citizen'
        });
      }
    } else {
      user = {
        _id: `mem_${Date.now()}`,
        name: userName,
        email: cleanEmail,
        phone: userPhone,
        password: hashedPassword,
        walletBalance: 0,
        role: 'citizen'
      };
      memoryUsers.set(cleanEmail, user);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: `🎉 पंजीकरण सफल! स्वागत है, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register complete error:', error);
    return res.status(500).json({ success: false, message: 'पंजीकरण में त्रुटि हुई।' });
  }
});

// 3. CITIZEN LOGIN (Strict: Email + Password only, Non-registered users cannot login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let user = null;

    if (getDbStatus()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryUsers.get(cleanEmail);
    }

    // Strict requirement: "bina registration ke login na ho"
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '❌ यह ईमेल पोर्टल पर पंजीकृत नहीं है! कृपया पहले नया पंजीकरण (Registration) करें।'
      });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'आपने पासवर्ड सेट नहीं किया है। कृपया "पासवर्ड भूल गए?" पर क्लिक करके अपना पासवर्ड बनाएं।'
      });
    }

    // Compare hashed password
    const hashedAttempt = hashPassword(cleanPassword);
    const isPasswordCorrect = (user.password === hashedAttempt) || (user.password === cleanPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: '❌ गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें अथवा "पासवर्ड भूल गए?" पर क्लिक करें।'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: `🎉 स्वागत है, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'लॉगिन के दौरान सर्वर त्रुटि हुई।' });
  }
});

// 4. FORGOT PASSWORD: Send Reset OTP (Only for registered users)
router.post('/forgot-password-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'कृपया मान्य ईमेल पता दर्ज करें।' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify user exists
    let userExists = false;
    if (getDbStatus()) {
      const u = await User.findOne({ email: cleanEmail });
      userExists = !!u;
    } else {
      userExists = memoryUsers.has(cleanEmail);
    }

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: '❌ यह ईमेल पंजीकृत नहीं है। कृपया पहले नया पंजीकरण करें।'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

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

    // Send email asynchronously in background for instantaneous (<50ms) response
    sendOtpEmail(cleanEmail, otp, 'reset')
      .then((emailRes) => {
        if (emailRes && emailRes.success) {
          console.log(`✅ [Reset OTP Delivery] Reset OTP sent to ${cleanEmail}`);
        } else {
          console.error(`⚠️ [Reset OTP Delivery Warning] ${cleanEmail}:`, emailRes?.error);
        }
      })
      .catch((err) => {
        console.error(`❌ [Reset OTP Delivery Exception] ${cleanEmail}:`, err.message);
      });

    return res.status(200).json({
      success: true,
      message: `पासवर्ड रीसेट OTP आपके ईमेल (${cleanEmail}) पर भेज दिया गया है। कृपया अपना इनबॉक्स चेक करें।`
    });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    return res.status(500).json({ success: false, message: 'OTP भेजने में त्रुटि हुई।' });
  }
});

// 5. RESET PASSWORD: Verify Reset OTP & Update Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'ईमेल, OTP और नया पासवर्ड आवश्यक हैं।' });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' });
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
      return res.status(400).json({ success: false, message: 'अमान्य अथवा समाप्त OTP दर्ज किया गया है।' });
    }

    const hashedPassword = hashPassword(newPassword);

    if (getDbStatus()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: 'उपयोगकर्ता नहीं मिला।' });
      }
      user.password = hashedPassword;
      await user.save();
    } else {
      const user = memoryUsers.get(cleanEmail);
      if (user) {
        user.password = hashedPassword;
      }
    }

    return res.status(200).json({
      success: true,
      message: '✅ पासवर्ड सफलतापूर्वक अपडेट हो गया! अब आप अपने नए पासवर्ड से लॉगिन कर सकते हैं।'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'पासवर्ड रीसेट करने में त्रुटि हुई।' });
  }
});

// Legacy backwards compatibility routes
router.post('/send-otp', async (req, res) => {
  return res.redirect(307, '/api/auth/register-send-otp');
});

router.post('/verify-otp', async (req, res) => {
  return res.redirect(307, '/api/auth/register-complete');
});

export default router;
