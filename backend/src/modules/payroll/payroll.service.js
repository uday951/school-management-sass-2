const payrollRepository = require('./payroll.repository');
const ApiError = require('../../utils/apiError.util');
const Teacher = require('../teacher/models/teacher.model');
const TeacherAttendance = require('../attendance/models/teacher-attendance.model');
const LeaveRequest = require('../attendance/models/leave-request.model');
const Expense = require('../finance/expense.model');
const Transaction = require('../finance/transaction.model');
const mongoose = require('mongoose');
const Payroll = require('./models/payroll.model');
const Payslip = require('./models/payslip.model');
const Allowance = require('./models/allowance.model');
const Bonus = require('./models/bonus.model');
const Deduction = require('./models/deduction.model');

class PayrollService {
  // ─── Salary Structure Services ─────────────────────────────────────────────
  async getSalaryStructures() {
    return payrollRepository.findSalaryStructures();
  }

  async createSalaryStructure(data) {
    if (!data.name || !data.basicSalary) {
      throw ApiError.badRequest('Name and Basic Salary are required.');
    }
    const hra = data.hra || 0;
    const da = data.da || 0;
    const medicalAllowance = data.medicalAllowance || 0;
    const transportAllowance = data.transportAllowance || 0;
    const otherAllowances = data.otherAllowances || 0;
    const grossSalary = Number(data.basicSalary) + hra + da + medicalAllowance + transportAllowance + otherAllowances;
    
    return payrollRepository.createSalaryStructure({
      ...data,
      grossSalary,
      effectiveDate: data.effectiveDate || new Date()
    });
  }

  async updateSalaryStructure(id, data) {
    const structure = await payrollRepository.findSalaryStructureById(id);
    if (!structure) throw ApiError.notFound('Salary Structure not found.');

    const basicSalary = data.basicSalary !== undefined ? Number(data.basicSalary) : structure.basicSalary;
    const hra = data.hra !== undefined ? Number(data.hra) : structure.hra;
    const da = data.da !== undefined ? Number(data.da) : structure.da;
    const medicalAllowance = data.medicalAllowance !== undefined ? Number(data.medicalAllowance) : structure.medicalAllowance;
    const transportAllowance = data.transportAllowance !== undefined ? Number(data.transportAllowance) : structure.transportAllowance;
    const otherAllowances = data.otherAllowances !== undefined ? Number(data.otherAllowances) : structure.otherAllowances;

    const grossSalary = basicSalary + hra + da + medicalAllowance + transportAllowance + otherAllowances;

    return payrollRepository.updateSalaryStructure(id, {
      ...data,
      grossSalary
    });
  }

  async deleteSalaryStructure(id) {
    const structure = await payrollRepository.findSalaryStructureById(id);
    if (!structure) throw ApiError.notFound('Salary Structure not found.');
    return payrollRepository.softDeleteSalaryStructure(id);
  }

  // ─── Salary Component Services ──────────────────────────────────────────────
  async getSalaryComponents() {
    return payrollRepository.findSalaryComponents();
  }

  async createSalaryComponent(data) {
    return payrollRepository.createSalaryComponent(data);
  }

  async updateSalaryComponent(id, data) {
    return payrollRepository.updateSalaryComponent(id, data);
  }

  async deleteSalaryComponent(id) {
    return payrollRepository.softDeleteSalaryComponent(id);
  }

  // ─── Employee Salary Configs ───────────────────────────────────────────────
  async getEmployeeSalaries() {
    return payrollRepository.findEmployeeSalaries();
  }

