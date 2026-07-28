const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notice Title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Notice Content is required'],
      trim: true
    },
    category: {
      type: String, // e.g. 'academic', 'general', 'sports'
      required: [true, 'Category is required'],
      default: 'general',
      index: true
    },
    visibility: {
      type: String,
      enum: ['public', 'internal'],
      default: 'internal',
      index: true
    },
    publishDate: {
      type: Date,
      required: [true, 'Publish Date is required'],
      default: Date.now,
      index: true
    },
    expiryDate: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);

module.exports = Notice;
