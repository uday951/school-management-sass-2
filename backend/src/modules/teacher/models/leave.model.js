const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'maternity', 'unpaid', 'other'],
      default: 'casual'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    appliedOn: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
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

const TeacherLeave = mongoose.model('TeacherLeave', leaveSchema);

module.exports = TeacherLeave;
