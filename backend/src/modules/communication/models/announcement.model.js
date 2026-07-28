const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Announcement Title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Announcement Content is required'],
      trim: true
    },
    targetAudience: {
      type: String, // e.g. 'all', 'teacher', 'student', 'parent'
      required: [true, 'Target Audience is required'],
      default: 'all',
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
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true
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

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
