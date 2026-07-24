const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required']
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'half_day'],
      required: [true, 'Attendance status is required']
    },
    checkIn: {
      type: String,
      default: ''
    },
    checkOut: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

const TeacherAttendance =
  mongoose.models.TeacherAttendance || mongoose.model('TeacherAttendance', attendanceSchema);

module.exports = TeacherAttendance;
