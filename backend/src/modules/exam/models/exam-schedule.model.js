const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Schedule date is required']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required']
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
    time: {
      type: String,
      required: [true, 'Exam slot time is required']
    },
    hall: {
      type: String,
      required: [true, 'Hall name/number is required']
    }
  },
  { timestamps: true }
);

const ExamSchedule = mongoose.models.ExamSchedule || mongoose.model('ExamSchedule', examScheduleSchema);

module.exports = ExamSchedule;
