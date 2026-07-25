const mongoose = require('mongoose');

const communicationHistorySchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'announcement', 'notice'],
      required: true,
      index: true
    },
    sender: {
      type: String,
      required: true,
      default: 'System'
    },
    recipientCount: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failedCount: {
      type: Number,
      default: 0
    },
    subject: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

const CommunicationHistory = mongoose.models.CommunicationHistory || mongoose.model('CommunicationHistory', communicationHistorySchema);

module.exports = CommunicationHistory;
