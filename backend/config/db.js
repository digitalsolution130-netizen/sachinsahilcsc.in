import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URL || process.env.MONGODB_URI;

  if (!uri || uri.includes('username:password')) {
    console.warn('\n⚠️ [MongoDB Atlas] Database URI is not configured yet in backend/.env');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'digital_solutions'
    });
    isConnected = true;
    console.log(`\n🎉 ✅ [MongoDB Atlas Connected Successfully!]`);
    console.log(`📦 Database Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ [MongoDB Atlas Connection Error]: ${error.message}\n`);
    isConnected = false;
    return false;
  }
};

export const getDbStatus = () => isConnected;
