const Income = require('./income.model');
const Expense = require('./expense.model');
const Ledger = require('./ledger.model');
const Transaction = require('./transaction.model');
const BankAccount = require('./bank-account.model');
const Voucher = require('./voucher.model');
const ApiError = require('../../utils/apiError.util');
const { paginate } = require('../../utils/pagination.util');
const { buildSearchQuery, buildSortQuery } = require('../../utils/search.util');
const { uploadImage, uploadDocument, deleteFile } = require('../../utils/upload.util');

// ─── DASHBOARD SERVICES ───────────────────────────────────────────────────────

const getFinanceDashboardData = async (tenantId = 'default_tenant') => {
  const [incomes, expenses, bankAccounts] = await Promise.all([
    Income.find({ tenantId }).lean(),
    Expense.find({ tenantId }).lean(),
    BankAccount.find({ tenantId }).lean()
  ]);

  const totalIncome = incomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const bankBalance = bankAccounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const cashBalance = totalIncome - totalExpense;

  // Monthly Income vs Expense Trend Calculation
  const monthlyMap = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(m => { monthlyMap[m] = { income: 0, expense: 0 }; });

  incomes.forEach(inc => {
    if (inc.date) {
      const monthIdx = new Date(inc.date).getMonth();
      if (!isNaN(monthIdx) && months[monthIdx]) {
        monthlyMap[months[monthIdx]].income += inc.amount || 0;
      }
    }
  });

  expenses.forEach(exp => {
    if (exp.date) {
      const monthIdx = new Date(exp.date).getMonth();
      if (!isNaN(monthIdx) && months[monthIdx]) {
        monthlyMap[months[monthIdx]].expense += exp.amount || 0;
      }
    }
  });

  const chartData = months.map(month => ({
    month,
    income: monthlyMap[month].income,
    expense: monthlyMap[month].expense
  }));

  const recentTransactions = await Transaction.find({ tenantId }).sort({ date: -1 }).limit(5).lean();

  return {
    summary: {
      totalIncome,
      totalExpense,
      cashBalance,
      bankBalance,
      netProfit: totalIncome - totalExpense
    },
    chartData,
    recentTransactions
  };
};

// ─── INCOME SERVICES ─────────────────────────────────────────────────────────

