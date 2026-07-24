const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: [true, 'Fee structure reference is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required']
    },
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount'
    },
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship'
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    scholarshipAmount: {
      type: Number,
      default: 0
    },
    fineAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required']
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      required: [true, 'Pending amount is required']
    },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const StudentFee = mongoose.models.StudentFee || mongoose.model('StudentFee', studentFeeSchema);

module.exports = StudentFee;