  async configureEmployeeSalary(payload) {
    const { teacherId, salaryStructureId } = payload;
    if (!teacherId || !salaryStructureId) {
      throw ApiError.badRequest('Teacher ID and Salary Structure ID are required.');
    }

    const structure = await payrollRepository.findSalaryStructureById(salaryStructureId);
    if (!structure) throw ApiError.notFound('Salary Structure not found.');

    const pf = structure.basicSalary * 0.12; // Statutory 12% PF
    const esi = structure.grossSalary * 0.0075; // Statutory 0.75% ESI
    const profTax = 20; // Statutory $20 Prof Tax
    const incomeTax = structure.grossSalary > 5000 ? (structure.grossSalary - 5000) * 0.10 : 0; // 10% on >5000

    const netSalary = structure.grossSalary - (pf + esi + profTax + incomeTax);

    return payrollRepository.updateEmployeeSalary(teacherId, {
      salaryStructureId,
      basicSalary: structure.basicSalary,
      hra: structure.hra,
      da: structure.da,
      medicalAllowance: structure.medicalAllowance,
      transportAllowance: structure.transportAllowance,
      otherAllowances: structure.otherAllowances,
      pf,
      esi,
      profTax,
      incomeTax,
      netSalary,
      status: 'active'
    });
  }

  // ─── Dynamic Additions / Deductions CRUD ─────────────────────────────────────
  async getBonuses() {
    return payrollRepository.findBonuses();
  }
  async createBonus(data) {
    return payrollRepository.createBonus(data);
  }
  async deleteBonus(id) {
    return payrollRepository.softDeleteBonus(id);
  }

  async getAllowances() {
    return payrollRepository.findAllowances();
  }
  async createAllowance(data) {
    return payrollRepository.createAllowance(data);
  }
  async deleteAllowance(id) {
    return payrollRepository.softDeleteAllowance(id);
  }

  async getDeductions() {
    return payrollRepository.findDeductions();
  }
  async createDeduction(data) {
    return payrollRepository.createDeduction(data);
  }
  async deleteDeduction(id) {
    return payrollRepository.softDeleteDeduction(id);
  }

  // ─── Monthly Payroll Generation Batch Run ────────────────────────────────────
  async getPayrollBatches() {
    return payrollRepository.findPayrollBatches();
  }

  async getPayrollBatchPayslips(payrollId) {
    return payrollRepository.findPayslips({ payrollId });
  }

