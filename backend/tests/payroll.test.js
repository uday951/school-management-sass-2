const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Teacher = require('../src/modules/teacher/models/teacher.model');

describe('Payroll Management Module API Integration Tests', () => {
  let teacher = null;
  let salaryStructureId = null;
  let payrollBatchId = null;

  beforeAll(async () => {
    // Create a dummy teacher for payroll tests
    teacher = await Teacher.create({
      employeeId: 'EMP-PAY-101',
      firstName: 'Jane',
      lastName: 'Doe',
      gender: 'female',
      dob: new Date('1990-01-01'),
      phone: '1234567890',
      email: 'jane.doe.test.payroll@school.com',
      department: 'Science',
      designation: 'Senior Teacher',
      joiningDate: new Date('2020-01-01')
    });
  });

  afterAll(async () => {
    // Clean up created entities
    if (teacher) {
      await Teacher.deleteOne({ _id: teacher._id });
    }
    const SalaryStructure = mongoose.models.SalaryStructure || mongoose.model('SalaryStructure');
    const EmployeeSalary = mongoose.models.EmployeeSalary || mongoose.model('EmployeeSalary');
    const Payroll = mongoose.models.Payroll || mongoose.model('Payroll');
    const Payslip = mongoose.models.Payslip || mongoose.model('Payslip');
    const Expense = mongoose.models.Expense || mongoose.model('Expense');
    const Transaction = mongoose.models.Transaction || mongoose.model('Transaction');

    await SalaryStructure.deleteMany({ name: 'Senior Teacher Test Salary Structure' });
    await EmployeeSalary.deleteMany({ teacherId: teacher?._id });
    await Payroll.deleteMany({ month: 7, year: 2026 });
    await Payslip.deleteMany({ employeeId: 'EMP-PAY-101' });
    await Expense.deleteMany({ category: 'salary' });
    await Transaction.deleteMany({ ledgerAccount: 'Salary Expense Account' });
  });

  it('POST /api/v1/payroll/structures - should create a new salary structure', async () => {
    const res = await request(app)
      .post('/api/v1/payroll/structures')
      .send({
        name: 'Senior Teacher Test Salary Structure',
        basicSalary: 3000,
        hra: 600,
        da: 300,
        medicalAllowance: 200,
        transportAllowance: 200,
        otherAllowances: 100,
        effectiveDate: new Date()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.grossSalary).toBe(4400);
    salaryStructureId = res.body.data._id;
  });

  it('GET /api/v1/payroll/structures - should list all salary structures', async () => {
    const res = await request(app).get('/api/v1/payroll/structures');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/payroll/employee-salaries - should configure salary setup for a teacher', async () => {
    const res = await request(app)
      .post('/api/v1/payroll/employee-salaries')
      .send({
        teacherId: teacher._id.toString(),
        salaryStructureId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('netSalary');
    expect(res.body.data.basicSalary).toBe(3000);
  });

  it('POST /api/v1/payroll/generate - should generate a monthly payroll batch', async () => {
    const res = await request(app)
      .post('/api/v1/payroll/generate')
      .send({
        month: 7,
        year: 2026
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.status).toBe('pending');
    payrollBatchId = res.body.data._id;
  });

  it('POST /api/v1/payroll/approve/:id - should approve monthly payroll batch run', async () => {
    const res = await request(app).post(`/api/v1/payroll/approve/${payrollBatchId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('approved');
  });

  it('POST /api/v1/payroll/pay/:id - should disburse monthly payroll batch payments and sync finance ledger', async () => {
    const res = await request(app)
      .post(`/api/v1/payroll/pay/${payrollBatchId}`)
      .send({ paymentMethod: 'bank_transfer' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('paid');

    // Verify expense double entry is automatically generated
    const Expense = mongoose.models.Expense || mongoose.model('Expense');
    const createdExpense = await Expense.findOne({ category: 'salary' });
    expect(createdExpense).toBeTruthy();

    const Transaction = mongoose.models.Transaction || mongoose.model('Transaction');
    const createdTransaction = await Transaction.findOne({ ledgerAccount: 'Salary Expense Account' });
    expect(createdTransaction).toBeTruthy();
  });

  it('GET /api/v1/payroll/dashboard-stats - should compile payroll dashboard stats', async () => {
    const res = await request(app).get('/api/v1/payroll/dashboard-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('monthlyPayrollCost');
  });
});
