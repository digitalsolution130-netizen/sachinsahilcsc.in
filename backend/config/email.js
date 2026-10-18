import nodemailer from 'nodemailer';

export const sendOtpEmail = async (toEmail, otp) => {
  const cleanEmail = toEmail.trim().toLowerCase();

  // 1. Check if Resend API Key is provided
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
    try {
      console.log(`📡 [Email Sending via Resend API] to ${cleanEmail}...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Digital Solutions Portal <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: `🏛️ Your Verification OTP: ${otp} | Digital Solutions Portal`,
          html: getEmailHtml(otp)
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ [Resend] OTP email successfully delivered to ${cleanEmail}! ID:`, data.id);
        return { success: true, devMode: false };
      } else {
        console.warn(`⚠️ [Resend Error]:`, data.message);
      }
    } catch (err) {
      console.error(`❌ [Resend Exception]:`, err.message);
    }
  }

  // 2. Check if Gmail / SMTP Credentials are provided
  const isGmailConfigured = 
    process.env.EMAIL_USER && 
    process.env.EMAIL_USER !== 'your_email@gmail.com' &&
    process.env.EMAIL_PASS && 
    process.env.EMAIL_PASS !== 'your_gmail_app_password';

  if (isGmailConfigured) {
    try {
      console.log(`📡 [Email Sending via Gmail/Nodemailer] to ${cleanEmail}...`);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s+/g, '') // remove spaces if pasted like abcd efgh ijkl mnop
        }
      });

      const mailOptions = {
        from: `"Digital Solutions Portal" <${process.env.EMAIL_USER}>`,
        to: cleanEmail,
        subject: `🏛️ Your Verification OTP: ${otp} | Digital Solutions Portal`,
        html: getEmailHtml(otp)
      };

      await transporter.sendMail(mailOptions);
      console.log(`\n🎉 ✅ [Nodemailer] Real OTP email successfully delivered to inbox: ${cleanEmail}\n`);
      return { success: true, devMode: false };
    } catch (error) {
      console.error(`❌ [Gmail Nodemailer Error]:`, error.message);
      console.log(`📢 [FALLBACK OTP FOR TESTING] ${cleanEmail} -> [ ${otp} ]`);
      return { success: true, devMode: true, otp, error: error.message };
    }
  }

  // 3. Fallback: If neither is configured yet, log OTP in console & return test OTP
  console.log(`\n===============================================================`);
  console.log(`📢 [EMAIL OTP NOT CONFIGURED YET IN .ENV]`);
  console.log(`👉 To send real emails to inbox for FREE, provide either:`);
  console.log(`   1) Free Gmail App Password: EMAIL_USER & EMAIL_PASS in backend/.env`);
  console.log(`   2) Free Resend API Key: RESEND_API_KEY in backend/.env`);
  console.log(`🔑 SIMULATED OTP FOR [ ${cleanEmail} ] IS: [ ${otp} ]`);
  console.log(`===============================================================\n`);

  return { success: true, devMode: true, otp };
};

function getEmailHtml(otp) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-top: 6px solid #ff6b00; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
      <div style="background: #0a2540; padding: 22px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">🇮🇳 DIGITAL SOLUTIONS PORTAL</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">Common Service Centre (CSC) & Citizen E-Governance Services</p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">नमस्ते (Hello),</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.5;">
          डिजिटल जन सेवा पोर्टल में सुरक्षित लॉगिन / नए नागरिक पंजीकरण के लिए आपका वन-टाइम पासवर्ड (OTP) नीचे दिया गया है:
        </p>

        <div style="background: #fff8eb; border: 2px dashed #ff6b00; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 12px; color: #b45309; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Your 6-Digit Email OTP</span>
          <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0a2540; font-family: monospace;">${otp}</span>
          <span style="font-size: 12px; color: #64748b; display: block; margin-top: 6px;">यह OTP 10 मिनट के लिए मान्य है (Valid for 10 minutes)</span>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          ⚠️ <strong>सुरक्षा सूचना:</strong> इस OTP को किसी के साथ साझा न करें। डिजिटल सेवा केंद्र पोर्टल कभी भी आपसे पासवर्ड या OTP नहीं मांगता।
        </p>
      </div>

      <div style="background: #f8fafc; padding: 14px 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        📞 Helpline: 0130-7966590 | ✉️ Support: digitalsolution130@gmail.com<br>
        © 2026 Digital Solutions Portal • Authorized CSC Jan Seva Kendra
      </div>
    </div>
  `;
}
