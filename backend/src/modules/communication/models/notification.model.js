const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Recipient ID is required'],
      index: true
    },
    recipientRole: {
      type: String,
      default: 'student',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification Title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification Message is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread',
      index: true
    },
    readTime: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;
