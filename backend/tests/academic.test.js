const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Class = require('../src/modules/academic/class.model');
const Subject = require('../src/modules/academic/subject.model');
const User = require('../src/modules/user/user.model');
const { connectDB } = require('../config/database');

describe('Academic Module API (Class Registers & Subject Setup)', () => {
  let testTeacher;

  beforeAll(async () => {
    try {
      await connectDB();
      if (mongoose.connection.readyState === 1) {
        await Class.deleteMany({});
        await Subject.deleteMany({});
        await User.deleteMany({});

        // Seed test teacher
        testTeacher = await User.create({
          name: 'Sarah Jenkins',
          email: 's.jenkins@school.edu',
          role: 'teacher',
          department: 'Mathematics'
        });
      }
    } catch (_err) {
      // Ignore connection error if db unavailable
    }
  });

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await Class.deleteMany({});
        await Subject.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
      }
    } catch (_err) {
      // Ignore cleanup error
    }
  });

  describe('1. CLASS REGISTER APIs', () => {
    let createdClassId;

    it('POST /api/v1/classes - should create a new class register', async () => {
      const payload = {
        className: 'Grade 10-A',
        classCode: 'G10A',
        capacity: 35,
        roomNumber: 'Room 101',
        teacherId: testTeacher._id.toString(),
        status: 'ACTIVE'
      };

      const res = await request(app).post('/api/v1/classes').send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.className).toBe('Grade 10-A');
      expect(res.body.data.classCode).toBe('G10A');
      expect(res.body.data.capacity).toBe(35);

      createdClassId = res.body.data._id;
    });

    it('POST /api/v1/classes - should reject duplicate classCode', async () => {
      const payload = {
        className: 'Grade 10-A Duplicate',
        classCode: 'G10A',
        capacity: 30,
        roomNumber: 'Room 102'
      };

      const res = await request(app).post('/api/v1/classes').send(payload);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('POST /api/v1/classes - should reject invalid capacity', async () => {
      const payload = {
        className: 'Grade 10-B',
        classCode: 'G10B',
        capacity: -5,
        roomNumber: 'Room 102'
      };

      const res = await request(app).post('/api/v1/classes').send(payload);

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/classes - should return paginated list of classes', async () => {
      const res = await request(app).get('/api/v1/classes?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.pagination).toHaveProperty('totalCount');
    });

    it('GET /api/v1/classes - should search by name or code', async () => {
      const res = await request(app).get('/api/v1/classes?search=G10A');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].classCode).toBe('G10A');
    });

    it('GET /api/v1/classes/:id - should return details for valid class ID', async () => {
      const res = await request(app).get(`/api/v1/classes/${createdClassId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdClassId);
    });

    it('PUT /api/v1/classes/:id - should update class details', async () => {
      const updatePayload = {
        capacity: 40,
        roomNumber: 'Room 101-Renovated'
      };

      const res = await request(app)
        .put(`/api/v1/classes/${createdClassId}`)
        .send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.capacity).toBe(40);
      expect(res.body.data.roomNumber).toBe('Room 101-Renovated');
    });

    it('DELETE /api/v1/classes/:id - should soft delete class', async () => {
      const res = await request(app).delete(`/api/v1/classes/${createdClassId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify soft deletion (must not appear in GET /classes)
      const listRes = await request(app).get('/api/v1/classes');
      expect(listRes.body.data.some((c) => c._id === createdClassId)).toBe(false);
    });
  });

  describe('2. SUBJECT SETUP APIs', () => {
    let createdSubjectId;
    let validClass;

    beforeAll(async () => {
      if (mongoose.connection.readyState === 1) {
        validClass = await Class.create({
          className: 'Grade 11-A',
          classCode: 'G11A',
          capacity: 30,
          roomNumber: 'Room 201'
        });
      }
    });

    it('POST /api/v1/subjects - should create a new subject', async () => {
      const payload = {
        subjectName: 'Advanced Algebra',
        subjectCode: 'MTH-401',
        department: 'Mathematics',
        credits: 4,
        description: 'Trigonometry and algebraic equations',
        status: 'ACTIVE',
        teacher: testTeacher._id.toString(),
        classes: [validClass._id.toString()]
      };

      const res = await request(app).post('/api/v1/subjects').send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.subjectName).toBe('Advanced Algebra');
      expect(res.body.data.subjectCode).toBe('MTH-401');

      createdSubjectId = res.body.data._id;
    });

    it('POST /api/v1/subjects - should reject duplicate subjectCode', async () => {
      const payload = {
        subjectName: 'Algebra II',
        subjectCode: 'MTH-401',
        department: 'Mathematics',
        credits: 3
      };

      const res = await request(app).post('/api/v1/subjects').send(payload);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('GET /api/v1/subjects - should return paginated list of subjects with filters', async () => {
      const res = await request(app).get('/api/v1/subjects?department=Mathematics&status=ACTIVE');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].department).toBe('Mathematics');
    });

    it('GET /api/v1/subjects/:id - should return single subject details', async () => {
      const res = await request(app).get(`/api/v1/subjects/${createdSubjectId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdSubjectId);
    });

    it('PATCH /api/v1/subjects/:id/status - should toggle subject status', async () => {
      const res = await request(app)
        .patch(`/api/v1/subjects/${createdSubjectId}/status`)
        .send({ status: 'INACTIVE' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('INACTIVE');
    });

    it('PUT /api/v1/subjects/:id/assign - should update teacher and class assignments', async () => {
      const res = await request(app)
        .put(`/api/v1/subjects/${createdSubjectId}/assign`)
        .send({
          teacher: testTeacher._id.toString(),
          classes: [validClass._id.toString()]
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/subjects/:id - should soft delete subject', async () => {
      const res = await request(app).delete(`/api/v1/subjects/${createdSubjectId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const listRes = await request(app).get('/api/v1/subjects');
      expect(listRes.body.data.some((s) => s._id === createdSubjectId)).toBe(false);
    });
  });
});
