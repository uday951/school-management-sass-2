const { body, param } = require('express-validator');

// Income Validators
const createIncomeRules = [
  body('source').trim().notEmpty().withMessage('Income Source is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('date').trim().notEmpty().withMessage('Date is required')
];

const updateIncomeRules = [
  param('id').isMongoId().withMessage('Invalid Income ID'),
  body('source').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('date').optional().trim().notEmpty()
];

// Expense Validators
const createExpenseRules = [
  body('expenseName').trim().notEmpty().withMessage('Expense Name is required'),
  body('vendor').trim().notEmpty().withMessage('Vendor is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('date').trim().notEmpty().withMessage('Date is required')
];

const updateExpenseRules = [
  param('id').isMongoId().withMessage('Invalid Expense ID'),
  body('expenseName').optional().trim().notEmpty(),
  body('vendor').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('date').optional().trim().notEmpty()
];

// Ledger Validators
const createLedgerRules = [
  body('accountName').trim().notEmpty().withMessage('Account Name is required'),
  body('accountType').trim().notEmpty().isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']).withMessage('Valid Account Type required'),
  body('openingBalance').notEmpty().isNumeric().withMessage('Opening Balance must be a number')
];

const updateLedgerRules = [
  param('id').isMongoId().withMessage('Invalid Ledger ID'),
  body('accountName').optional().trim().notEmpty(),
  body('accountType').optional().isIn(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  body('openingBalance').optional().isNumeric()
];

// Transaction Validators
const createTransactionRules = [
  body('type').trim().notEmpty().isIn(['debit', 'credit']).withMessage('Transaction type must be debit or credit'),
  body('ledgerAccount').trim().notEmpty().withMessage('Ledger Account is required'),
  body('reference').trim().notEmpty().withMessage('Reference string is required'),
  body('date').trim().notEmpty().withMessage('Date is required')
];

const updateTransactionRules = [
  param('id').isMongoId().withMessage('Invalid Transaction ID'),
  body('type').optional().isIn(['debit', 'credit']),
  body('ledgerAccount').optional().trim().notEmpty(),
  body('reference').optional().trim().notEmpty(),
  body('date').optional().trim().notEmpty()
];

// Bank Account Validators
const createBankAccountRules = [
  body('bankName').trim().notEmpty().withMessage('Bank Name is required'),
  body('accountHolder').trim().notEmpty().withMessage('Account Holder Name is required'),
  body('accountNumber').trim().notEmpty().withMessage('Account Number is required'),
  body('ifscBranch').trim().notEmpty().withMessage('IFSC / Branch code is required'),
  body('balance').notEmpty().isNumeric().withMessage('Balance must be a number')
];

const updateBankAccountRules = [
  param('id').isMongoId().withMessage('Invalid Bank Account ID'),
  body('bankName').optional().trim().notEmpty(),
  body('accountHolder').optional().trim().notEmpty(),
  body('accountNumber').optional().trim().notEmpty(),
  body('ifscBranch').optional().trim().notEmpty(),
  body('balance').optional().isNumeric()
];

// Voucher Validators
const createVoucherRules = [
  body('voucherType').trim().notEmpty().isIn(['payment', 'receipt', 'journal']).withMessage('Voucher Type must be payment, receipt, or journal'),
  body('voucherNumber').trim().notEmpty().withMessage('Voucher Number is required'),
  body('amount').notEmpty().isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('date').trim().notEmpty().withMessage('Date is required')
];

const updateVoucherRules = [
  param('id').isMongoId().withMessage('Invalid Voucher ID'),
  body('voucherType').optional().isIn(['payment', 'receipt', 'journal']),
  body('voucherNumber').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('date').optional().trim().notEmpty()
];

module.exports = {
  createIncomeRules,
  updateIncomeRules,
  createExpenseRules,
  updateExpenseRules,
  createLedgerRules,
  updateLedgerRules,
  createTransactionRules,
  updateTransactionRules,
  createBankAccountRules,
  updateBankAccountRules,
  createVoucherRules,
  updateVoucherRules
};
