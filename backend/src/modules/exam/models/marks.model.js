const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam reference is required']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required']
    },
    marksObtained: {
      type: Number,
      required: [true, 'Obtained marks are required'],
      min: [0, 'Obtained marks cannot be negative']
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks are required'],
      default: 100
    },
    grade: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate marks entry for the same student, exam, and subject
marksSchema.index({ studentId: 1, examId: 1, subjectId: 1 }, { unique: true });

const Marks = mongoose.models.Marks || mongoose.model('Marks', marksSchema);

module.exports = Marks;
