const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    fromClass: String,
    fromSection: String,
    targetClass: String,
    targetSection: String,
    academicYear: String,
    promotedAt: {
      type: Date,
      default: Date.now
    },
    promotedBy: {
      type: String,
      default: 'Admin'
    }
  },
  { timestamps: true }
);

const StudentPromotion = mongoose.model('StudentPromotion', promotionSchema);

module.exports = StudentPromotion;
