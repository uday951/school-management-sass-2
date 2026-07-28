const express = require('express');
const communicationController = require('./communication.controller');
const {
  announcementSchema,
  noticeSchema,
  eventSchema,
  templateSchema,
  bulkSMSSchema,
  bulkEmailSchema
} = require('./communication.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

// ─── Dashboard Stats & Logs History ──────────────────────────────────────────
router.get('/dashboard-stats', communicationController.getDashboardStats);
router.get('/history', communicationController.getHistoryLogs);

// ─── Announcements Endpoints ─────────────────────────────────────────────────
router.get('/announcements', communicationController.getAnnouncements);
router.post('/announcements', announcementSchema, validate, communicationController.createAnnouncement);
router.put('/announcements/:id', announcementSchema, validate, communicationController.updateAnnouncement);
router.delete('/announcements/:id', communicationController.deleteAnnouncement);

// ─── Notice Board Endpoints ──────────────────────────────────────────────────
router.get('/notices', communicationController.getNotices);
router.post('/notices', noticeSchema, validate, communicationController.createNotice);
router.put('/notices/:id', noticeSchema, validate, communicationController.updateNotice);
router.delete('/notices/:id', communicationController.deleteNotice);

// ─── Events Endpoints ────────────────────────────────────────────────────────
router.get('/events', communicationController.getEvents);
router.post('/events', eventSchema, validate, communicationController.createEvent);
router.put('/events/:id', eventSchema, validate, communicationController.updateEvent);
router.delete('/events/:id', communicationController.deleteEvent);

// ─── Templates Endpoints ─────────────────────────────────────────────────────
router.get('/templates', communicationController.getTemplates);
router.post('/templates', templateSchema, validate, communicationController.createTemplate);
router.put('/templates/:id', templateSchema, validate, communicationController.updateTemplate);
router.delete('/templates/:id', communicationController.deleteTemplate);

// ─── SMS, Email & Push Notifications Campaigns ──────────────────────────────
router.get('/notifications', communicationController.getNotifications);
router.patch('/notifications/:id/read', communicationController.markNotificationRead);
router.post('/campaign/sms', bulkSMSSchema, validate, communicationController.sendBulkSMS);
router.post('/campaign/email', bulkEmailSchema, validate, communicationController.sendBulkEmail);

module.exports = router;
