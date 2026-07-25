const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    name: {
      type: String,
      required: [true, 'Salary Structure Name is required'],
      trim: true
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic Salary is required'],
      min: 0
    },
    hra: {
      type: Number,
      default: 0,
      min: 0
    },
    da: {
      type: Number,
      default: 0,
      min: 0
    },
    medicalAllowance: {
      type: Number,
      default: 0,
      min: 0
    },
    transportAllowance: {
      type: Number,
      default: 0,
      min: 0
    },
    otherAllowances: {
      type: Number,
      default: 0,
      min: 0
    },
    grossSalary: {
      type: Number,
      required: [true, 'Gross Salary is required'],
      min: 0
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective Date is required']
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

const SalaryStructure = mongoose.models.SalaryStructure || mongoose.model('SalaryStructure', salaryStructureSchema);

module.exports = SalaryStructure;
