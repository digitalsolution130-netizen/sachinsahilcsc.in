import mongoose from 'mongoose';

const topupSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 10
    },
    utr: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

export const Topup = mongoose.model('Topup', topupSchema);

