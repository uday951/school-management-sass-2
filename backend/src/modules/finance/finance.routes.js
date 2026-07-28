const express = require('express');

const { optionalAuthenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { uploadImage, uploadDocument, handleMulterError } = require('../../middlewares/upload.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const ROLES = require('../../constants/roles');

const financeController = require('./finance.controller');

const {
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
} = require('./finance.validator');

const router = express.Router();

// ─── DASHBOARD ROUTE ─────────────────────────────────────────────────────────

router.get(
  '/finance/dashboard',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getDashboardData
);

// ─── INCOME ROUTES ───────────────────────────────────────────────────────────

router.get(
  '/income',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getIncomes
);

router.post(
  '/income',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadImage.single('receipt'),
  handleMulterError,
  createIncomeRules,
  validate,
  financeController.createIncome
);

router.put(
  '/income/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadImage.single('receipt'),
  handleMulterError,
  updateIncomeRules,
  validate,
  financeController.updateIncome
);

router.delete(
  '/income/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.deleteIncome
);

// ─── EXPENSE ROUTES ──────────────────────────────────────────────────────────

router.get(
  '/expenses',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getExpenses
);

router.post(
  '/expenses',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadDocument.single('bill'),
  handleMulterError,
  createExpenseRules,
  validate,
  financeController.createExpense
);

router.put(
  '/expenses/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadDocument.single('bill'),
  handleMulterError,
  updateExpenseRules,
  validate,
  financeController.updateExpense
);

router.delete(
  '/expenses/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.deleteExpense
);

// ─── LEDGER ROUTES ───────────────────────────────────────────────────────────

router.get(
  '/ledger',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getLedgers
);

router.post(
  '/ledger',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createLedgerRules,
  validate,
  financeController.createLedger
);

router.put(
  '/ledger/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateLedgerRules,
  validate,
  financeController.updateLedger
);

router.delete(
  '/ledger/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.deleteLedger
);

// ─── TRANSACTION ROUTES ──────────────────────────────────────────────────────

router.get(
  '/transactions',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getTransactions
);

router.post(
  '/transactions',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createTransactionRules,
  validate,
  financeController.createTransaction
);

router.put(
  '/transactions/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateTransactionRules,
  validate,
  financeController.updateTransaction
);

router.delete(
  '/transactions/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.deleteTransaction
);

// ─── BANK ACCOUNT ROUTES ─────────────────────────────────────────────────────

router.get(
  '/bank-accounts',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getBankAccounts
);

router.post(
  '/bank-accounts',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createBankAccountRules,
  validate,
  financeController.createBankAccount
);

router.put(
  '/bank-accounts/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateBankAccountRules,
  validate,
  financeController.updateBankAccount
);

router.delete(
  '/bank-accounts/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.deleteBankAccount
);

// ─── VOUCHER ROUTES ──────────────────────────────────────────────────────────

router.get(
  '/vouchers',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getVouchers
);

router.post(
  '/vouchers',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createVoucherRules,
  validate,
  financeController.createVoucher
);

router.put(
  '/vouchers/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateVoucherRules,
  validate,
  financeController.updateVoucher
);

router.delete(
  '/vouchers/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.deleteVoucher
);

// ─── FINANCIAL REPORTS ROUTE ──────────────────────────────────────────────────

router.get(
  '/reports/finance',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  financeController.getFinancialReports
);

module.exports = router;
