const express = require('express');
const payrollController = require('./payroll.controller');
const {
  salaryStructureSchema,
  salaryComponentSchema,
  employeeSalarySchema,
  generatePayrollSchema,
  dynamicAdditionSchema
} = require('./payroll.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

// ─── Dashboard Stats & Reports ───────────────────────────────────────────────
router.get('/dashboard-stats', payrollController.getPayrollDashboardStats);
router.get('/reports', payrollController.getPayrollReport);

// ─── Salary Structures Endpoints ─────────────────────────────────────────────
router.get('/structures', payrollController.getSalaryStructures);
router.post('/structures', salaryStructureSchema, validate, payrollController.createSalaryStructure);
router.put('/structures/:id', salaryStructureSchema, validate, payrollController.updateSalaryStructure);
router.delete('/structures/:id', payrollController.deleteSalaryStructure);

// ─── Salary Components Endpoints ─────────────────────────────────────────────
router.get('/components', payrollController.getSalaryComponents);
router.post('/components', salaryComponentSchema, validate, payrollController.createSalaryComponent);
router.put('/components/:id', salaryComponentSchema, validate, payrollController.updateSalaryComponent);
router.delete('/components/:id', payrollController.deleteSalaryComponent);

// ─── Employee Salaries Settings Endpoints ────────────────────────────────────
router.get('/employee-salaries', payrollController.getEmployeeSalaries);
router.post('/employee-salaries', employeeSalarySchema, validate, payrollController.configureEmployeeSalary);

// ─── Dynamic Additions / Deductions Endpoints ────────────────────────────────
router.get('/bonuses', payrollController.getBonuses);
router.post('/bonuses', dynamicAdditionSchema, validate, payrollController.createBonus);
router.delete('/bonuses/:id', payrollController.deleteBonus);

router.get('/allowances', payrollController.getAllowances);
router.post('/allowances', dynamicAdditionSchema, validate, payrollController.createAllowance);
router.delete('/allowances/:id', payrollController.deleteAllowance);

router.get('/deductions', payrollController.getDeductions);
router.post('/deductions', dynamicAdditionSchema, validate, payrollController.createDeduction);
router.delete('/deductions/:id', payrollController.deleteDeduction);

// ─── Payroll Batches & Generation Endpoints ──────────────────────────────────
router.get('/', payrollController.getPayrollBatches);
router.post('/generate', generatePayrollSchema, validate, payrollController.generateMonthlyPayroll);
router.post('/approve/:id', payrollController.approveMonthlyPayroll);
router.post('/pay/:id', payrollController.payMonthlyPayroll);
router.get('/batch/:id/payslips', payrollController.getPayrollBatchPayslips);
router.get('/payslip/:id', payrollController.getPayslipPrintDetails);

module.exports = router;
