import express from 'express';
import { Application } from '../models/Application.js';
import { User } from '../models/User.js';
import { upload, uploadToCloudinary } from '../config/cloudinary.js';
import { getDbStatus } from '../config/db.js';
import { memoryBalances } from './walletRoutes.js';

const router = express.Router();

const memoryApps = new Map();

// 1. Submit Application
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const {
      applicantName,
      email,
      phone,
      serviceName,
      fee,
      paymentMethod,
      utr,
      remarks,
      documentDataUrl,
      documentName
    } = req.body;

    if (!applicantName || !email || !serviceName) {
      return res.status(400).json({ success: false, message: 'आवेदक का नाम, ईमेल और सेवा अनिवार्य हैं।' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFee = Number(fee) || 0;
    const cleanPaymentMethod = paymentMethod === 'Wallet' ? 'Wallet' : 'UPI QR';
    const cleanUtr = utr ? utr.trim() : (cleanPaymentMethod === 'Wallet' ? 'WALLET-DEBIT' : 'N/A');

    // Handle document upload: either from req.file or from documentDataUrl (e.g. Webcam)
    let docObj = null;

    if (req.file) {
      docObj = await uploadToCloudinary(req.file);
    } else if (documentDataUrl) {
      docObj = {
        url: documentDataUrl,
        publicId: `webcam_${Date.now()}`,
        name: documentName || 'camera_photo.jpg',
        size: `${Math.round((documentDataUrl.length * 3) / 4 / 1024)} KB`,
        type: 'image/jpeg'
      };
    }

    const ackId = `DSK-${Math.floor(100000 + Math.random() * 900000)}`;

    let newApp = null;
    let remainingBalance = 0;

    if (getDbStatus()) {
      // If paying via wallet, check & deduct balance
      if (cleanPaymentMethod === 'Wallet') {
        const user = await User.findOne({ email: cleanEmail });
        if (!user || user.walletBalance < cleanFee) {
          return res.status(400).json({ success: false, message: 'वॉलेट में पर्याप्त बैलेंस नहीं है।' });
        }
        user.walletBalance = Math.max(0, user.walletBalance - cleanFee);
        await user.save();
        remainingBalance = user.walletBalance;
      } else {
        const user = await User.findOne({ email: cleanEmail });
        remainingBalance = user ? user.walletBalance : 0;
      }

      newApp = await Application.create({
        ackId,
        applicantName: applicantName.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        serviceName,
        fee: cleanFee,
        paymentMethod: cleanPaymentMethod,
        utr: cleanUtr,
        document: docObj,
        remarks: remarks ? remarks.trim() : 'None',
        status: 'Submitted / Processing'
      });
    } else {
      // In-memory fallback
      if (cleanPaymentMethod === 'Wallet') {
        const currentBal = memoryBalances.get(cleanEmail) || 0;
        if (currentBal < cleanFee) {
          return res.status(400).json({ success: false, message: 'वॉलेट में पर्याप्त बैलेंस नहीं है।' });
        }
        remainingBalance = currentBal - cleanFee;
        memoryBalances.set(cleanEmail, remainingBalance);
      } else {
        remainingBalance = memoryBalances.get(cleanEmail) || 0;
      }

      newApp = {
        _id: `mem_app_${Date.now()}`,
        ackId,
        applicantName: applicantName.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        serviceName,
        fee: cleanFee,
        paymentMethod: cleanPaymentMethod,
        utr: cleanUtr,
        document: docObj,
        remarks: remarks ? remarks.trim() : 'None',
        status: 'Submitted / Processing',
        createdAt: new Date()
      };
      memoryApps.set(ackId, newApp);
    }

    return res.status(201).json({
      success: true,
      message: 'आवेदन सफलतापूर्वक सबमिट हो गया!',
      application: newApp,
      remainingBalance
    });
  } catch (error) {
    console.error('Application submit error:', error);
    return res.status(500).json({ success: false, message: 'आवेदन सबमिट करने में सर्वर त्रुटि हुई।' });
  }
});

// 2. Track Application by Acknowledgment ID
router.get('/track/:ackId', async (req, res) => {
  try {
    const cleanAck = req.params.ackId.trim();

    if (getDbStatus()) {
      const app = await Application.findOne({ ackId: cleanAck });
      if (!app) {
        return res.status(404).json({ success: false, message: 'कोई आवेदन नहीं मिला।' });
      }
      return res.status(200).json({ success: true, application: app });
    } else {
      const app = memoryApps.get(cleanAck);
      if (!app) {
        return res.status(404).json({ success: false, message: 'कोई आवेदन नहीं मिला।' });
      }
      return res.status(200).json({ success: true, application: app });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'ट्रैकिंग में त्रुटि हुई।' });
  }
});

export { memoryApps };
export default router;

