const express = require('express');
const c = require('./parent-portal.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();
router.use(authenticate);
router.use(authorizeRoles(ROLES.PARENT));

// Profile
router.get('/my-profile', c.getMyProfile);
router.put('/my-profile', c.updateMyProfile);
router.put('/change-password', c.changePassword);

// Children
router.get('/my-children', c.getMyChildren);

// Fees & Payments (new)
router.get('/fees', c.getChildFees);
router.get('/payments', c.getChildPayments);
router.get('/receipts', c.getChildReceipts);

// Announcements & Notices
router.get('/announcements', c.getAnnouncements);
router.get('/notices', c.getNotices);

// Notifications (new)
router.get('/notifications', c.getNotifications);
router.patch('/notifications/:id/read', c.markNotificationRead);

// Chat (new)
router.get('/chat/teachers', c.getChatTeachers);
router.get('/chat/messages/:teacherId', c.getChatMessages);
router.post('/chat', c.sendChatMessage);

// Child-specific routes
router.get('/child/:studentId/summary', c.getChildSummary);
router.get('/child/:studentId/attendance', c.getChildAttendance);
router.get('/child/:studentId/homework', c.getChildHomework);
router.get('/child/:studentId/results', c.getChildResults);
router.get('/child/:studentId/report-card', c.getChildReportCard);
router.get('/child/:studentId/library', c.getChildLibrary);
router.get('/child/:studentId/documents', c.getChildDocuments);
router.get('/child/:studentId/transport', c.getChildTransport);
router.get('/child/:studentId/timetable', c.getChildTimetable);
router.get('/child/:studentId/performance', c.getChildPerformance);

module.exports = router;
