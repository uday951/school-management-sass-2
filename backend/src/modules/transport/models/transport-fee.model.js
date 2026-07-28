const mongoose = require('mongoose');

const transportFeeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      unique: true,
      index: true
    },
    monthlyFee: {
      type: Number,
      default: 0
    },
    quarterlyFee: {
      type: Number,
      default: 0
    },
    yearlyFee: {
      type: Number,
      default: 0
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'partial'],
      default: 'unpaid'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

transportFeeSchema.index({ isDeleted: 1, studentId: 1 });

const TransportFee = mongoose.models.TransportFee || mongoose.model('TransportFee', transportFeeSchema);

module.exports = TransportFee;
