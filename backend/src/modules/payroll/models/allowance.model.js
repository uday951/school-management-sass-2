const mongoose = require('mongoose');

const allowanceSchema = new mongoose.Schema(
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
      required: [true, 'Allowance Type is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Allowance Date is required'],
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

const Allowance = mongoose.models.Allowance || mongoose.model('Allowance', allowanceSchema);

module.exports = Allowance;
