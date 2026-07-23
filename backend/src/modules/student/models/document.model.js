const mongoose = require('mongoose');
const { DOCUMENT_CATEGORIES } = require('../student.constants');

const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: Object.values(DOCUMENT_CATEGORIES),
      default: DOCUMENT_CATEGORIES.OTHER
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '100 KB'
    },
    fileType: {
      type: String,
      default: 'pdf'
    }
  },
  { timestamps: true }
);

const StudentDocument = mongoose.model('StudentDocument', documentSchema);

module.exports = StudentDocument;
