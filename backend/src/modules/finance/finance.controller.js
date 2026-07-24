const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');
const financeService = require('./finance.service');

// ─── DASHBOARD CONTROLLER ─────────────────────────────────────────────────────

const getDashboardData = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const data = await financeService.getFinanceDashboardData(tenantId);
  return sendSuccess(res, 'Finance dashboard metrics retrieved successfully', data);
});

// ─── INCOME CONTROLLERS ───────────────────────────────────────────────────────

const getIncomes = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await financeService.getIncomes(req.query, tenantId);
  return sendPaginated(res, 'Income records retrieved successfully', data, pagination);
});

const createIncome = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const income = await financeService.createIncome(req.body, req.file, tenantId);
  return sendCreated(res, 'Income record created successfully', income);
});

const updateIncome = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const income = await financeService.updateIncome(req.params.id, req.body, req.file, tenantId);
  return sendSuccess(res, 'Income record updated successfully', income);
});

const deleteIncome = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await financeService.deleteIncome(req.params.id, tenantId);
  return sendSuccess(res, 'Income record deleted successfully');
});

// ─── EXPENSE CONTROLLERS ──────────────────────────────────────────────────────

const getExpenses = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await financeService.getExpenses(req.query, tenantId);
  return sendPaginated(res, 'Expense records retrieved successfully', data, pagination);
});

const createExpense = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const expense = await financeService.createExpense(req.body, req.file, tenantId);
  return sendCreated(res, 'Expense record created successfully', expense);
});

const updateExpense = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const expense = await financeService.updateExpense(req.params.id, req.body, req.file, tenantId);
  return sendSuccess(res, 'Expense record updated successfully', expense);
});

const deleteExpense = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await financeService.deleteExpense(req.params.id, tenantId);
  return sendSuccess(res, 'Expense record deleted successfully');
});

// ─── LEDGER CONTROLLERS ───────────────────────────────────────────────────────

const getLedgers = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await financeService.getLedgers(req.query, tenantId);
  return sendPaginated(res, 'Ledger accounts retrieved successfully', data, pagination);
});

const createLedger = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const ledger = await financeService.createLedger(req.body, tenantId);
  return sendCreated(res, 'Ledger account created successfully', ledger);
});

const updateLedger = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const ledger = await financeService.updateLedger(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Ledger account updated successfully', ledger);
});

const deleteLedger = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await financeService.deleteLedger(req.params.id, tenantId);
  return sendSuccess(res, 'Ledger account deleted successfully');
});

// ─── TRANSACTION CONTROLLERS ──────────────────────────────────────────────────

const getTransactions = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await financeService.getTransactions(req.query, tenantId);
  return sendPaginated(res, 'Transactions retrieved successfully', data, pagination);
});

const createTransaction = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const transaction = await financeService.createTransaction(req.body, tenantId);
  return sendCreated(res, 'Transaction created successfully', transaction);
});

const updateTransaction = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const transaction = await financeService.updateTransaction(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Transaction updated successfully', transaction);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await financeService.deleteTransaction(req.params.id, tenantId);
  return sendSuccess(res, 'Transaction deleted successfully');
});

// ─── BANK ACCOUNT CONTROLLERS ─────────────────────────────────────────────────

const getBankAccounts = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await financeService.getBankAccounts(req.query, tenantId);
  return sendPaginated(res, 'Bank accounts retrieved successfully', data, pagination);
});

const createBankAccount = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const bankAcc = await financeService.createBankAccount(req.body, tenantId);
  return sendCreated(res, 'Bank account created successfully', bankAcc);
});

const updateBankAccount = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const bankAcc = await financeService.updateBankAccount(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Bank account updated successfully', bankAcc);
});

const deleteBankAccount = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await financeService.deleteBankAccount(req.params.id, tenantId);
  return sendSuccess(res, 'Bank account deleted successfully');
});

// ─── VOUCHER CONTROLLERS ──────────────────────────────────────────────────────

const getVouchers = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await financeService.getVouchers(req.query, tenantId);
  return sendPaginated(res, 'Vouchers retrieved successfully', data, pagination);
});

const createVoucher = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const voucher = await financeService.createVoucher(req.body, tenantId);
  return sendCreated(res, 'Voucher created successfully', voucher);
});

const updateVoucher = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const voucher = await financeService.updateVoucher(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Voucher updated successfully', voucher);
});

const deleteVoucher = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await financeService.deleteVoucher(req.params.id, tenantId);
  return sendSuccess(res, 'Voucher deleted successfully');
});

// ─── FINANCIAL REPORTS CONTROLLER ─────────────────────────────────────────────

const getFinancialReports = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const reportData = await financeService.getFinancialReports(req.query, tenantId);
  return sendSuccess(res, 'Financial report generated successfully', reportData);
});

module.exports = {
  getDashboardData,

  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,

  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,

  getLedgers,
  createLedger,
  updateLedger,
  deleteLedger,

  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,

  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,

  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,

  getFinancialReports
};
