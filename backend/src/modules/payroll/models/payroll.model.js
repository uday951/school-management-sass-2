const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    month: {
      type: Number,
      required: [true, 'Payroll Month is required'],
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: [true, 'Payroll Year is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid'],
      default: 'pending',
      index: true
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    totalDeductions: {
      type: Number,
      default: 0
    },
    totalBonuses: {
      type: Number,
      default: 0
    },
    totalAllowances: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      default: 0
    },
    processedDate: {
      type: Date
    },
    approvedBy: {
      type: String
    },
    approvedDate: {
      type: Date
    },
    paymentDate: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

payrollSchema.index({ month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);

module.exports = Payroll;
