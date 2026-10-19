import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-relay-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check / GET test
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ONLINE', service: 'Digital Solutions Email Relay (Vercel)' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Security token check
  const relaySecret = req.headers['x-relay-secret'];
  if (relaySecret !== 'digital_solutions_secret_email_relay_2026') {
    return res.status(401).json({ success: false, error: 'Unauthorized relay request' });
  }

  const { to, otp, purpose } = req.body || {};

  if (!to || !otp) {
    return res.status(400).json({ success: false, error: 'Missing to or otp' });
  }

  const cleanEmail = to.trim().toLowerCase();
  const emailUser = process.env.EMAIL_USER || 'digitalsolution130@gmail.com';
  const emailPass = (process.env.EMAIL_PASS || 'xhiidlfsadbdqrsp').replace(/\s+/g, '');

  const isReset = purpose === 'reset';
  const subjectTitle = isReset
    ? `🔐 Password Reset OTP: ${otp} | Digital Solutions Portal`
    : `🏛️ Your Verification OTP: ${otp} | Digital Solutions Portal`;

  const purposeHindi = isReset
    ? 'पासवर्ड रीसेट (Password Reset)'
    : 'नया नागरिक पंजीकरण (New Citizen Registration)';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-top: 6px solid #ff6b00; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
      <div style="background: #0a2540; padding: 22px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">🇮🇳 DIGITAL SOLUTIONS PORTAL</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">Common Service Centre (CSC) & Citizen E-Governance Services</p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">नमस्ते (Hello),</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.5;">
          डिजिटल जन सेवा पोर्टल में <strong>${purposeHindi}</strong> के लिए आपका वन-टाइम पासवर्ड (OTP) नीचे दिया गया है:
        </p>

        <div style="background: #fff8eb; border: 2px dashed #ff6b00; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 12px; color: #b45309; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Your 6-Digit Email OTP</span>
          <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0a2540; font-family: monospace;">${otp}</span>
          <span style="font-size: 12px; color: #64748b; display: block; margin-top: 6px;">यह OTP 10 मिनट के लिए मान्य है (Valid for 10 minutes)</span>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-bottom: 0; line-height: 1.5;">
          🔒 सुरक्षा सूचना: अपना OTP किसी के साथ साझा न करें। यदि आपने यह अनुरोध नहीं किया था, तो कृपया इस ईमेल को अनदेखा करें।
        </p>
      </div>

      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
        © 2026 Digital Solutions E-Governance Portal | All Rights Reserved.
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000
    });

    const info = await transporter.sendMail({
      from: `"Digital Solutions Portal" <${emailUser}>`,
      to: cleanEmail,
      subject: subjectTitle,
      html: htmlContent
    });

    console.log(`[Vercel Relay] OTP delivered to ${cleanEmail}: ${info.messageId}`);
    return res.status(200).json({ success: true, via: 'vercel_relay', messageId: info.messageId });
  } catch (error) {
    console.error('[Vercel Relay Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
