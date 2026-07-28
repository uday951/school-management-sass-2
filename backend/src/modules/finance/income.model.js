const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    source: {
      type: String,
      required: [true, 'Income Source is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number']
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    receiptUrl: {
      type: String,
      default: null
    },
    receiptPublicId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

incomeSchema.index({ tenantId: 1, date: -1 });
incomeSchema.index({ tenantId: 1, category: 1 });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
