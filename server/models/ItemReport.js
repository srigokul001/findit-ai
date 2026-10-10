const mongoose = require('mongoose');

const itemReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportType: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'ID Cards',
        'Wallets',
        'Bags',
        'Keys',
        'Books',
        'Accessories',
        'Clothing',
        'Other',
      ],
      required: [true, 'Category is required'],
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    reportDate: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true,
      index: true,
    },
    specificLocation: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    // Sensitive / private details (e.g. serial numbers, wallpaper, secret marks)
    // Redacted in public listings unless requester is reporter or authorized admin
    identifyingDetails: {
      type: String,
      trim: true,
      default: '',
    },
    contactPreference: {
      type: String,
      enum: ['email', 'phone', 'in-app'],
      default: 'in-app',
    },
    storageLocation: {
      type: String,
      trim: true,
      default: 'With Finder',
    },
    status: {
      type: String,
      enum: ['OPEN', 'PENDING_CLAIM', 'RETURNED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching & matching
itemReportSchema.index({ itemName: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('ItemReport', itemReportSchema);
