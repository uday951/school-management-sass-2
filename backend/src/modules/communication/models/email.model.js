const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    recipientEmail: {
      type: String,
      required: [true, 'Recipient Email is required']
    },
    subject: {
      type: String,
      required: [true, 'Email Subject is required']
    },
    content: {
      type: String,
      required: [true, 'Email Content HTML is required']
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'sent',
      index: true
    },
    deliveryStatusTime: {
      type: Date,
      default: Date.now
    },
    errorReason: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['individual', 'bulk'],
      default: 'individual',
      index: true
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String }
      }
    ]
  },
  { timestamps: true }
);

const Email = mongoose.models.Email || mongoose.model('Email', emailSchema);

module.exports = Email;
