const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    academicYear: {
      type: String,
      required: [true, 'Academic Year is required'],
      trim: true
    },
    campus: {
      type: String,
      required: [true, 'Campus is required'],
      trim: true
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      index: true
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    teacher: {
      type: String,
      required: [true, 'Teacher is required'],
      trim: true
    },
    room: {
      type: String,
      required: [true, 'Room is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for conflict validation and query speed
timetableSchema.index({ tenantId: 1, class: 1, section: 1, day: 1, period: 1 });
timetableSchema.index({ tenantId: 1, teacher: 1, day: 1, period: 1 });
timetableSchema.index({ tenantId: 1, room: 1, day: 1, period: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
