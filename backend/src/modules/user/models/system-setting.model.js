const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: [true, 'School Name is required'],
      default: 'ERP International Academy'
    },
    logo: {
      type: String,
      default: ''
    },
    timezone: {
      type: String,
      default: 'GMT'
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    emailConfig: {
      host: { type: String, default: '' },
      port: { type: Number, default: 25 },
      user: { type: String, default: '' },
      pass: { type: String, default: '' }
    },
    smsConfig: {
      provider: { type: String, default: 'Twilio' },
      apiKey: { type: String, default: '' },
      senderId: { type: String, default: '' }
    },
    fileUploadLimit: {
      type: Number,
      default: 5 // in MB
    },
    // Academic details
    academicYear: {
      type: String,
      default: '2026-2027'
    },
    semester: {
      type: String,
      default: 'Fall Semester'
    },
    terms: {
      type: [String],
      default: ['First Term', 'Mid Term', 'Final Term']
    }
  },
  { timestamps: true }
);

const SystemSetting = mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);

module.exports = SystemSetting;
