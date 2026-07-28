const communicationRepository = require('./communication.repository');
const notificationService = require('./notification.service');
const ApiError = require('../../utils/apiError.util');
const Teacher = require('../teacher/models/teacher.model');
const Student = require('../student/models/student.model');

class CommunicationService {
  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  async getDashboardStats() {
    return communicationRepository.getDashboardStats();
  }

  // ─── Announcements CRUD ────────────────────────────────────────────────────
  async getAnnouncements() {
    return communicationRepository.findAnnouncements();
  }

  async createAnnouncement(data) {
    if (!data.title || !data.content) {
      throw ApiError.badRequest('Title and content are required.');
    }
    return communicationRepository.createAnnouncement(data);
  }

  async updateAnnouncement(id, data) {
    const announcement = await communicationRepository.findAnnouncementById(id);
    if (!announcement) throw ApiError.notFound('Announcement not found.');
    return communicationRepository.updateAnnouncement(id, data);
  }

  async deleteAnnouncement(id) {
    const announcement = await communicationRepository.findAnnouncementById(id);
    if (!announcement) throw ApiError.notFound('Announcement not found.');
    return communicationRepository.softDeleteAnnouncement(id);
  }

  // ─── Notices CRUD ──────────────────────────────────────────────────────────
  async getNotices() {
    return communicationRepository.findNotices();
  }

  async createNotice(data) {
    if (!data.title || !data.content) {
      throw ApiError.badRequest('Title and content are required.');
    }
    return communicationRepository.createNotice(data);
  }

  async updateNotice(id, data) {
    const notice = await communicationRepository.findNoticeById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    return communicationRepository.updateNotice(id, data);
  }

  async deleteNotice(id) {
    const notice = await communicationRepository.findNoticeById(id);
    if (!notice) throw ApiError.notFound('Notice not found.');
    return communicationRepository.softDeleteNotice(id);
  }

  // ─── Events CRUD ───────────────────────────────────────────────────────────
  async getEvents() {
    return communicationRepository.findEvents();
  }

  async createEvent(data) {
    if (!data.name || !data.venue || !data.date || !data.time) {
      throw ApiError.badRequest('Name, venue, date, and time are required.');
    }
    const event = await communicationRepository.createEvent(data);
    
    // Automatically trigger notification for event creation
    await notificationService.sendEventCreated(event);
    
    return event;
  }

  async updateEvent(id, data) {
    const event = await communicationRepository.findEventById(id);
    if (!event) throw ApiError.notFound('Event not found.');
    return communicationRepository.updateEvent(id, data);
  }

  async deleteEvent(id) {
    const event = await communicationRepository.findEventById(id);
    if (!event) throw ApiError.notFound('Event not found.');
    return communicationRepository.softDeleteEvent(id);
  }

  // ─── Templates CRUD ────────────────────────────────────────────────────────
  async getTemplates() {
    return communicationRepository.findTemplates();
  }

  async createTemplate(data) {
    if (!data.name || !data.type || !data.content) {
      throw ApiError.badRequest('Name, type, and content are required.');
    }
    return communicationRepository.createTemplate(data);
  }

  async updateTemplate(id, data) {
    const template = await communicationRepository.findTemplateById(id);
    if (!template) throw ApiError.notFound('Template not found.');
    return communicationRepository.updateTemplate(id, data);
  }

  async deleteTemplate(id) {
    const template = await communicationRepository.findTemplateById(id);
    if (!template) throw ApiError.notFound('Template not found.');
    return communicationRepository.softDeleteTemplate(id);
  }

  // ─── SMS, Email Campaigns & Notifications ─────────────────────────────────
  async getNotifications() {
    return communicationRepository.findNotifications();
  }

  async markNotificationRead(id) {
    return communicationRepository.markNotificationRead(id);
  }

  async getHistoryLogs() {
    return communicationRepository.findHistoryLogs();
  }

  async sendBulkSMS(payload) {
    const { targetAudience, message, customPhoneNumbers = [] } = payload;
    if (!message) {
      throw ApiError.badRequest('SMS message text content is required.');
    }

    let recipients = [];
    if (targetAudience === 'teacher') {
      recipients = await Teacher.find({ isDeleted: false, status: 'active' }).lean();
    } else if (targetAudience === 'student') {
      recipients = await Student.find({ isDeleted: false }).lean();
    } else if (targetAudience === 'custom') {
      recipients = customPhoneNumbers.map((phone, idx) => ({ _id: null, phone, firstName: `CustomRecip-${idx}`, lastName: '' }));
    }

    let successCount = 0;
    let failedCount = 0;

    for (const rec of recipients) {
      const phone = rec.phone || rec.recipientPhone || '9999999999';
      try {
        await communicationRepository.createSMSLog({
          recipientId: rec._id,
          recipientPhone: phone,
          message,
          status: 'delivered',
          type: 'bulk'
        });
        successCount++;
      } catch (err) {
        failedCount++;
      }
    }

    await communicationRepository.createHistoryLog({
      type: 'sms',
      sender: 'Admin Campaign manager',
      recipientCount: recipients.length,
      successCount,
      failedCount,
      subject: 'Bulk SMS broadcast',
      content: message
    });

    return { total: recipients.length, success: successCount, failed: failedCount };
  }

  async sendBulkEmail(payload) {
    const { targetAudience, subject, content } = payload;
    if (!subject || !content) {
      throw ApiError.badRequest('Email subject and rich HTML content are required.');
    }

    let recipients = [];
    if (targetAudience === 'teacher') {
      recipients = await Teacher.find({ isDeleted: false, status: 'active' }).lean();
    } else if (targetAudience === 'student') {
      recipients = await Student.find({ isDeleted: false }).lean();
    }

    let successCount = 0;
    let failedCount = 0;

    for (const rec of recipients) {
      const email = rec.email || 'student@school.com';
      try {
        await communicationRepository.createEmailLog({
          recipientId: rec._id,
          recipientEmail: email,
          subject,
          content,
          status: 'delivered',
          type: 'bulk'
        });
        successCount++;
      } catch (err) {
        failedCount++;
      }
    }

    await communicationRepository.createHistoryLog({
      type: 'email',
      sender: 'Admin Campaign manager',
      recipientCount: recipients.length,
      successCount,
      failedCount,
      subject,
      content
    });

    return { total: recipients.length, success: successCount, failed: failedCount };
  }
}

module.exports = new CommunicationService();
