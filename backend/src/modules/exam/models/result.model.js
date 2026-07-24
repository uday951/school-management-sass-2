const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      required: true,
      default: 0
    },
    gpa: {
      type: Number,
      required: true,
      default: 0
    },
    grade: {
      type: String,
      default: ''
    },
    rank: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Prevent duplicate result calculations
resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);

module.exports = Result;
