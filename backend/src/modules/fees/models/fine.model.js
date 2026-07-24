const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Fine Rule Name is required'],
      trim: true
    },
    fineRules: {
      type: String,
      trim: true,
      default: ''
    },
    lateFee: {
      type: Number,
      required: [true, 'Late fee amount is required']
    },
    gracePeriod: {
      type: Number,
      default: 0 // In days
    },
    penaltyAmount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Fine = mongoose.models.Fine || mongoose.model('Fine', fineSchema);

module.exports = Fine;
