const express = require('express');
const teacherPortalController = require('./teacher-portal.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();

// Enforce teacher authentication
router.use(authenticate);
router.use(authorizeRoles(ROLES.TEACHER));

// Profile and Settings
router.get('/profile', teacherPortalController.getProfile);
router.put('/profile', teacherPortalController.updateProfile);
router.put('/change-password', teacherPortalController.changePassword);

// Announcements & School Circulars
router.get('/announcements', teacherPortalController.getAnnouncements);

// Leaves management
router.post('/leave', teacherPortalController.applyLeave);
router.get('/leave-history', teacherPortalController.getLeaveHistory);
router.put('/leave/:id', teacherPortalController.updateLeave);
router.delete('/leave/:id', teacherPortalController.cancelLeave);

// Payslip details
router.get('/payslips', teacherPortalController.getPayslips);
router.get('/payroll-history', teacherPortalController.getPayrollHistory);

// Documents & Qualifications
router.get('/documents', teacherPortalController.getDocuments);

// Analytics Reports
router.get('/reports', teacherPortalController.getReports);

// Parent & Student Chat messaging
router.get('/conversations', teacherPortalController.getChatConversations);
router.get('/messages', teacherPortalController.getMessages);
router.post('/chat', teacherPortalController.postChatMessage);

module.exports = router;
