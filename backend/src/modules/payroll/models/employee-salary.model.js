const mongoose = require('mongoose');

const employeeSalarySchema = new mongoose.Schema(
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
      unique: true,
      index: true
    },
    salaryStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: [true, 'Salary Structure ID is required']
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },
    allowances: [
      {
        componentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryComponent' },
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ],
    deductions: [
      {
        componentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryComponent' },
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ],
    netSalary: {
      type: Number,
      required: true,
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

const EmployeeSalary = mongoose.models.EmployeeSalary || mongoose.model('EmployeeSalary', employeeSalarySchema);

module.exports = EmployeeSalary;
