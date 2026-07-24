const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Class = require('../src/modules/academic/class.model');
const Subject = require('../src/modules/academic/subject.model');
const Student = require('../src/modules/student/models/student.model');
const Exam = require('../src/modules/exam/models/exam.model');
const ExamSchedule = require('../src/modules/exam/models/exam-schedule.model');
const Marks = require('../src/modules/exam/models/marks.model');
const Grade = require('../src/modules/exam/models/grade.model');
const Result = require('../src/modules/exam/models/result.model');

describe('Exams & Grades API Endpoints', () => {
  let classObj;
  let subjectObj;
  let studentObj;

  beforeAll(async () => {
    // If DB is not connected, skip Mongoose queries
    if (mongoose.connection.readyState === 1) {
      // Clear collections
      await Class.deleteMany({});
      await Subject.deleteMany({});
      await Student.deleteMany({});
      await Exam.deleteMany({});
      await ExamSchedule.deleteMany({});
      await Marks.deleteMany({});
      await Grade.deleteMany({});
      await Result.deleteMany({});

      // Create supporting documents
      classObj = await Class.create({
        className: 'Grade 10',
        classCode: 'G10',
        capacity: 40,
        roomNumber: 'Room 101'
      });

      subjectObj = await Subject.create({
        subjectName: 'Mathematics',
        subjectCode: 'MATH',
        department: 'Science',
        credits: 4
      });

      studentObj = await Student.create({
        admissionNo: 'ADM001',
        admissionDate: new Date(),
        rollNo: '101',
        firstName: 'Alex',
        lastName: 'Rivera',
        dob: new Date(2010, 1, 1),
        gender: 'male',
        class: 'Grade 10',
        section: 'A'
      });

      // Seed standard grades setup
      await Grade.create({ gradeName: 'A+', minMarks: 90, maxMarks: 100, gpa: 4.0 });
      await Grade.create({ gradeName: 'A', minMarks: 80, maxMarks: 89, gpa: 3.5 });
      await Grade.create({ gradeName: 'B', minMarks: 70, maxMarks: 79, gpa: 3.0 });
      await Grade.create({ gradeName: 'C', minMarks: 60, maxMarks: 69, gpa: 2.0 });
      await Grade.create({ gradeName: 'D', minMarks: 50, maxMarks: 59, gpa: 1.0 });
      await Grade.create({ gradeName: 'F', minMarks: 0, maxMarks: 49, gpa: 0.0 });
    }
  });

  describe('1. Exams Cycle CRUD operations', () => {
    let examId;

    it('POST /api/v1/exams - should create a new exam cycle', async () => {
      const payload = {
        name: 'Final Term Exam',
        type: 'Annual',
        academicYear: '2026-2027',
        classId: classObj ? classObj._id.toString() : '60d01b123432ab34523912cc',
        section: 'A',
        startDate: '2026-11-01',
        endDate: '2026-11-15',
        status: 'active'
      };

      const res = await request(app)
        .post('/api/v1/exams')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', 'Final Term Exam');
      examId = res.body.data._id;
    });

    it('GET /api/v1/exams - should retrieve exams list with search/filter/pagination', async () => {
      const res = await request(app)
        .get('/api/v1/exams')
        .query({ search: 'Final', type: 'Annual' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('PUT /api/v1/exams/:id - should update the exam details', async () => {
      if (!examId) return;
      const res = await request(app)
        .put(`/api/v1/exams/${examId}`)
        .send({
          name: 'Updated Final Term Exam',
          type: 'Annual',
          academicYear: '2026-2027',
          classId: classObj ? classObj._id.toString() : '60d01b123432ab34523912cc',
          startDate: '2026-11-01',
          endDate: '2026-11-15'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', 'Updated Final Term Exam');
    });
  });

  describe('2. Exam Schedules', () => {
    let examId;
    let scheduleId;

    beforeAll(async () => {
      // Find or create an exam cycle
      const examsList = await request(app).get('/api/v1/exams');
      examId = examsList.body.data.items[0]?._id;
    });

    it('POST /api/v1/exams/schedules - should create a schedule', async () => {
      const payload = {
        examId,
        date: '2026-11-02',
        subjectId: subjectObj ? subjectObj._id.toString() : '60d01b123432ab34523912d1',
        classId: classObj ? classObj._id.toString() : '60d01b123432ab34523912cc',
        section: 'A',
        time: '09:00 AM - 12:00 PM',
        hall: 'Examination Hall 1'
      };

      const res = await request(app)
        .post('/api/v1/exams/schedules')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      scheduleId = res.body.data._id;
    });

    it('POST /api/v1/exams/schedules - should reject scheduling conflict for same class & time', async () => {
      const payload = {
        examId,
        date: '2026-11-02',
        subjectId: subjectObj ? subjectObj._id.toString() : '60d01b123432ab34523912d1',
        classId: classObj ? classObj._id.toString() : '60d01b123432ab34523912cc',
        section: 'A',
        time: '09:00 AM - 12:00 PM',
        hall: 'Hall 2'
      };

      const res = await request(app)
        .post('/api/v1/exams/schedules')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Marks Entry & Grade Setup', () => {
    let examId;

    beforeAll(async () => {
      const examsList = await request(app).get('/api/v1/exams');
      examId = examsList.body.data.items[0]?._id;
    });

    it('POST /api/v1/exams/marks - should save marks and auto-determine letter grade', async () => {
      const payload = {
        studentId: studentObj ? studentObj._id.toString() : '60d01b123432ab34523912a1',
        examId,
        subjectId: subjectObj ? subjectObj._id.toString() : '60d01b123432ab34523912d1',
        marksObtained: 85,
        maxMarks: 100,
        remarks: 'Great effort'
      };

      const res = await request(app)
        .post('/api/v1/exams/marks')
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('grade', 'A');
    });

    it('POST /api/v1/exams/marks - validation check for negative marks', async () => {
      const payload = {
        studentId: studentObj ? studentObj._id.toString() : '60d01b123432ab34523912a1',
        examId,
        subjectId: subjectObj ? subjectObj._id.toString() : '60d01b123432ab34523912d1',
        marksObtained: -10,
        maxMarks: 100
      };

      const res = await request(app)
        .post('/api/v1/exams/marks')
        .send(payload);

      expect(res.statusCode).toBe(422);
    });
  });

  describe('4. Result Processing, Publishing & Report Card', () => {
    let examId;
    let studentId;

    beforeAll(async () => {
      const examsList = await request(app).get('/api/v1/exams');
      examId = examsList.body.data.items[0]?._id;
      studentId = studentObj ? studentObj._id.toString() : '60d01b123432ab34523912a1';
    });

    it('POST /api/v1/exams/results/process - should process results and assign rank', async () => {
      const res = await request(app)
        .post('/api/v1/exams/results/process')
        .send({ examId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('processedCount');
    });

    it('GET /api/v1/exams/results/all - should retrieve rank lists', async () => {
      const res = await request(app)
        .get('/api/v1/exams/results/all')
        .query({ examId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0]).toHaveProperty('rank', 1);
      expect(res.body.data.items[0]).toHaveProperty('gpa');
    });

    it('POST /api/v1/exams/publish-results - should toggle publish status', async () => {
      const res = await request(app)
        .post('/api/v1/exams/publish-results')
        .send({ examId, isPublished: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/exams/report-card/details - should fetch student report card data', async () => {
      const res = await request(app)
        .get('/api/v1/exams/report-card/details')
        .query({ studentId, examId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('student');
      expect(res.body.data).toHaveProperty('result');
      expect(res.body.data).toHaveProperty('subjectMarks');
    });
  });
});
