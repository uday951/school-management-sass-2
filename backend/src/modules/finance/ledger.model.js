const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    accountName: {
      type: String,
      required: [true, 'Account Name is required'],
      trim: true
    },
    accountType: {
      type: String,
      required: [true, 'Account Type is required'],
      enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
      default: 'Asset'
    },
    openingBalance: {
      type: Number,
      required: [true, 'Opening Balance is required'],
      default: 0
    },
    currentBalance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

ledgerSchema.index({ tenantId: 1, accountName: 1 }, { unique: true });

const Ledger = mongoose.model('Ledger', ledgerSchema);

module.exports = Ledger;
