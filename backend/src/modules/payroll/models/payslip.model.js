const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    payrollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payroll',
      required: true,
      index: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true
    },
    employeeId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    department: {
      type: String,
      default: 'N/A'
    },
    designation: {
      type: String,
      default: 'N/A'
    },
    workingDays: {
      type: Number,
      default: 0
    },
    presentDays: {
      type: Number,
      default: 0
    },
    absentDays: {
      type: Number,
      default: 0
    },
    lateDays: {
      type: Number,
      default: 0
    },
    leaveDays: {
      type: Number,
      default: 0
    },
    basicSalary: {
      type: Number,
      default: 0
    },
    hra: {
      type: Number,
      default: 0
    },
    da: {
      type: Number,
      default: 0
    },
    medicalAllowance: {
      type: Number,
      default: 0
    },
    transportAllowance: {
      type: Number,
      default: 0
    },
    otherAllowances: {
      type: Number,
      default: 0
    },
    allowancesAmount: {
      type: Number,
      default: 0
    },
    bonusesAmount: {
      type: Number,
      default: 0
    },
    deductionsAmount: {
      type: Number,
      default: 0
    },
    pf: {
      type: Number,
      default: 0
    },
    esi: {
      type: Number,
      default: 0
    },
    profTax: {
      type: Number,
      default: 0
    },
    incomeTax: {
      type: Number,
      default: 0
    },
    leaveDeduction: {
      type: Number,
      default: 0
    },
    grossSalary: {
      type: Number,
      default: 0
    },
    netSalary: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'cheque'],
      default: 'bank_transfer'
    },
    paymentDate: {
      type: Date
    }
  },
  { timestamps: true }
);

payslipSchema.index({ payrollId: 1, teacherId: 1 }, { unique: true });

const Payslip = mongoose.models.Payslip || mongoose.model('Payslip', payslipSchema);

module.exports = Payslip;
