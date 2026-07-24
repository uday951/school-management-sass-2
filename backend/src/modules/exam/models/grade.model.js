const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    gradeName: {
      type: String,
      required: [true, 'Grade name is required'],
      trim: true,
      unique: true
    },
    minMarks: {
      type: Number,
      required: [true, 'Minimum marks are required'],
      min: [0, 'Minimum marks cannot be negative']
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks are required'],
      min: [0, 'Maximum marks cannot be negative']
    },
    gpa: {
      type: Number,
      required: [true, 'GPA is required'],
      min: [0, 'GPA cannot be negative']
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

const Grade = mongoose.models.Grade || mongoose.model('Grade', gradeSchema);

module.exports = Grade;
