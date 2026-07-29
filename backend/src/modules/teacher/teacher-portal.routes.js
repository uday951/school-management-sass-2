const express = require('express');
const teacherPortalController = require('./teacher-portal.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();

// All routes require teacher authentication
router.use(authenticate);
router.use(authorizeRoles(ROLES.TEACHER));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', teacherPortalController.getDashboard);

// ─── My Classes & Students ────────────────────────────────────────────────────
router.get('/my-classes', teacherPortalController.getMyClasses);
router.get('/my-students', teacherPortalController.getMyStudents);

// ─── Profile & Security ───────────────────────────────────────────────────────
router.get('/profile', teacherPortalController.getProfile);
router.put('/profile', teacherPortalController.updateProfile);
router.put('/change-password', teacherPortalController.changePassword);

// ─── Payroll Payslips ─────────────────────────────────────────────────────────
router.get('/payslips', teacherPortalController.getPayslips);
router.get('/payroll-history', teacherPortalController.getPayrollHistory);

// ─── School Notices ───────────────────────────────────────────────────────────
router.get('/announcements', teacherPortalController.getAnnouncements);
router.get('/notices', teacherPortalController.getNotices);

// ─── Leave Requests ───────────────────────────────────────────────────────────
router.get('/leave-history', teacherPortalController.getLeaveHistory);
router.post('/leave', teacherPortalController.createLeave);
router.put('/leave/:id', teacherPortalController.updateLeave);
router.delete('/leave/:id', teacherPortalController.deleteLeave);

// ─── Documents ────────────────────────────────────────────────────────────────
router.get('/documents', teacherPortalController.getDocuments);

// ─── Messaging ────────────────────────────────────────────────────────────────
router.get('/messages', teacherPortalController.getMessages);
router.post('/chat', teacherPortalController.createChat);

// ─── Homework CRUD ────────────────────────────────────────────────────────────
router.get('/homework', teacherPortalController.getHomework);
router.post('/homework', teacherPortalController.createHomework);
router.put('/homework/:id', teacherPortalController.updateHomework);
router.delete('/homework/:id', teacherPortalController.deleteHomework);
router.get('/homework/:id/submissions', teacherPortalController.getHomeworkSubmissions);
router.put('/homework/:id/submissions/:studentId', teacherPortalController.evaluateSubmission);

// ─── Exams & Marks ────────────────────────────────────────────────────────────
router.get('/exams', teacherPortalController.getExams);
router.get('/marks', teacherPortalController.getMarks);
router.post('/marks', teacherPortalController.saveMarks);

// ─── Reports ──────────────────────────────────────────────────────────────────
router.get('/reports', teacherPortalController.getReports);

module.exports = router;
