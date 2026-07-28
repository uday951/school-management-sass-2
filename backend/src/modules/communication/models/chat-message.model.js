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
      index: true
    },
    senderRole: {
      type: String,
      enum: ['parent', 'teacher'],
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    receiverRole: {
      type: String,
      enum: ['parent', 'teacher'],
      required: true
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
