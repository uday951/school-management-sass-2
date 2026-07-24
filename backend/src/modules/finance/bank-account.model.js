const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    bankName: {
      type: String,
      required: [true, 'Bank Name is required'],
      trim: true
    },
    accountHolder: {
      type: String,
      required: [true, 'Account Holder Name is required'],
      trim: true
    },
    accountNumber: {
      type: String,
      required: [true, 'Account Number is required'],
      trim: true
    },
    ifscBranch: {
      type: String,
      required: [true, 'IFSC / Branch code is required'],
      trim: true,
      uppercase: true
    },
    balance: {
      type: Number,
      required: [true, 'Current Balance is required'],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

bankAccountSchema.index({ tenantId: 1, accountNumber: 1 }, { unique: true });

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
