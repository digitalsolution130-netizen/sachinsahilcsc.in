import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    ackId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    applicantName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    serviceName: {
      type: String,
      required: true
    },
    fee: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['UPI QR', 'Wallet'],
      default: 'UPI QR'
    },
    utr: {
      type: String,
      default: 'N/A'
    },
    documents: [
      {
        url: String,
        publicId: String,
        name: String,
        size: String,
        type: { type: String }
      }
    ],
    document: {
      url: String,
      publicId: String,
      name: String,
      size: String,
      type: { type: String }
    },
    remarks: {
      type: String,
      default: 'None'
    },
    status: {
      type: String,
      enum: [
        'Submitted / Processing',
        'Under Review',
        'Approved',
        'Completed',
        'Rejected'
      ],
      default: 'Submitted / Processing'
    }
  },
  { timestamps: true }
);

export const Application = mongoose.model('Application', applicationSchema);

