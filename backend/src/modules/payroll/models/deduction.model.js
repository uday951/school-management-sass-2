const mongoose = require('mongoose');

const deductionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0
    },
    type: {
      type: String,
      required: [true, 'Deduction Type is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Deduction Date is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'processed'],
      default: 'pending',
      index: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

const Deduction = mongoose.models.Deduction || mongoose.model('Deduction', deductionSchema);

module.exports = Deduction;
