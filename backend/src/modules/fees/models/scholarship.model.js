const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Scholarship Name is required'],
      trim: true
    },
    eligibility: {
      type: String,
      trim: true,
      default: ''
    },
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
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

const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', scholarshipSchema);

module.exports = Scholarship;
