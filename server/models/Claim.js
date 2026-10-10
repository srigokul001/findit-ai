const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: true,
      index: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Sensitive verification details - ONLY accessible to claimant and authorized admin / reviewer
    privateVerificationDetails: {
      type: String,
      required: [true, 'Private verification details are required to verify ownership'],
      trim: true,
    },
    contactInfo: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    claimReason: {
      type: String,
      trim: true,
      default: '',
    },
    proofImageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);
