const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../student.constants');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const StudentAttendance = mongoose.model('StudentAttendance', attendanceSchema);

module.exports = StudentAttendance;
