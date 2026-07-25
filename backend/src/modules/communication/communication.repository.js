const Announcement = require('./models/announcement.model');
const Notice = require('./models/notice.model');
const SMS = require('./models/sms.model');
const Email = require('./models/email.model');
const Notification = require('./models/notification.model');
const Event = require('./models/event.model');
const Template = require('./models/template.model');
const CommunicationHistory = require('./models/communication-history.model');

class CommunicationRepository {
  // ─── Announcements CRUD ────────────────────────────────────────────────────
  async findAnnouncements(filter = {}) {
    return Announcement.find({ isDeleted: false, ...filter }).sort({ publishDate: -1 }).lean();
  }

  async findAnnouncementById(id) {
    return Announcement.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createAnnouncement(data) {
    return Announcement.create(data);
  }

  async updateAnnouncement(id, data) {
    return Announcement.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteAnnouncement(id) {
    return Announcement.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Notices CRUD ──────────────────────────────────────────────────────────
  async findNotices(filter = {}) {
    return Notice.find({ isDeleted: false, ...filter }).sort({ publishDate: -1 }).lean();
  }

  async findNoticeById(id) {
    return Notice.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createNotice(data) {
    return Notice.create(data);
  }

  async updateNotice(id, data) {
    return Notice.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteNotice(id) {
    return Notice.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Events CRUD ───────────────────────────────────────────────────────────
  async findEvents(filter = {}) {
    return Event.find({ isDeleted: false, ...filter }).sort({ date: 1 }).lean();
  }

  async findEventById(id) {
    return Event.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createEvent(data) {
    return Event.create(data);
  }

  async updateEvent(id, data) {
    return Event.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteEvent(id) {
    return Event.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Templates CRUD ────────────────────────────────────────────────────────
  async findTemplates(filter = {}) {
    return Template.find({ isDeleted: false, ...filter }).lean();
  }

  async findTemplateById(id) {
    return Template.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createTemplate(data) {
    return Template.create(data);
  }

  async updateTemplate(id, data) {
    return Template.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteTemplate(id) {
    return Template.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── SMS, Email & Notifications ───────────────────────────────────────────
  async createSMSLog(data) {
    return SMS.create(data);
  }

  async createEmailLog(data) {
    return Email.create(data);
  }

  async createNotification(data) {
    return Notification.create(data);
  }

  async findNotifications(filter = {}) {
    return Notification.find({ isDeleted: false, ...filter }).sort({ createdAt: -1 }).lean();
  }

  async markNotificationRead(id) {
    return Notification.findByIdAndUpdate(id, { $set: { status: 'read', readTime: new Date() } }, { new: true });
  }

  // ─── History & Aggregations ────────────────────────────────────────────────
  async createHistoryLog(data) {
    return CommunicationHistory.create(data);
  }

  async findHistoryLogs(filter = {}) {
    return CommunicationHistory.find(filter).sort({ date: -1 }).lean();
  }

  async getDashboardStats() {
    const totalNotifications = await Notification.countDocuments({ isDeleted: false });
    const smsCount = await SMS.countDocuments({});
    const emailCount = await Email.countDocuments({});
    const pushCount = await Notification.countDocuments({ isDeleted: false });

    // Delivery stats
    const deliveryStats = await SMS.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const delivered = deliveryStats.find(s => s._id === 'delivered')?.count || smsCount;
    const failed = deliveryStats.find(s => s._id === 'failed')?.count || 0;

    const recentActivities = await CommunicationHistory.find({}).sort({ date: -1 }).limit(5).lean();

    return {
      totalNotifications,
      scheduledMessages: 0,
      deliveredMessages: delivered,
      failedMessages: failed,
      smsCount,
      emailCount,
      pushNotificationCount: pushCount,
      recentActivities
    };
  }
}

module.exports = new CommunicationRepository();
