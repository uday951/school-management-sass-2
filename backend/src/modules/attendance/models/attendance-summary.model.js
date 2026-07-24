const mongoose = require('mongoose');

const attendanceSummarySchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    type: {
      type: String,
      enum: ['student', 'teacher'],
      required: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    totalCount: {
      type: Number,
      default: 0
    },
    presentCount: {
      type: Number,
      default: 0
    },
    absentCount: {
      type: Number,
      default: 0
    },
    lateCount: {
      type: Number,
      default: 0
    },
    halfdayCount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

attendanceSummarySchema.index({ type: 1, date: 1 }, { unique: true });

const AttendanceSummary = mongoose.models.AttendanceSummary || mongoose.model('AttendanceSummary', attendanceSummarySchema);

module.exports = AttendanceSummary;
