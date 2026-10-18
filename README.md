# 🏛️ Digital Solutions Portal (MERN Stack)
### Jan Seva & E-District Citizen E-Governance Services

A complete, production-grade citizen service portal built with the **MERN Stack** (React + Node.js + Express + MongoDB).

---

## 🌟 Frontend Features Implemented

1. **🇮🇳 Official Government Branding & Header**:
   - National emblem, authorized CSC center badge, running news marquee ticker, helpline phone (`0130-7966590`) and official email (`digitalsolution130@gmail.com`).

2. **🔐 Citizen Access (Auth System)**:
   - **Login (OTP)**: Enter 10-digit mobile number, generate & auto-fill 6-digit OTP, instant verification.
   - **New Registration**: Full name & 10-digit WhatsApp contact.
   - Active session persistence using localStorage (prepared for JWT / MongoDB backend).

3. **💰 Digital Wallet & PhonePe QR Top-Up**:
   - Real-time wallet balance display.
   - Authentic **PhonePe QR Card** (with UPI ID `Q141422457@ybl`, copy button, and BHIM UPI branding).
   - Direct 12-digit UTR / UPI transaction submission form for admin credit approval.
   - Large QR scanner popup modal.

4. **🔎 Live Application Tracking**:
   - Instant search by Acknowledgment Number (e.g. `DSK-842911`).
   - Detailed status cards with applicant name, service, date, and admin remarks.

5. **📌 18 Active E-Governance Services**:
   - Voter ID Card Download (₹100)
   - Lost ID Card Search & Download (₹500)
   - Ration Card Download (₹100)
   - Find Linked PAN Card Number (₹150)
   - Family ID Download (Without OTP) (₹50)
   - Passport Application Service (₹250)
   - Income Certificate (₹100)
   - Caste Certificate (₹100)
   - EWS Certificate (₹100)
   - Water Bill Payment & Receipt (₹10)
   - Electricity Bill Payment (₹10)
   - Senior Citizen Card Apply (₹50)
   - PVC Smart Card Order (₹100)
   - Lost PAN Card Find (₹100)
   - Farmer ID Download (₹150)
   - RC Print / Download (₹150)
   - Driving Licence (DL) Print (₹100)
   - Voter ID Mobile Link (₹100)

6. **📝 Service Application Form**:
   - Automatic pre-fill of citizen details.
   - **📷 Live Camera Integration**: Captures real-time photo/document snapshots from webcam.
   - **📁 File & PDF Upload**: Document chooser with live preview thumbnail and removal option.
   - Dynamic service fee calculation and wallet balance check.
   - Confetti celebration on successful submission.

7. **📥 Official Acknowledgment Receipt**:
   - Formatted receipt slip with acknowledgment number, date, fees, and processing status.
   - **Download Official PDF Receipt** (high-resolution PDF using `jspdf` & `html2canvas`).
   - **Print Slip** styling with print-specific CSS.

8. **🛡️ Admin Control Panel (Password: `admin123`)**:
   - Overview metrics: Total Applications, Pending UTRs, Wallet Requests, System Status.
   - **Pending Wallet Top-Up Table**: Approve (instantly credits citizen's wallet) or Reject top-up requests.
   - **All Citizen Applications Table**: Real-time status updater (`Submitted / Processing`, `Under Review`, `Approved`, `Completed`, `Rejected`) and document viewer.

---

## 🚀 How to Run Frontend

From the project root (`e:\project1`):
```bash
npm run dev
```

Or navigate to `frontend`:
```bash
cd frontend
npm run dev
```

The app will start on: **`http://localhost:5173`**

---

## 📁 Project Structure

```
e:\project1\
  ├── package.json
  ├── README.md
  └── frontend/
      ├── index.html
      ├── package.json
      ├── vite.config.js
      └── src/
          ├── main.jsx
          ├── App.jsx
          ├── App.css
          ├── index.css
          ├── data/
          │   └── servicesData.js
          ├── services/
          │   └── storageService.js
          └── components/
              ├── TopStrip.jsx
              ├── MarqueeNotice.jsx
              ├── Navbar.jsx
              ├── AuthSection.jsx
              ├── WalletSection.jsx
              ├── PhonePeCard.jsx
              ├── TrackStatus.jsx
              ├── ServicesGrid.jsx
              ├── ApplicationForm.jsx
              ├── AcknowledgmentSlip.jsx
              ├── AdminPanel.jsx
              ├── CameraModal.jsx
              ├── EnlargedQRModal.jsx
              ├── AdminLoginModal.jsx
              ├── ToastContainer.jsx
              └── Footer.jsx
```

