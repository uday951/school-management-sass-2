const request = require('supertest');
const app = require('../src/app');

describe('Student Module Endpoints API Integration', () => {
  let createdStudentId = null;

  it('GET /api/v1/students - should return paginated list of students', async () => {
    const res = await request(app).get('/api/v1/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/v1/students/admissions/next-number - should generate unique admission number', async () => {
    const res = await request(app).get('/api/v1/students/admissions/next-number');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('admissionNo');
  });

  it('POST /api/v1/students/admissions - should create a new student admission', async () => {
    const payload = {
      admissionNumber: `ADM${Math.floor(1000 + Math.random() * 9000)}`,
      admissionDate: '2026-07-01',
      rollNumber: '109',
      firstName: 'IntegrationTest',
      lastName: 'Student',
      studentClass: 'Grade 10',
      section: 'A',
      dob: '2011-05-15',
      gender: 'male',
      fatherName: 'Test Father',
      phone: '(555) 123-4567'
    };

    const res = await request(app).post('/api/v1/students/admissions').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    createdStudentId = res.body.data.id;
  });

  it('GET /api/v1/students/:id/profile - should return aggregated student profile', async () => {
    if (!createdStudentId) return;

    const res = await request(app).get(`/api/v1/students/${createdStudentId}/profile`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('parentDetails');
    expect(res.body.data).toHaveProperty('medicalRecords');
    expect(res.body.data).toHaveProperty('attendanceSummary');
  });

  it('POST /api/v1/students/:id/certificates - should issue a bonafide certificate', async () => {
    if (!createdStudentId) return;

    const res = await request(app)
      .post(`/api/v1/students/${createdStudentId}/certificates`)
      .send({ type: 'bonafide' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificate).toHaveProperty('title', 'BONAFIDE CERTIFICATE');
  });

  it('GET /api/v1/students/:id/id-card - should return ID Card payload', async () => {
    if (!createdStudentId) return;

    const res = await request(app).get(`/api/v1/students/${createdStudentId}/id-card`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('idCard');
  });
});
