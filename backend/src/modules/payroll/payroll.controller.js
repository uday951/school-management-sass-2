const payrollService = require('./payroll.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

class PayrollController {
  // ─── Salary Structures ─────────────────────────────────────────────────────
  getSalaryStructures = asyncHandler(async (req, res) => {
    const list = await payrollService.getSalaryStructures();
    return sendSuccess(res, 'Salary structures fetched successfully.', list);
  });

  createSalaryStructure = asyncHandler(async (req, res) => {
    const structure = await payrollService.createSalaryStructure(req.body);
    return sendCreated(res, 'Salary structure created successfully.', structure);
  });

  updateSalaryStructure = asyncHandler(async (req, res) => {
    const updated = await payrollService.updateSalaryStructure(req.params.id, req.body);
    return sendSuccess(res, 'Salary structure updated successfully.', updated);
  });

  deleteSalaryStructure = asyncHandler(async (req, res) => {
    await payrollService.deleteSalaryStructure(req.params.id);
    return sendSuccess(res, 'Salary structure deleted successfully.');
  });

  // ─── Salary Components ─────────────────────────────────────────────────────
  getSalaryComponents = asyncHandler(async (req, res) => {
    const list = await payrollService.getSalaryComponents();
    return sendSuccess(res, 'Salary components fetched successfully.', list);
  });

  createSalaryComponent = asyncHandler(async (req, res) => {
    const component = await payrollService.createSalaryComponent(req.body);
    return sendCreated(res, 'Salary component created successfully.', component);
  });

  updateSalaryComponent = asyncHandler(async (req, res) => {
    const updated = await payrollService.updateSalaryComponent(req.params.id, req.body);
    return sendSuccess(res, 'Salary component updated successfully.', updated);
  });

  deleteSalaryComponent = asyncHandler(async (req, res) => {
    await payrollService.deleteSalaryComponent(req.params.id);
    return sendSuccess(res, 'Salary component deleted successfully.');
  });

  // ─── Employee Salary Configurations ─────────────────────────────────────────
  getEmployeeSalaries = asyncHandler(async (req, res) => {
    const list = await payrollService.getEmployeeSalaries();
    return sendSuccess(res, 'Employee salary configurations fetched successfully.', list);
  });

  configureEmployeeSalary = asyncHandler(async (req, res) => {
    const config = await payrollService.configureEmployeeSalary(req.body);
    return sendCreated(res, 'Employee salary configured successfully.', config);
  });

  // ─── Dynamic Additions / Deductions ─────────────────────────────────────────
  getBonuses = asyncHandler(async (req, res) => {
    const list = await payrollService.getBonuses();
    return sendSuccess(res, 'Staff bonuses fetched successfully.', list);
  });

  createBonus = asyncHandler(async (req, res) => {
    const bonus = await payrollService.createBonus(req.body);
    return sendCreated(res, 'Staff bonus created successfully.', bonus);
  });

  deleteBonus = asyncHandler(async (req, res) => {
    await payrollService.deleteBonus(req.params.id);
    return sendSuccess(res, 'Staff bonus deleted successfully.');
  });

  getAllowances = asyncHandler(async (req, res) => {
    const list = await payrollService.getAllowances();
    return sendSuccess(res, 'Staff allowances fetched successfully.', list);
  });

  createAllowance = asyncHandler(async (req, res) => {
    const allowance = await payrollService.createAllowance(req.body);
    return sendCreated(res, 'Staff allowance created successfully.', allowance);
  });

  deleteAllowance = asyncHandler(async (req, res) => {
    await payrollService.deleteAllowance(req.params.id);
    return sendSuccess(res, 'Staff allowance deleted successfully.');
  });

  getDeductions = asyncHandler(async (req, res) => {
    const list = await payrollService.getDeductions();
    return sendSuccess(res, 'Staff deductions fetched successfully.', list);
  });

  createDeduction = asyncHandler(async (req, res) => {
    const deduction = await payrollService.createDeduction(req.body);
    return sendCreated(res, 'Staff deduction created successfully.', deduction);
  });

  deleteDeduction = asyncHandler(async (req, res) => {
    await payrollService.deleteDeduction(req.params.id);
    return sendSuccess(res, 'Staff deduction deleted successfully.');
  });

  // ─── Monthly Payroll batches ────────────────────────────────────────────────
  getPayrollBatches = asyncHandler(async (req, res) => {
    const list = await payrollService.getPayrollBatches();
    return sendSuccess(res, 'Payroll batches fetched successfully.', list);
  });

  getPayrollBatchPayslips = asyncHandler(async (req, res) => {
    const list = await payrollService.getPayrollBatchPayslips(req.params.id);
    return sendSuccess(res, 'Payroll batch payslips fetched successfully.', list);
  });

  generateMonthlyPayroll = asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const batch = await payrollService.generateMonthlyPayroll(month, year);
    return sendCreated(res, 'Monthly payroll batch generated successfully.', batch);
  });

  approveMonthlyPayroll = asyncHandler(async (req, res) => {
    const approved = await payrollService.approveMonthlyPayroll(req.params.id, req.user?.name || 'Admin');
    return sendSuccess(res, 'Payroll batch approved successfully.', approved);
  });

  payMonthlyPayroll = asyncHandler(async (req, res) => {
    const paid = await payrollService.payMonthlyPayroll(req.params.id, req.body.paymentMethod);
    return sendSuccess(res, 'Payroll batch paid and ledger transactions synchronized successfully.', paid);
  });

  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  getPayrollDashboardStats = asyncHandler(async (req, res) => {
    const stats = await payrollService.getPayrollDashboardStats();
    return sendSuccess(res, 'Payroll dashboard statistics fetched successfully.', stats);
  });

  // ─── Reports ───────────────────────────────────────────────────────────────
  getPayrollReport = asyncHandler(async (req, res) => {
    const report = await payrollService.getPayrollReport(req.query);
    return sendSuccess(res, 'Payroll report generated successfully.', report);
  });

  // ─── Print / Preview / Download Payslip ─────────────────────────────────────
  getPayslipPrintDetails = asyncHandler(async (req, res) => {
    const payslip = await payrollService.getPayrollBatchPayslips(req.params.id);
    // Returns print structure layout parameters
    return sendSuccess(res, 'Payslip printed details retrieved successfully.', payslip);
  });
}

module.exports = new PayrollController();
