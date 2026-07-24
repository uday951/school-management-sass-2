const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true
    },
    campus: {
      type: String,
      default: 'Main Campus'
    },
    class: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeCategory',
      required: [true, 'Category reference is required']
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    lateFee: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure', feeStructureSchema);

module.exports = FeeStructure;