  async generateMonthlyPayroll(month, year) {
    if (!month || !year) {
      throw ApiError.badRequest('Month and Year are required.');
    }

    // Check if payroll already exists for this period
    const existing = await Payroll.findOne({ month, year, isDeleted: false });
    if (existing) {
      throw ApiError.badRequest(`Payroll batch already generated for month ${month}/${year}`);
    }

    // 1. Fetch all configured Employee Salaries
    const configuredSalaries = await payrollRepository.findEmployeeSalaries({ status: 'active' });
    if (!configuredSalaries || configuredSalaries.length === 0) {
      throw ApiError.badRequest('No active employee salary configurations found to process.');
    }

    // Create the Payroll batch header
    const payrollBatch = await payrollRepository.createPayrollBatch({
      month,
      year,
      status: 'pending',
      processedDate: new Date()
    });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    let batchTotalAmount = 0;
    let batchTotalDeductions = 0;
    let batchTotalBonuses = 0;
    let batchTotalAllowances = 0;
    let batchNetAmount = 0;

    for (const config of configuredSalaries) {
      const teacher = config.teacherId;
      if (!teacher) continue;

      // 2. Fetch monthly attendance metrics
      const attendance = await TeacherAttendance.find({
        teacherId: teacher._id.toString(),
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const presentDays = attendance.filter(a => a.status === 'present').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const lateDays = attendance.filter(a => a.status === 'late').length;
      const halfDays = attendance.filter(a => a.status === 'halfday').length;

      // 3. Fetch approved leaves for the teacher during this period
      const approvedLeaves = await LeaveRequest.find({
        applicantId: teacher._id.toString(),
        type: 'teacher',
        status: 'approved',
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth }
      });

      let leaveDays = 0;
      approvedLeaves.forEach(leave => {
        const start = leave.startDate < startOfMonth ? startOfMonth : leave.startDate;
        const end = leave.endDate > endOfMonth ? endOfMonth : leave.endDate;
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        leaveDays += diffDays;
      });

      // Calculate attendance-based pay deductions
      // Absent days lose full pay. Halfdays lose 0.5 pay. 4 late marks lose 1 full day pay.
      const dailyRate = config.basicSalary / totalDaysInMonth;
      const absentDeduction = dailyRate * absentDays;
      const halfDayDeduction = dailyRate * (halfDays * 0.5);
      const lateDeduction = dailyRate * Math.floor(lateDays / 4);
      const leaveDeduction = absentDeduction + halfDayDeduction + lateDeduction;

      // 4. Fetch dynamic allowances/bonuses/deductions scheduled for this period
      const pendingAllowances = await Allowance.find({
        teacherId: teacher._id,
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'pending',
        isDeleted: false
      });
      const dynamicAllowancesAmount = pendingAllowances.reduce((acc, curr) => acc + curr.amount, 0);

      const pendingBonuses = await Bonus.find({
        teacherId: teacher._id,
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'pending',
        isDeleted: false
      });
      const bonusesAmount = pendingBonuses.reduce((acc, curr) => acc + curr.amount, 0);

      const pendingDeductions = await Deduction.find({
        teacherId: teacher._id,
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'pending',
        isDeleted: false
      });
      const dynamicDeductionsAmount = pendingDeductions.reduce((acc, curr) => acc + curr.amount, 0);

      // Statutory deductions defined in the config (PF, ESI, Prof Tax, Income Tax)
      const structureId = config.salaryStructureId;
      const baseStructure = await payrollRepository.findSalaryStructureById(structureId);

      const pf = config.pf || 0;
      const esi = config.esi || 0;
      const profTax = config.profTax || 0;
      const incomeTax = config.incomeTax || 0;

      const basicSalary = config.basicSalary;
      const hra = config.hra || 0;
      const da = config.da || 0;
      const medicalAllowance = config.medicalAllowance || 0;
      const transportAllowance = config.transportAllowance || 0;
      const otherAllowances = config.otherAllowances || 0;

      const grossSalary = basicSalary + hra + da + medicalAllowance + transportAllowance + otherAllowances + dynamicAllowancesAmount + bonusesAmount;
      const totalDeductionForEmployee = pf + esi + profTax + incomeTax + leaveDeduction + dynamicDeductionsAmount;
      const netSalary = grossSalary - totalDeductionForEmployee;

      // Create Payslip record
      await payrollRepository.createPayslip({
        payrollId: payrollBatch._id,
        teacherId: teacher._id,
        employeeId: teacher.employeeId,
        name: `${teacher.firstName} ${teacher.lastName}`,
        department: teacher.department,
        designation: teacher.designation,
        workingDays: totalDaysInMonth,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        basicSalary,
        hra,
        da,
        medicalAllowance,
        transportAllowance,
        otherAllowances,
        allowancesAmount: dynamicAllowancesAmount,
        bonusesAmount,
        deductionsAmount: totalDeductionForEmployee,
        pf,
        esi,
        profTax,
        incomeTax,
        leaveDeduction,
        grossSalary,
        netSalary,
        status: 'pending'
      });

      // Update dynamic additions status to processed
      await Promise.all([
        Allowance.updateMany({ _id: { $in: pendingAllowances.map(a => a._id) } }, { $set: { status: 'processed' } }),
        Bonus.updateMany({ _id: { $in: pendingBonuses.map(b => b._id) } }, { $set: { status: 'processed' } }),
        Deduction.updateMany({ _id: { $in: pendingDeductions.map(d => d._id) } }, { $set: { status: 'processed' } })
      ]);

      // Aggregate batch statistics
      batchTotalAmount += grossSalary;
      batchTotalDeductions += totalDeductionForEmployee;
      batchTotalBonuses += bonusesAmount;
      batchTotalAllowances += dynamicAllowancesAmount;
      batchNetAmount += netSalary;
    }

    // Update batch totals
    payrollBatch.totalAmount = batchTotalAmount;
    payrollBatch.totalDeductions = batchTotalDeductions;
    payrollBatch.totalBonuses = batchTotalBonuses;
    payrollBatch.totalAllowances = batchTotalAllowances;
    payrollBatch.netAmount = batchNetAmount;
    await payrollBatch.save();

    return payrollBatch;
  }

  async approveMonthlyPayroll(payrollId, approvedBy = 'Admin') {
    const payroll = await payrollRepository.findPayrollBatchById(payrollId);
    if (!payroll) throw ApiError.notFound('Payroll batch not found.');

    if (payroll.status !== 'pending') {
      throw ApiError.badRequest('Only pending payroll batches can be approved.');
    }

    return payrollRepository.updatePayrollBatch(payrollId, {
      status: 'approved',
      approvedBy,
      approvedDate: new Date()
    });
  }

  async payMonthlyPayroll(payrollId, paymentMethod = 'bank_transfer') {
    const payroll = await payrollRepository.findPayrollBatchById(payrollId);
    if (!payroll) throw ApiError.notFound('Payroll batch not found.');

    if (payroll.status !== 'approved') {
      throw ApiError.badRequest('Only approved payroll batches can be paid.');
    }

    // Update payroll batch status to paid
    const updatedPayroll = await payrollRepository.updatePayrollBatch(payrollId, {
      status: 'paid',
      paymentDate: new Date()
    });

    // Update all payslips status in the batch to paid
    await Payslip.updateMany({ payrollId }, { $set: { status: 'paid', paymentMethod, paymentDate: new Date() } });

    // ─── CROSS MODULE FINANCE SYNC ───────────────────────────────────────────
    // 1. Create an Expense entry in the ledger
    await Expense.create({
      expenseName: `Monthly Staff Payroll - Month ${payroll.month}/${payroll.year}`,
      vendor: 'ERP Staff Payroll',
      category: 'salary',
      amount: payroll.netAmount,
      date: new Date().toISOString().split('T')[0],
      description: `Payroll batch disbursement for Month ${payroll.month}/${payroll.year}`
    });

    // 2. Create double-entry debit Transaction
    await Transaction.create({
      type: 'debit',
      debitAmount: payroll.netAmount,
      creditAmount: 0,
      ledgerAccount: 'Salary Expense Account',
      reference: `PAY-BATCH-${payrollId}`,
      remarks: `Paid total net staff payroll of $${payroll.netAmount} for Month ${payroll.month}/${payroll.year}`,
      date: new Date().toISOString().split('T')[0]
    });

    return updatedPayroll;
  }

  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  async getPayrollDashboardStats() {
    return payrollRepository.getPayrollDashboardStats();
  }

  // ─── Reports ───────────────────────────────────────────────────────────────
  async getPayrollReport(queryParams) {
    const { type = 'summary', department, month, year } = queryParams;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    if (type === 'summary') {
      const batches = await Payroll.find({ isDeleted: false, ...filter }).lean();
      return batches;
    } else if (type === 'register') {
      const query = { status: 'paid' };
      if (month) query.month = Number(month);
      if (year) query.year = Number(year);
      const batches = await Payroll.find({ isDeleted: false, ...query }).lean();
      const batchIds = batches.map(b => b._id);

      const payslipFilter = { payrollId: { $in: batchIds } };
      if (department) payslipFilter.department = department;

      const payslips = await Payslip.find(payslipFilter).populate('teacherId').lean();
      return payslips;
    } else if (type === 'department') {
      const query = { status: 'paid' };
      if (month) query.month = Number(month);
      if (year) query.year = Number(year);
      const batches = await Payroll.find({ isDeleted: false, ...query }).lean();
      const batchIds = batches.map(b => b._id);

      const payslips = await Payslip.aggregate([
        { $match: { payrollId: { $in: batchIds } } },
        {
          $group: {
            _id: '$department',
            totalCost: { $sum: '$netSalary' },
            count: { $sum: 1 }
          }
        }
      ]);
      return payslips;
    }
    return [];
  }
}

module.exports = new PayrollService();
