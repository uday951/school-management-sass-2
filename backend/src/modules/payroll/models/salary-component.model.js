const mongoose = require('mongoose');

const salaryComponentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    name: {
      type: String,
      required: [true, 'Salary Component Name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['earning', 'deduction'],
      required: [true, 'Salary Component Type is required']
    },
    calculationType: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: [true, 'Calculation Type is required']
    },
    value: {
      type: Number,
      required: [true, 'Component value is required'],
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

const SalaryComponent = mongoose.models.SalaryComponent || mongoose.model('SalaryComponent', salaryComponentSchema);

module.exports = SalaryComponent;
