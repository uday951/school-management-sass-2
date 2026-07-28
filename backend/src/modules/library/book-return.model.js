const mongoose = require('mongoose');

const bookReturnSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookIssue',
      required: true
    },
    member: {
      type: String,
      required: true,
      trim: true
    },
    book: {
      type: String,
      required: true,
      trim: true
    },
    returnDate: {
      type: String,
      required: [true, 'Return Date is required'],
      trim: true
    },
    fineAmount: {
      type: Number,
      default: 0
    },
    damageStatus: {
      type: String,
      enum: ['None', 'Minor', 'Severe', 'Lost'],
      default: 'None'
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

bookReturnSchema.index({ tenantId: 1, issueId: 1 });

const BookReturn = mongoose.model('BookReturn', bookReturnSchema);

module.exports = BookReturn;
