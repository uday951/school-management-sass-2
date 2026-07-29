const express = require('express');
const teacherController = require('./teacher.controller');
const {
  createTeacherSchema,
  updateTeacherSchema,
  createDepartmentSchema,
  createDesignationSchema,
  addQualificationSchema,
  addExperienceSchema,
  recordAttendanceSchema,
  requestLeaveSchema
} = require('./teacher.validator');
const { validate } = require('../../middlewares/validation.middleware');
const { uploadDocument } = require('../../middlewares/upload.middleware');

const router = express.Router();

// ─── TEACHER PORTAL DEDICATED FEATURE ENDPOINTS ──────────────────────────────
router.get('/dashboard', teacherController.getDashboard);
router.get('/classes', teacherController.getClasses);
router.get('/students', teacherController.getStudents);
router.get('/schedule', teacherController.getSchedule);
router.get('/calendar', teacherController.getCalendar);

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
router.get('/departments', teacherController.getDepartments);
router.post('/departments', createDepartmentSchema, validate, teacherController.createDepartment);
router.put('/departments/:id', teacherController.updateDepartment);
router.delete('/departments/:id', teacherController.deleteDepartment);

// ─── DESIGNATIONS ────────────────────────────────────────────────────────────
router.get('/designations', teacherController.getDesignations);
router.post('/designations', createDesignationSchema, validate, teacherController.createDesignation);
router.put('/designations/:id', teacherController.updateDesignation);
router.delete('/designations/:id', teacherController.deleteDesignation);

// ─── LEAVE MANAGEMENT (GLOBAL) ────────────────────────────────────────────────
router.get('/leaves', teacherController.getLeaveRequests);
router.put('/leaves/:leaveId/status', teacherController.updateLeaveStatus);

// ─── TEACHER DIRECTORY & CRUD ────────────────────────────────────────────────
router.get('/', teacherController.getTeachers);
router.post('/', createTeacherSchema, validate, teacherController.createTeacher);
router.get('/:id', teacherController.getTeacherById);
router.get('/:id/profile', teacherController.getTeacherProfile);
router.put('/:id', updateTeacherSchema, validate, teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);
router.patch('/:id/status', teacherController.toggleTeacherStatus);

// ─── TEACHER SUB-RESOURCES ────────────────────────────────────────────────────
router.post('/:id/qualifications', addQualificationSchema, validate, teacherController.addQualification);
router.delete('/:id/qualifications/:qualId', teacherController.deleteQualification);

router.post('/:id/experiences', addExperienceSchema, validate, teacherController.addExperience);
router.delete('/:id/experiences/:expId', teacherController.deleteExperience);

router.post('/:id/documents', uploadDocument.single('document'), teacherController.uploadDocument);
router.delete('/:id/documents/:docId', teacherController.deleteDocument);

router.post('/:id/assign-class', teacherController.assignClasses);
router.post('/:id/assign-subject', teacherController.assignSubjects);

router.post('/:id/attendance', recordAttendanceSchema, validate, teacherController.recordAttendance);
router.get('/:id/attendance', teacherController.getAttendanceHistory);

router.post('/:id/leave', requestLeaveSchema, validate, teacherController.requestLeave);

module.exports = router;
