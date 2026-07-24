const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Discount Name is required'],
      trim: true
    },
    percentage: {
      type: Number,
      default: 0
    },
    fixedAmount: {
      type: Number,
      default: 0
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Discount = mongoose.models.Discount || mongoose.model('Discount', discountSchema);

module.exports = Discount;