const getIncomes = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-date', category } = queryParams;
  const filter = { tenantId };

  if (category) filter.category = category;

  const searchQuery = buildSearchQuery(search, ['source', 'category', 'description', 'date']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Income.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Income.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createIncome = async (data, file = null, tenantId = 'default_tenant') => {
  let receiptUrl = null;
  let receiptPublicId = null;

  if (file) {
    const uploaded = await uploadImage(file.path, 'finance/receipts');
    receiptUrl = uploaded.url;
    receiptPublicId = uploaded.publicId;
  }

  const income = await Income.create({
    ...data,
    tenantId,
    receiptUrl,
    receiptPublicId
  });

  return income;
};

const updateIncome = async (id, data, file = null, tenantId = 'default_tenant') => {
  const income = await Income.findOne({ _id: id, tenantId });
  if (!income) throw ApiError.notFound('Income record not found.');

  if (file) {
    if (income.receiptPublicId) {
      await deleteFile(income.receiptPublicId).catch(() => {});
    }
    const uploaded = await uploadImage(file.path, 'finance/receipts');
    income.receiptUrl = uploaded.url;
    income.receiptPublicId = uploaded.publicId;
  }

  Object.assign(income, data);
  await income.save();
  return income;
};

const deleteIncome = async (id, tenantId = 'default_tenant') => {
  const income = await Income.findOne({ _id: id, tenantId });
  if (!income) throw ApiError.notFound('Income record not found.');

  if (income.receiptPublicId) {
    await deleteFile(income.receiptPublicId).catch(() => {});
  }

  await Income.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── EXPENSE SERVICES ────────────────────────────────────────────────────────

const getExpenses = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-date', category } = queryParams;
  const filter = { tenantId };

  if (category) filter.category = category;

  const searchQuery = buildSearchQuery(search, ['expenseName', 'vendor', 'category', 'description', 'date']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Expense.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Expense.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createExpense = async (data, file = null, tenantId = 'default_tenant') => {
  let billUrl = null;
  let billPublicId = null;

  if (file) {
    const uploaded = await uploadDocument(file.path, 'finance/bills');
    billUrl = uploaded.url;
    billPublicId = uploaded.publicId;
  }

  const expense = await Expense.create({
    ...data,
    tenantId,
    billUrl,
    billPublicId
  });

  return expense;
};

const updateExpense = async (id, data, file = null, tenantId = 'default_tenant') => {
  const expense = await Expense.findOne({ _id: id, tenantId });
  if (!expense) throw ApiError.notFound('Expense record not found.');

  if (file) {
    if (expense.billPublicId) {
      await deleteFile(expense.billPublicId).catch(() => {});
    }
    const uploaded = await uploadDocument(file.path, 'finance/bills');
    expense.billUrl = uploaded.url;
    expense.billPublicId = uploaded.publicId;
  }

  Object.assign(expense, data);
  await expense.save();
  return expense;
};

const deleteExpense = async (id, tenantId = 'default_tenant') => {
  const expense = await Expense.findOne({ _id: id, tenantId });
  if (!expense) throw ApiError.notFound('Expense record not found.');

  if (expense.billPublicId) {
    await deleteFile(expense.billPublicId).catch(() => {});
  }

  await Expense.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── LEDGER SERVICES ─────────────────────────────────────────────────────────

const getLedgers = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'accountName', accountType } = queryParams;
  const filter = { tenantId };

  if (accountType) filter.accountType = accountType;

  const searchQuery = buildSearchQuery(search, ['accountName', 'accountType']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Ledger.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Ledger.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createLedger = async (data, tenantId = 'default_tenant') => {
  const name = data.accountName.trim();
  const existing = await Ledger.findOne({ tenantId, accountName: name });
  if (existing) throw ApiError.conflict(`Ledger Account '${name}' already exists.`);

  const currentBalance = data.openingBalance || 0;
  const ledger = await Ledger.create({
    ...data,
    accountName: name,
    currentBalance,
    tenantId
  });

  return ledger;
};

const updateLedger = async (id, data, tenantId = 'default_tenant') => {
  const ledger = await Ledger.findOne({ _id: id, tenantId });
  if (!ledger) throw ApiError.notFound('Ledger account not found.');

  if (data.accountName && data.accountName.trim() !== ledger.accountName) {
    const name = data.accountName.trim();
    const existing = await Ledger.findOne({ tenantId, accountName: name });
    if (existing) throw ApiError.conflict(`Ledger Account '${name}' already exists.`);
  }

  Object.assign(ledger, data);
  if (data.accountName) ledger.accountName = data.accountName.trim();
  await ledger.save();
  return ledger;
};

const deleteLedger = async (id, tenantId = 'default_tenant') => {
  const ledger = await Ledger.findOne({ _id: id, tenantId });
  if (!ledger) throw ApiError.notFound('Ledger account not found.');
  await Ledger.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── TRANSACTION SERVICES ────────────────────────────────────────────────────

const getTransactions = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-date', ledgerAccount, type } = queryParams;
  const filter = { tenantId };

  if (ledgerAccount) filter.ledgerAccount = ledgerAccount;
  if (type) filter.type = type;

  const searchQuery = buildSearchQuery(search, ['reference', 'remarks', 'ledgerAccount', 'date']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Transaction.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Transaction.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createTransaction = async (data, tenantId = 'default_tenant') => {
  if (data.debitAmount < 0 || data.creditAmount < 0) {
    throw ApiError.badRequest('Transaction amounts cannot be negative.');
  }

  const transaction = await Transaction.create({ ...data, tenantId });
  return transaction;
};

const updateTransaction = async (id, data, tenantId = 'default_tenant') => {
  const transaction = await Transaction.findOne({ _id: id, tenantId });
  if (!transaction) throw ApiError.notFound('Transaction not found.');

  Object.assign(transaction, data);
  await transaction.save();
  return transaction;
};

const deleteTransaction = async (id, tenantId = 'default_tenant') => {
  const transaction = await Transaction.findOne({ _id: id, tenantId });
  if (!transaction) throw ApiError.notFound('Transaction not found.');
  await Transaction.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── BANK ACCOUNT SERVICES ───────────────────────────────────────────────────

const getBankAccounts = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'bankName' } = queryParams;
  const filter = { tenantId };

  const searchQuery = buildSearchQuery(search, ['bankName', 'accountHolder', 'accountNumber', 'ifscBranch']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await BankAccount.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await BankAccount.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createBankAccount = async (data, tenantId = 'default_tenant') => {
  const accNum = data.accountNumber.trim();
  const existing = await BankAccount.findOne({ tenantId, accountNumber: accNum });
  if (existing) throw ApiError.conflict(`Bank Account '${accNum}' already exists.`);

  const bankAcc = await BankAccount.create({ ...data, accountNumber: accNum, tenantId });
  return bankAcc;
};

const updateBankAccount = async (id, data, tenantId = 'default_tenant') => {
  const bankAcc = await BankAccount.findOne({ _id: id, tenantId });
  if (!bankAcc) throw ApiError.notFound('Bank account record not found.');

  if (data.accountNumber && data.accountNumber.trim() !== bankAcc.accountNumber) {
    const accNum = data.accountNumber.trim();
    const existing = await BankAccount.findOne({ tenantId, accountNumber: accNum });
    if (existing) throw ApiError.conflict(`Bank Account '${accNum}' already exists.`);
  }

  Object.assign(bankAcc, data);
  await bankAcc.save();
  return bankAcc;
};

const deleteBankAccount = async (id, tenantId = 'default_tenant') => {
  const bankAcc = await BankAccount.findOne({ _id: id, tenantId });
  if (!bankAcc) throw ApiError.notFound('Bank account record not found.');
  await BankAccount.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── VOUCHER SERVICES ─────────────────────────────────────────────────────────

const getVouchers = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-date', voucherType } = queryParams;
  const filter = { tenantId };

  if (voucherType) filter.voucherType = voucherType;

  const searchQuery = buildSearchQuery(search, ['voucherNumber', 'payeeOrReceivedFrom', 'debitAccount', 'creditAccount', 'remarks', 'description']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Voucher.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Voucher.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createVoucher = async (data, tenantId = 'default_tenant') => {
  const vNum = data.voucherNumber.trim().toUpperCase();
  const existing = await Voucher.findOne({ tenantId, voucherNumber: vNum });
  if (existing) throw ApiError.conflict(`Voucher Number '${vNum}' already exists.`);

  const voucher = await Voucher.create({ ...data, voucherNumber: vNum, tenantId });
  return voucher;
};

const updateVoucher = async (id, data, tenantId = 'default_tenant') => {
  const voucher = await Voucher.findOne({ _id: id, tenantId });
  if (!voucher) throw ApiError.notFound('Voucher record not found.');

  if (data.voucherNumber && data.voucherNumber.trim().toUpperCase() !== voucher.voucherNumber) {
    const vNum = data.voucherNumber.trim().toUpperCase();
    const existing = await Voucher.findOne({ tenantId, voucherNumber: vNum });
    if (existing) throw ApiError.conflict(`Voucher Number '${vNum}' already exists.`);
  }

  Object.assign(voucher, data);
  if (data.voucherNumber) voucher.voucherNumber = data.voucherNumber.trim().toUpperCase();
  await voucher.save();
  return voucher;
};

const deleteVoucher = async (id, tenantId = 'default_tenant') => {
  const voucher = await Voucher.findOne({ _id: id, tenantId });
  if (!voucher) throw ApiError.notFound('Voucher record not found.');
  await Voucher.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── FINANCIAL REPORTS SERVICE ────────────────────────────────────────────────

const getFinancialReports = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { reportType = 'income', startDate, endDate } = queryParams;

  const filter = { tenantId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = startDate;
    if (endDate) filter.date.$lte = endDate;
  }

  if (reportType === 'income') {
    const data = await Income.find(filter).sort({ date: -1 }).lean();
    const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return { reportType, data, summary: { totalIncome: total } };
  }

  if (reportType === 'expense') {
    const data = await Expense.find(filter).sort({ date: -1 }).lean();
    const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return { reportType, data, summary: { totalExpense: total } };
  }

  if (reportType === 'ledger') {
    const data = await Ledger.find({ tenantId }).lean();
    return { reportType, data };
  }

  if (reportType === 'profit_loss' || reportType === 'balance_sheet') {
    const incomes = await Income.find(filter).lean();
    const expenses = await Expense.find(filter).lean();
    const totalInc = incomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalExp = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return {
      reportType,
      summary: {
        totalRevenue: totalInc,
        totalExpenses: totalExp,
        netProfitLoss: totalInc - totalExp
      }
    };
  }

  const data = await Transaction.find(filter).sort({ date: -1 }).lean();
  return { reportType, data };
};

module.exports = {
  getFinanceDashboardData,

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
