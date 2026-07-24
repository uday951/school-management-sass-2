const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    teacherId: {
      type: String,
      required: [true, 'Teacher ID/Name is required'],
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'halfday'],
      required: [true, 'Attendance status is required']
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    markedBy: {
      type: String,
      default: 'Admin'
    }
  },
  { timestamps: true }
);

teacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

const TeacherAttendance = mongoose.models.TeacherAttendance || mongoose.model('TeacherAttendance', teacherAttendanceSchema);

module.exports = TeacherAttendance;
