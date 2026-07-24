const mongoose = require('mongoose');

const reportCardSchema = new mongoose.Schema(
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
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Result',
      required: true
    },
    generatedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['draft', 'final'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

const ReportCard = mongoose.models.ReportCard || mongoose.model('ReportCard', reportCardSchema);

module.exports = ReportCard;
