const request = require('supertest');
const app = require('../src/app');

describe('Attendance Module API Integration', () => {
  it('GET /api/v1/attendance/student - should return student register list', async () => {
    const res = await request(app).get('/api/v1/attendance/student?class=Grade%2010&section=A');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/attendance/student - should mark student attendance', async () => {
    const payload = {
      studentId: '60d01b123432ab34523912a1',
      date: new Date().toISOString(),
      status: 'present',
      remarks: 'Test check-in'
    };

    const res = await request(app).post('/api/v1/attendance/student').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/attendance/teacher - should return teacher register list', async () => {
    const res = await request(app).get('/api/v1/attendance/teacher');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/attendance/teacher - should mark teacher attendance', async () => {
    const payload = {
      teacherId: 'T001',
      date: new Date().toISOString(),
      status: 'present',
      remarks: 'Test check-in'
    };

    const res = await request(app).post('/api/v1/attendance/teacher').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/attendance/report - should fetch attendance report summary', async () => {
    const res = await request(app).get('/api/v1/attendance/report?type=student&class=Grade%2010&section=A');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/holidays - should create a holiday', async () => {
    const payload = {
      title: 'New Year Day Test',
      date: '2027-01-01',
      description: 'First day of the calendar year'
    };

    const res = await request(app).post('/api/v1/holidays').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/holidays - should return holidays list', async () => {
    const res = await request(app).get('/api/v1/holidays');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
