import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      default: ''
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    role: {
      type: String,
      enum: ['citizen', 'admin'],
      default: 'citizen'
    }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);

