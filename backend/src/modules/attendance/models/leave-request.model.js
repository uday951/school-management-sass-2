const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    applicantId: {
      type: String, // Can be Student ObjectId or User ID
      required: [true, 'Applicant ID is required'],
      index: true
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required']
    },
    type: {
      type: String,
      enum: ['student', 'teacher'],
      required: [true, 'Applicant type is required']
    },
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'maternity', 'other'],
      default: 'sick'
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
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    actionBy: {
      type: String,
      default: ''
    },
    actionDate: {
      type: Date
    },
    actionRemarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);

module.exports = LeaveRequest;
