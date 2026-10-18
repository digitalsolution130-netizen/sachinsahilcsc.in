import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Digital Solutions Portal Backend',
    database: getDbStatus() ? 'Connected (MongoDB Atlas)' : 'Fallback Mode (Set MONGODB_URI in .env)',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' ? 'Configured' : 'Fallback Mode',
    email: process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' ? 'Configured (Nodemailer)' : 'Dev Console Mode',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Server & Connect Database
app.listen(PORT, async () => {
  console.log(`\n🚀 [Digital Solutions Server Running]`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
  await connectDB();
});

