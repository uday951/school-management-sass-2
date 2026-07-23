const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: true
    },
    transferDate: {
      type: Date,
      default: Date.now
    },
    tcNumber: {
      type: String,
      unique: true,
      required: true
    },
    destinationSchool: {
      type: String,
      default: 'N/A'
    }
  },
  { timestamps: true }
);

const StudentTransfer = mongoose.model('StudentTransfer', transferSchema);

module.exports = StudentTransfer;
