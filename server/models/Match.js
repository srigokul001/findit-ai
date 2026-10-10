const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: true,
      index: true,
    },
    foundReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    breakdown: {
      categoryScore: { type: Number, default: 0 },
      nameBrandScore: { type: Number, default: 0 },
      colorScore: { type: Number, default: 0 },
      descriptionScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      dateScore: { type: Number, default: 0 },
    },
    matchingReasons: {
      type: [String],
      default: [],
    },
    differences: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['POTENTIAL', 'CONFIRMED_MATCH', 'DISMISSED', 'RESOLVED'],
      default: 'POTENTIAL',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per pair
matchSchema.index({ lostReportId: 1, foundReportId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
