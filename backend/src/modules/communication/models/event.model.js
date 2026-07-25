const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    name: {
      type: String,
      required: [true, 'Event Name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    venue: {
      type: String,
      required: [true, 'Event Venue is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Event Date is required'],
      index: true
    },
    time: {
      type: String,
      required: [true, 'Event Time is required']
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true
    },
    participants: {
      type: [String], // Array of roles or groups, e.g. ['student', 'teacher', 'parent']
      default: ['all']
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

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

module.exports = Event;
