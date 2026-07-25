const communicationService = require('./communication.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

class CommunicationController {
  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await communicationService.getDashboardStats();
    return sendSuccess(res, 'Communication dashboard statistics fetched successfully.', stats);
  });

  // ─── Announcements ─────────────────────────────────────────────────────────
  getAnnouncements = asyncHandler(async (req, res) => {
    const list = await communicationService.getAnnouncements();
    return sendSuccess(res, 'Announcements fetched successfully.', list);
  });

  createAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await communicationService.createAnnouncement(req.body);
    return sendCreated(res, 'Announcement created successfully.', announcement);
  });

  updateAnnouncement = asyncHandler(async (req, res) => {
    const updated = await communicationService.updateAnnouncement(req.params.id, req.body);
    return sendSuccess(res, 'Announcement updated successfully.', updated);
  });

  deleteAnnouncement = asyncHandler(async (req, res) => {
    await communicationService.deleteAnnouncement(req.params.id);
    return sendSuccess(res, 'Announcement deleted successfully.');
  });

  // ─── Notices ───────────────────────────────────────────────────────────────
  getNotices = asyncHandler(async (req, res) => {
    const list = await communicationService.getNotices();
    return sendSuccess(res, 'Notices fetched successfully.', list);
  });

  createNotice = asyncHandler(async (req, res) => {
    const notice = await communicationService.createNotice(req.body);
    return sendCreated(res, 'Notice created successfully.', notice);
  });

  updateNotice = asyncHandler(async (req, res) => {
    const updated = await communicationService.updateNotice(req.params.id, req.body);
    return sendSuccess(res, 'Notice updated successfully.', updated);
  });

  deleteNotice = asyncHandler(async (req, res) => {
    await communicationService.deleteNotice(req.params.id);
    return sendSuccess(res, 'Notice deleted successfully.');
  });

  // ─── Events ────────────────────────────────────────────────────────────────
  getEvents = asyncHandler(async (req, res) => {
    const list = await communicationService.getEvents();
    return sendSuccess(res, 'Events fetched successfully.', list);
  });

  createEvent = asyncHandler(async (req, res) => {
    const event = await communicationService.createEvent(req.body);
    return sendCreated(res, 'Event created successfully and notifications broadcasted.', event);
  });

  updateEvent = asyncHandler(async (req, res) => {
    const updated = await communicationService.updateEvent(req.params.id, req.body);
    return sendSuccess(res, 'Event updated successfully.', updated);
  });

  deleteEvent = asyncHandler(async (req, res) => {
    await communicationService.deleteEvent(req.params.id);
    return sendSuccess(res, 'Event deleted successfully.');
  });

  // ─── Templates ─────────────────────────────────────────────────────────────
  getTemplates = asyncHandler(async (req, res) => {
    const list = await communicationService.getTemplates();
    return sendSuccess(res, 'Templates fetched successfully.', list);
  });

  createTemplate = asyncHandler(async (req, res) => {
    const template = await communicationService.createTemplate(req.body);
    return sendCreated(res, 'Template created successfully.', template);
  });

  updateTemplate = asyncHandler(async (req, res) => {
    const updated = await communicationService.updateTemplate(req.params.id, req.body);
    return sendSuccess(res, 'Template updated successfully.', updated);
  });

  deleteTemplate = asyncHandler(async (req, res) => {
    await communicationService.deleteTemplate(req.params.id);
    return sendSuccess(res, 'Template deleted successfully.');
  });

  // ─── SMS, Email & Notifications ───────────────────────────────────────────
  getNotifications = asyncHandler(async (req, res) => {
    const list = await communicationService.getNotifications();
    return sendSuccess(res, 'Push notifications fetched successfully.', list);
  });

  markNotificationRead = asyncHandler(async (req, res) => {
    const updated = await communicationService.markNotificationRead(req.params.id);
    return sendSuccess(res, 'Notification marked as read.', updated);
  });

  getHistoryLogs = asyncHandler(async (req, res) => {
    const history = await communicationService.getHistoryLogs();
    return sendSuccess(res, 'Communication logs history retrieved successfully.', history);
  });

  sendBulkSMS = asyncHandler(async (req, res) => {
    const report = await communicationService.sendBulkSMS(req.body);
    return sendSuccess(res, 'Bulk SMS campaign dispatched successfully.', report);
  });

  sendBulkEmail = asyncHandler(async (req, res) => {
    const report = await communicationService.sendBulkEmail(req.body);
    return sendSuccess(res, 'Bulk Email campaign dispatched successfully.', report);
  });
}

module.exports = new CommunicationController();
