const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    documentType: {
      type: String,
      enum: ['identity', 'qualification', 'experience', 'payroll', 'other'],
      default: 'other'
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileName: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const TeacherDocument = mongoose.model('TeacherDocument', documentSchema);

module.exports = TeacherDocument;
