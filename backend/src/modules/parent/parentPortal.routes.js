const express = require('express');
const parentPortalController = require('./parentPortal.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Protect all routes with auth middleware
router.use(authenticate);

router.get('/students', parentPortalController.getLinkedStudents);
router.get('/fees', parentPortalController.getFees);
router.get('/payments', parentPortalController.getPayments);
router.get('/receipts', parentPortalController.getReceipts);
router.get('/receipts/:id/pdf', parentPortalController.getReceiptPdf);
router.get('/announcements', parentPortalController.getAnnouncements);
router.get('/circulars', parentPortalController.getCirculars);
router.get('/notifications', parentPortalController.getNotifications);
router.patch('/notifications/:id/read', parentPortalController.markNotificationRead);
router.get('/chat/teachers', parentPortalController.getTeachersList);
router.get('/chat/messages/:teacherId', parentPortalController.getChatHistory);
router.post('/chat', parentPortalController.sendMessage);

module.exports = router;
