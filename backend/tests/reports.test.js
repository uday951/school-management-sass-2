const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('Reports & Analytics Module API Integration Tests', () => {
  let templateId = null;

  it('GET /api/v1/reports/dashboard - should compile BI analytics dashboard indicators', async () => {
    const res = await request(app).get('/api/v1/reports/dashboard');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalStudents');
    expect(res.body.data).toHaveProperty('attendancePercentage');
    expect(res.body.data).toHaveProperty('feeSummary');
  });

  it('POST /api/v1/reports/templates - should create a custom report template configuration', async () => {
    const res = await request(app)
      .post('/api/v1/reports/templates')
      .send({
        name: 'Active Students Roster',
        category: 'students',
        columns: ['admissionNo', 'name', 'class', 'status'],
        filters: { status: 'active' }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    templateId = res.body.data._id;
  });

  it('GET /api/v1/reports/templates - should return saved report templates list', async () => {
    const res = await request(app).get('/api/v1/reports/templates');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/reports/custom - should compile custom report records output', async () => {
    const res = await request(app)
      .post('/api/v1/reports/custom')
      .send({
        category: 'students',
        columns: ['admissionNo', 'name', 'class', 'status'],
        filters: { status: 'active' }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('records');
    expect(Array.isArray(res.body.data.records)).toBe(true);
  });

  it('GET /api/v1/reports/export - should fetch printable report files stream', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export')
      .query({ format: 'csv', category: 'students' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('AdmissionNo,Name,Class,Section,Status');
  });
});
