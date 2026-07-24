const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam Name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Exam Type is required'],
      enum: ['Mid Exam', 'Quarterly', 'Half Yearly', 'Annual']
    },
    academicYear: {
      type: String,
      required: [true, 'Academic Year is required'],
      default: '2026-2027'
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required']
    },
    section: {
      type: String,
      default: 'A'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

examSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);

module.exports = Exam;
