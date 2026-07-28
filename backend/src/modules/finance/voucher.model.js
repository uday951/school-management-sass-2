const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    voucherType: {
      type: String,
      required: [true, 'Voucher Type is required'],
      enum: ['payment', 'receipt', 'journal'],
      index: true
    },
    voucherNumber: {
      type: String,
      required: [true, 'Voucher Number is required'],
      trim: true,
      uppercase: true
    },
    payeeOrReceivedFrom: {
      type: String,
      trim: true,
      default: ''
    },
    debitAccount: {
      type: String,
      trim: true,
      default: ''
    },
    creditAccount: {
      type: String,
      trim: true,
      default: ''
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

voucherSchema.index({ tenantId: 1, voucherNumber: 1 }, { unique: true });

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
