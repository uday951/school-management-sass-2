const mongoose = require('mongoose');

const subjectAllocationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
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
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true
    },
    weeklyHours: {
      type: Number,
      required: [true, 'Weekly Hours is required'],
      min: [1, 'Weekly Hours must be at least 1']
    }
  },
  {
    timestamps: true
  }
);

subjectAllocationSchema.index({ tenantId: 1, subject: 1, teacher: 1, class: 1 }, { unique: true });

const SubjectAllocation = mongoose.model('SubjectAllocation', subjectAllocationSchema);

module.exports = SubjectAllocation;
