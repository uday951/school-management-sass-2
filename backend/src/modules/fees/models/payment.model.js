const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    studentFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentFee',
      required: [true, 'Student Fee mapping reference is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required']
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer'],
      required: [true, 'Payment method is required']
    },
    transactionId: {
      type: String,
      trim: true,
      default: ''
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    collectedBy: {
      type: String,
      default: 'Admin'
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success'
    }
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

module.exports = Payment;
