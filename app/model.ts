import mongoose, { Schema, models } from 'mongoose';

const EmailLogSchema = new Schema({
  messageId: String,
  sender: String,
  subject: String,
  preview: String,
  time: String,
  claimNumber: String,
  status: {
    type: String,
    enum: ['success', 'manual', 'error'],
    default: 'manual',
  },
  error: String,
}, { timestamps: true });

export const EmailLog = models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
