const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    receiptNumber: {
      type: String,
      required: [true, 'Receipt Number is required'],
      unique: true,
      index: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment reference is required']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    details: {
      type: mongoose.Schema.Types.Map,
      of: String,
      default: {}
    },
    issueDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
