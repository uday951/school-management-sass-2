const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderRole: {
      type: String,
      enum: ['teacher', 'parent', 'student', 'school_admin'],
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recipientRole: {
      type: String,
      enum: ['teacher', 'parent', 'student', 'school_admin'],
      required: true
    },
    studentContextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String }
      }
    ],
    readStatus: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread',
      index: true
    }
  },
  { timestamps: true }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
