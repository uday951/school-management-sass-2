const mongoose = require('mongoose');

const studentTransportSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      unique: true,
      index: true
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route reference is required'],
      index: true
    },
    pickupStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: [true, 'Pickup stop reference is required']
    },
    dropStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: [true, 'Drop stop reference is required']
    },
    academicYear: {
      type: String,
      default: '2026-2027'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

studentTransportSchema.index({ isDeleted: 1, studentId: 1 });

const StudentTransport = mongoose.models.StudentTransport || mongoose.model('StudentTransport', studentTransportSchema);

module.exports = StudentTransport;
