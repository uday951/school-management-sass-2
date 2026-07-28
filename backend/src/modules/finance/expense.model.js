const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    expenseName: {
      type: String,
      required: [true, 'Expense Name is required'],
      trim: true
    },
    vendor: {
      type: String,
      required: [true, 'Vendor Name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number']
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    billUrl: {
      type: String,
      default: null
    },
    billPublicId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.index({ tenantId: 1, date: -1 });
expenseSchema.index({ tenantId: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
