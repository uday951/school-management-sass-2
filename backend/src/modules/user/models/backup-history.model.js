const mongoose = require('mongoose');

const backupHistorySchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success'
    },
    size: {
      type: Number, // in KB
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const BackupHistory = mongoose.models.BackupHistory || mongoose.model('BackupHistory', backupHistorySchema);

module.exports = BackupHistory;
