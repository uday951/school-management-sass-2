const mongoose = require('mongoose');

const substituteTeacherSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    originalTeacher: {
      type: String,
      required: [true, 'Original Teacher is required'],
      trim: true
    },
    substituteTeacher: {
      type: String,
      required: [true, 'Substitute Teacher is required'],
      trim: true
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

substituteTeacherSchema.index({ tenantId: 1, originalTeacher: 1, date: 1 });

const SubstituteTeacher = mongoose.model('SubstituteTeacher', substituteTeacherSchema);

module.exports = SubstituteTeacher;
