const express = require('express');
const teacherPortalController = require('./teacher-portal.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();

// All routes require teacher authentication
router.use(authenticate);
router.use(authorizeRoles(ROLES.TEACHER));

// Profile & Security Settings
router.get('/profile', teacherPortalController.getProfile);
router.put('/profile', teacherPortalController.updateProfile);
router.put('/change-password', teacherPortalController.changePassword);

// Payroll Payslips
router.get('/payslips', teacherPortalController.getPayslips);
router.get('/payroll-history', teacherPortalController.getPayrollHistory);

// School Notices
router.get('/announcements', teacherPortalController.getAnnouncements);
router.get('/notices', teacherPortalController.getNotices);

// Leave Requests Management
router.get('/leave-history', teacherPortalController.getLeaveHistory);
router.post('/leave', teacherPortalController.createLeave);
router.put('/leave/:id', teacherPortalController.updateLeave);
router.delete('/leave/:id', teacherPortalController.deleteLeave);

// Staff Digital Locker
router.get('/documents', teacherPortalController.getDocuments);

// Internal School Chats
router.get('/messages', teacherPortalController.getMessages);
router.post('/chat', teacherPortalController.createChat);

// Performance & Attendance Reports
router.get('/reports', teacherPortalController.getReports);

module.exports = router;
