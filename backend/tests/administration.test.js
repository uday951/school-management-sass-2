const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('User Management & Settings Module API Integration Tests', () => {
  let userId = null;
  let roleId = null;
  let departmentId = null;

  afterAll(async () => {
    // Clean up created entities
    const User = mongoose.models.User || mongoose.model('User');
    const Role = mongoose.models.Role || mongoose.model('Role');
    const Department = mongoose.models.Department || mongoose.model('Department');
    const BackupHistory = mongoose.models.BackupHistory || mongoose.model('BackupHistory');

    await User.deleteMany({ email: 'john.settings.test@school.com' });
    await Role.deleteMany({ name: 'Principal Assistant Test' });
    await Department.deleteMany({ name: 'Administrative Support Test' });
    await BackupHistory.deleteMany({ fileName: /backup_/ });
  });

  it('POST /api/v1/administration/users - should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/administration/users')
      .send({
        name: 'John Settings Test',
        email: 'john.settings.test@school.com',
        role: 'teacher',
        username: 'johnsettings',
        mobile: '1234567890'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    userId = res.body.data._id;
  });

  it('POST /api/v1/administration/users/:id/lock - should lock a user account', async () => {
    const res = await request(app).post(`/api/v1/administration/users/${userId}/lock`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('locked');
  });

  it('POST /api/v1/administration/users/:id/unlock - should unlock a user account', async () => {
    const res = await request(app).post(`/api/v1/administration/users/${userId}/unlock`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('active');
  });

  it('POST /api/v1/administration/roles - should create a custom role', async () => {
    const res = await request(app)
      .post('/api/v1/administration/roles')
      .send({
        name: 'Principal Assistant Test',
        description: 'Administrative support staff to the principal'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    roleId = res.body.data._id;
  });

  it('POST /api/v1/administration/departments - should create a new department', async () => {
    const res = await request(app)
      .post('/api/v1/administration/departments')
      .send({
        name: 'Administrative Support Test',
        code: 'ADMIN-SUPP',
        description: 'Office help and administrative runners'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    departmentId = res.body.data._id;
  });

  it('GET /api/v1/administration/system-settings - should retrieve system settings', async () => {
    const res = await request(app).get('/api/v1/administration/system-settings');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('schoolName');
  });

  it('PUT /api/v1/administration/system-settings - should update system settings parameters', async () => {
    const res = await request(app)
      .put('/api/v1/administration/system-settings')
      .send({
        schoolName: 'Modified ERP International Academy',
        currency: 'EUR'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.schoolName).toBe('Modified ERP International Academy');
  });

  it('POST /api/v1/administration/backup - should execute system database backup', async () => {
    const res = await request(app).post('/api/v1/administration/backup');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('fileName');
  });
});
