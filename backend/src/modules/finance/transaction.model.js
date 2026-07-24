const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    type: {
      type: String,
      required: true,
      enum: ['debit', 'credit'],
      default: 'debit'
    },
    debitAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    creditAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    ledgerAccount: {
      type: String,
      required: [true, 'Ledger Account is required'],
      trim: true
    },
    reference: {
      type: String,
      required: [true, 'Reference string is required'],
      trim: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ tenantId: 1, date: -1 });
transactionSchema.index({ tenantId: 1, ledgerAccount: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
