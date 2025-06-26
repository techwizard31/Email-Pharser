import mongoose, { Schema, models } from 'mongoose';

const EmailLogSchema = new Schema({
  messageId: { type: String, unique: true },
  sender: String,
  subject: String,
  preview: String, // Body or first few lines
  time: String,
  claimNumber: String,
  status: {
    type: String,
    enum: ['success', 'manual', 'error'],
    default: 'manual'
  },
  error: String
}, { timestamps: true });

const ClaimSchema = new Schema({
  claimNumber: { type: String, unique: true, required: true },
  name: String,
  status: String,
  updatedAt: Date,
}, { timestamps: true });

export const Claim = models.Claim || mongoose.model('Claim', ClaimSchema);

export const EmailLog = models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
