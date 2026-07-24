const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
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
      default: 'Teacher'
    }
  },
  { timestamps: true }
);

// Ensure single attendance record per student per date
studentAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const StudentAttendance = mongoose.models.StudentAttendance || mongoose.model('StudentAttendance', studentAttendanceSchema);

module.exports = StudentAttendance;
