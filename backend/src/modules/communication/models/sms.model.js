const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema(
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
    recipientPhone: {
      type: String,
      required: [true, 'Recipient Phone is required']
    },
    message: {
      type: String,
      required: [true, 'SMS Message is required']
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
    }
  },
  { timestamps: true }
);

const SMS = mongoose.models.SMS || mongoose.model('SMS', smsSchema);

module.exports = SMS;
