const SalaryStructure = require('./models/salary-structure.model');
const SalaryComponent = require('./models/salary-component.model');
const EmployeeSalary = require('./models/employee-salary.model');
const Payroll = require('./models/payroll.model');
const Payslip = require('./models/payslip.model');
const Bonus = require('./models/bonus.model');
const Allowance = require('./models/allowance.model');
const Deduction = require('./models/deduction.model');
const Teacher = require('../teacher/models/teacher.model');

class PayrollRepository {
  // ─── Salary Structure CRUD ─────────────────────────────────────────────────
  async findSalaryStructures(filter = {}) {
    return SalaryStructure.find({ isDeleted: false, ...filter }).lean();
  }

  async findSalaryStructureById(id) {
    return SalaryStructure.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createSalaryStructure(data) {
    return SalaryStructure.create(data);
  }

  async updateSalaryStructure(id, data) {
    return SalaryStructure.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteSalaryStructure(id) {
    return SalaryStructure.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Salary Component CRUD ──────────────────────────────────────────────────
  async findSalaryComponents(filter = {}) {
    return SalaryComponent.find({ isDeleted: false, ...filter }).lean();
  }

  async findSalaryComponentById(id) {
    return SalaryComponent.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createSalaryComponent(data) {
    return SalaryComponent.create(data);
  }

  async updateSalaryComponent(id, data) {
    return SalaryComponent.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteSalaryComponent(id) {
    return SalaryComponent.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Employee Salary Configuration CRUD ──────────────────────────────────────
  async findEmployeeSalaries(filter = {}) {
    return EmployeeSalary.find({ isDeleted: false, ...filter }).populate('teacherId').populate('salaryStructureId').lean();
  }

  async findEmployeeSalaryByTeacherId(teacherId) {
    return EmployeeSalary.findOne({ teacherId, isDeleted: false }).populate('teacherId').populate('salaryStructureId').lean();
  }

  async createEmployeeSalary(data) {
    return EmployeeSalary.create(data);
  }

  async updateEmployeeSalary(teacherId, data) {
    return EmployeeSalary.findOneAndUpdate({ teacherId }, { $set: data }, { new: true, upsert: true });
  }

  // ─── Payroll Batch Run CRUD ──────────────────────────────────────────────────
  async findPayrollBatches(filter = {}) {
    return Payroll.find({ isDeleted: false, ...filter }).sort({ year: -1, month: -1 }).lean();
  }

  async findPayrollBatchById(id) {
    return Payroll.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createPayrollBatch(data) {
    return Payroll.create(data);
  }

  async updatePayrollBatch(id, data) {
    return Payroll.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  // ─── Payslips CRUD ───────────────────────────────────────────────────────────
  async findPayslips(filter = {}) {
    return Payslip.find(filter).populate('teacherId').lean();
  }

  async findPayslipById(id) {
    return Payslip.findById(id).populate('teacherId').lean();
  }

  async createPayslip(data) {
    return Payslip.create(data);
  }

  async updatePayslip(id, data) {
    return Payslip.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  // ─── Bonuses CRUD ────────────────────────────────────────────────────────────
  async findBonuses(filter = {}) {
    return Bonus.find({ isDeleted: false, ...filter }).populate('teacherId').sort({ date: -1 }).lean();
  }

  async createBonus(data) {
    return Bonus.create(data);
  }

  async updateBonus(id, data) {
    return Bonus.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteBonus(id) {
    return Bonus.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Allowances CRUD ─────────────────────────────────────────────────────────
  async findAllowances(filter = {}) {
    return Allowance.find({ isDeleted: false, ...filter }).populate('teacherId').sort({ date: -1 }).lean();
  }

  async createAllowance(data) {
    return Allowance.create(data);
  }

  async updateAllowance(id, data) {
    return Allowance.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteAllowance(id) {
    return Allowance.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Deductions CRUD ─────────────────────────────────────────────────────────
  async findDeductions(filter = {}) {
    return Deduction.find({ isDeleted: false, ...filter }).populate('teacherId').sort({ date: -1 }).lean();
  }

  async createDeduction(data) {
    return Deduction.create(data);
  }

  async updateDeduction(id, data) {
    return Deduction.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteDeduction(id) {
    return Deduction.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── High Performance BI Aggregations ─────────────────────────────────────
  async getPayrollDashboardStats() {
    const activeTeachers = await Teacher.countDocuments({ isDeleted: false, status: 'active' });
    
    const paidStats = await Payroll.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$netAmount', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$netAmount', 0] } },
          count: { $sum: 1 }
        }
      }
    ]);

    const activeSalaries = await EmployeeSalary.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalBaseCost: { $sum: '$netSalary' }
        }
      }
    ]);

    const bonusStats = await Bonus.aggregate([
      { $match: { isDeleted: false, status: 'processed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const deductionStats = await Deduction.aggregate([
      { $match: { isDeleted: false, status: 'processed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyTrends = await Payroll.aggregate([
      { $match: { isDeleted: false, status: 'paid' } },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          cost: { $sum: '$netAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const totalEmployees = activeTeachers;
    const monthlyPayrollCost = activeSalaries[0]?.totalBaseCost || 0;
    const paidPayroll = paidStats.find(s => s._id === 'paid')?.totalPaid || 0;
    const pendingPayroll = paidStats.find(s => s._id === 'approved')?.totalPending || 0;
    const totalBonuses = bonusStats[0]?.total || 0;
    const totalDeductions = deductionStats[0]?.total || 0;

    const trends = monthlyTrends.map(t => ({
      month: `${t._id.month}/${t._id.year}`,
      cost: t.cost
    }));

    return {
      totalEmployees,
      monthlyPayrollCost,
      pendingPayroll,
      paidPayroll,
      totalBonuses,
      totalDeductions,
      upcomingPayroll: monthlyPayrollCost,
      trends
    };
  }
}

module.exports = new PayrollRepository();
