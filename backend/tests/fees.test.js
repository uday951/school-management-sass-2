const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('Fees & Billing Module API Integration', () => {
  let categoryId = null;
  let structureId = null;
  let studentFeeId = null;
  let paymentId = null;

  it('POST /api/v1/fees/categories - should create a fee category', async () => {
    const res = await request(app)
      .post('/api/v1/fees/categories')
      .send({
        name: 'Tuition Fees',
        description: 'Standard term tuition fees configuration'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    categoryId = res.body.data._id;
  });

  it('GET /api/v1/fees/categories - should list categories', async () => {
    const res = await request(app).get('/api/v1/fees/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/fees/structures - should create a fee structure', async () => {
    if (!categoryId) return;
    const res = await request(app)
      .post('/api/v1/fees/structures')
      .send({
        academicYear: '2026-2027',
        class: 'Grade 10',
        category: categoryId,
        amount: 5000,
        dueDate: '2026-09-30',
        lateFee: 200
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    structureId = res.body.data._id;
  });

  it('GET /api/v1/fees/structures - should list structures', async () => {
    const res = await request(app).get('/api/v1/fees/structures');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/fees/student-fees - should return student fees mappings list', async () => {
    const res = await request(app).get('/api/v1/fees/student-fees');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    
    // Create a mock student fee mapping for payment collection tests if none exist
    if (res.body.data.length > 0) {
      studentFeeId = res.body.data[0]._id;
    } else {
      const mockStudentId = new mongoose.Types.ObjectId().toString();
      const StudentFee = mongoose.model('StudentFee');
      const sf = await StudentFee.create({
        studentId: mockStudentId,
        feeStructureId: structureId || new mongoose.Types.ObjectId().toString(),
        amount: 5000,
        totalAmount: 5000,
        pendingAmount: 5000,
        status: 'unpaid'
      });
      studentFeeId = sf._id.toString();
    }
  });

  it('POST /api/v1/fees/payments - should collect a fee payment', async () => {
    if (!studentFeeId) return;
    const res = await request(app)
      .post('/api/v1/fees/payments')
      .send({
        studentFeeId,
        amount: 1500,
        method: 'upi',
        transactionId: 'TXN-998811'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('payment');
    expect(res.body.data).toHaveProperty('receipt');
  });

  it('GET /api/v1/fees/reports - should compile dynamic reports ledger summaries', async () => {
    const res = await request(app).get('/api/v1/fees/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalInvoiced');
    expect(res.body.data).toHaveProperty('totalCollected');
    expect(res.body.data).toHaveProperty('totalOutstanding');
  });
});
