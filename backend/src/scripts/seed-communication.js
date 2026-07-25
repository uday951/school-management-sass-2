const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Announcement = require('../modules/communication/models/announcement.model');
const Notice = require('../modules/communication/models/notice.model');
const Event = require('../modules/communication/models/event.model');
const Template = require('../modules/communication/models/template.model');
const Notification = require('../modules/communication/models/notification.model');
const SMS = require('../modules/communication/models/sms.model');
const Email = require('../modules/communication/models/email.model');
const CommunicationHistory = require('../modules/communication/models/communication-history.model');
const Teacher = require('../modules/teacher/models/teacher.model');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp';

async function seed() {
  console.log('Connecting to database:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('[DB] Connected successfully.');

  // Clean old communication data
  console.log('Cleaning existing communication database structures...');
  await Announcement.deleteMany({});
  await Notice.deleteMany({});
  await Event.deleteMany({});
  await Template.deleteMany({});
  await Notification.deleteMany({});
  await SMS.deleteMany({});
  await Email.deleteMany({});
  await CommunicationHistory.deleteMany({});
  console.log('Cleanup complete.');

  // Fetch a teacher to use as mock recipient
  const teacher = await Teacher.findOne({ isDeleted: false });
  const teacherId = teacher ? teacher._id : new mongoose.Types.ObjectId();

  // 1. Seed Broadcast Announcements
  console.log('Seeding announcements...');
  await Announcement.create([
    {
      title: 'Annual Sports Meet 2026 Registration Open',
      content: 'The registrations for track and field events are officially open. Contact the physical education department.',
      targetAudience: 'student',
      priority: 'high',
      status: 'published'
    },
    {
      title: 'Revised School Timing Instructions',
      content: 'Please note that from next Monday, morning assembly will begin at 08:00 AM instead of 08:30 AM.',
      targetAudience: 'all',
      priority: 'medium',
      status: 'published'
    },
    {
      title: 'Faculty Mid-Term Review Meeting',
      content: 'All science department teachers are requested to gather in conference room B for the mid-term academic review.',
      targetAudience: 'teacher',
      priority: 'low',
      status: 'published'
    }
  ]);

  // 2. Seed Notice Board
  console.log('Seeding notice board items...');
  await Notice.create([
    {
      title: 'Lost & Found: Wristwatch in Physics Lab',
      content: 'A silver analog wristwatch was found on lab bench 4. Claim it from the administrative office.',
      category: 'general',
      visibility: 'public',
      priority: 'low'
    },
    {
      title: 'Tuition Fee Payment Due Date Reminder',
      content: 'Please clear outstanding term invoices before the 10th of next month to avoid late fees.',
      category: 'billing',
      visibility: 'public',
      priority: 'high'
    }
  ]);

  // 3. Seed Events
  console.log('Seeding events...');
  await Event.create([
    {
      name: 'Inter-School Science Fair 2026',
      description: 'Science models demonstration and physics experiments displays by senior grade students.',
      venue: 'Main Playground Auditorium',
      date: new Date('2026-09-12'),
      time: '10:00 AM',
      organizer: 'Science Club',
      participants: ['student', 'parent']
    },
    {
      name: 'Annual Parent Teacher Association Summit',
      description: 'Term performance evaluations and curriculum enhancement discussions.',
      venue: 'PTA Hall Room 101',
      date: new Date('2026-10-15'),
      time: '02:00 PM',
      organizer: 'PTA Committee',
      participants: ['teacher', 'parent']
    }
  ]);

  // 4. Seed Templates
  console.log('Seeding message templates...');
  await Template.create([
    {
      name: 'Welcome Admission Confirmation Mail',
      type: 'email',
      subject: 'Admission Confirmed successfully',
      content: '<p>Welcome {{name}} to our academic family! Your enrollment profile is active.</p>',
      variables: ['name']
    },
    {
      name: 'Monthly Fee Receipt Notification SMS',
      type: 'sms',
      content: 'Payment of ${{amount}} received successfully for Receipt {{receiptNo}}. Thank you.',
      variables: ['amount', 'receiptNo']
    }
  ]);

  // 5. Seed Historical Campaigns
  console.log('Seeding historical campaign logs...');
  await CommunicationHistory.create([
    {
      type: 'sms',
      sender: 'Admin Campaign manager',
      recipientCount: 20,
      successCount: 19,
      failedCount: 1,
      subject: 'Holiday Announcement SMS Campaign',
      content: 'Dear parents, please note that school will remain closed tomorrow on account of national holiday.'
    },
    {
      type: 'email',
      sender: 'Admin Campaign manager',
      recipientCount: 15,
      successCount: 15,
      failedCount: 0,
      subject: 'Academic Syllabus Update Mailer',
      content: '<p>Please find attached the updated curriculum outlines for grade 10 science subjects.</p>'
    }
  ]);

  // 6. Seed push notifications
  await Notification.create([
    {
      recipientId: teacherId,
      recipientRole: 'teacher',
      title: 'New Student Admitted',
      message: 'New student John Doe was added to your class directory roster.',
      status: 'unread'
    },
    {
      recipientId: teacherId,
      recipientRole: 'teacher',
      title: 'Payslip Generated successfully',
      message: 'Your payslip for working days has been compiled.',
      status: 'unread'
    }
  ]);

  console.log('\n======================================================');
  console.log('🎉 COMMUNICATION SEED COMPLETED SUCCESSFULLY!');
  console.log(`Please go to: http://localhost:5173/admin/communication/sms`);
  console.log('Verify announcements, notices, events, templates, and dashboard logs.');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
