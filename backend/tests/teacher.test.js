const request = require('supertest');
const app = require('../src/app');

describe('Teacher Module Endpoints API Integration', () => {
  let createdTeacherId = null;

  it('GET /api/v1/teachers - should return paginated list of teachers', async () => {
    const res = await request(app).get('/api/v1/teachers');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/v1/teachers/departments - should return list of departments', async () => {
    const res = await request(app).get('/api/v1/teachers/departments');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/teachers/designations - should return list of designations', async () => {
    const res = await request(app).get('/api/v1/teachers/designations');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/teachers - should create a new teacher record', async () => {
    const payload = {
      employeeId: `TCH${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      gender: 'female',
      dob: '1988-04-12',
      phone: '(555) 987-6543',
      email: `sarah.jenkins.${Date.now()}@school.edu`,
      department: 'Mathematics',
      designation: 'Senior Teacher',
      joiningDate: '2020-08-15',
      qualification: 'M.Sc. Mathematics',
      experienceYears: 6,
      status: 'active'
    };

    const res = await request(app).post('/api/v1/teachers').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    createdTeacherId = res.body.data._id;
  });

  it('GET /api/v1/teachers/:id/profile - should return aggregated teacher profile', async () => {
    if (!createdTeacherId) return;

    const res = await request(app).get(`/api/v1/teachers/${createdTeacherId}/profile`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('qualifications');
    expect(res.body.data).toHaveProperty('experiences');
    expect(res.body.data).toHaveProperty('documents');
  });

  it('POST /api/v1/teachers/:id/assign-class - should assign classes to teacher', async () => {
    if (!createdTeacherId) return;

    const payload = {
      assignedClasses: [
        { classId: 'cls1', className: 'Grade 10', section: 'A', isClassTeacher: true }
      ]
    };

    const res = await request(app).post(`/api/v1/teachers/${createdTeacherId}/assign-class`).send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assignedClasses.length).toBe(1);
  });
});
