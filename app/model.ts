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

const UserTokenSchema = new Schema({
  userEmail: { type: String, unique: true },
  accessToken: String,
  refreshToken: String,
  expires: Date,
});
export const UserToken = models.UserToken || mongoose.model("UserToken", UserTokenSchema);


export const Claim = models.Claim || mongoose.model('Claim', ClaimSchema);

export const EmailLog = models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
