const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('Communication & Notification Module API Integration Tests', () => {
  let announcementId = null;
  let eventId = null;
  let templateId = null;

  afterAll(async () => {
    // Clean up test data
    const Announcement = mongoose.models.Announcement || mongoose.model('Announcement');
    const Event = mongoose.models.Event || mongoose.model('Event');
    const Template = mongoose.models.Template || mongoose.model('Template');
    const SMS = mongoose.models.SMS || mongoose.model('SMS');
    const Email = mongoose.models.Email || mongoose.model('Email');
    const Notification = mongoose.models.Notification || mongoose.model('Notification');
    const CommunicationHistory = mongoose.models.CommunicationHistory || mongoose.model('CommunicationHistory');

    await Announcement.deleteMany({ title: 'Test School Announcement' });
    await Event.deleteMany({ name: 'Annual Sports Meet Test' });
    await Template.deleteMany({ name: 'Welcome Email Template' });
    await SMS.deleteMany({ message: /Bulk SMS broadcast/ });
    await Email.deleteMany({ subject: /Test Email Campaign/ });
    await Notification.deleteMany({ title: /New Event Scheduled/ });
    await CommunicationHistory.deleteMany({ sender: 'Notification Engine' });
    await CommunicationHistory.deleteMany({ sender: 'Admin Campaign manager' });
  });

  it('POST /api/v1/communication/announcements - should create a new announcement', async () => {
    const res = await request(app)
      .post('/api/v1/communication/announcements')
      .send({
        title: 'Test School Announcement',
        content: 'Dear parents, please note that school timings are updated from Monday.',
        targetAudience: 'parent',
        priority: 'high'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    announcementId = res.body.data._id;
  });

  it('GET /api/v1/communication/announcements - should return announcements list', async () => {
    const res = await request(app).get('/api/v1/communication/announcements');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/communication/events - should create a new event and trigger notification', async () => {
    const res = await request(app)
      .post('/api/v1/communication/events')
      .send({
        name: 'Annual Sports Meet Test',
        description: 'Sports tournament finals and prize distribution.',
        venue: 'Main Playground Area',
        date: new Date('2026-11-20'),
        time: '09:00 AM',
        organizer: 'Physical Education Dept',
        participants: ['student', 'parent']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    eventId = res.body.data._id;

    // Verify automatic event notification log was created
    const Notification = mongoose.models.Notification || mongoose.model('Notification');
    const scheduledNotif = await Notification.findOne({ title: 'New Event Scheduled' });
    expect(scheduledNotif).toBeTruthy();
  });

  it('POST /api/v1/communication/templates - should create a communication template', async () => {
    const res = await request(app)
      .post('/api/v1/communication/templates')
      .send({
        name: 'Welcome Email Template',
        type: 'email',
        subject: 'Welcome to School ERP Portal',
        content: 'Hello {{name}}, welcome to your student parent portal dashboard.',
        variables: ['name']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    templateId = res.body.data._id;
  });

  it('POST /api/v1/communication/campaign/sms - should execute bulk SMS dispatch logs creation', async () => {
    const res = await request(app)
      .post('/api/v1/communication/campaign/sms')
      .send({
        targetAudience: 'custom',
        message: 'Bulk SMS broadcast alert: school portal is offline for maintenance.',
        customPhoneNumbers: ['1234567890', '9876543210']
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.success).toBe(2);
  });

  it('GET /api/v1/communication/dashboard-stats - should fetch communication campaign metrics', async () => {
    const res = await request(app).get('/api/v1/communication/dashboard-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('smsCount');
    expect(res.body.data).toHaveProperty('emailCount');
  });
});
