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
      required: true,
      refPath: 'senderModel',
      index: true
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['Parent', 'Teacher', 'Student', 'User']
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel',
      index: true
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ['Parent', 'Teacher', 'Student', 'User']
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
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
