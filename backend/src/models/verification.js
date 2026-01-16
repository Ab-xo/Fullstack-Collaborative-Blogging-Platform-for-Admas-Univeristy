import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email-verification', 'password-reset', 'account-approval'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1h' } // Auto delete after 1 hour
  }
}, {
  timestamps: true
});

export default mongoose.model('Verification', verificationSchema);