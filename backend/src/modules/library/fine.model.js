const mongoose = require('mongoose');

const libraryFineSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookIssue'
    },
    member: {
      type: String,
      required: [true, 'Member is required'],
      trim: true
    },
    book: {
      type: String,
      required: [true, 'Book is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Fine Amount is required'],
      min: [0, 'Amount must be positive']
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid'
    },
    paidDate: {
      type: String,
      default: null
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

libraryFineSchema.index({ tenantId: 1, member: 1, status: 1 });

const LibraryFine = mongoose.model('LibraryFine', libraryFineSchema);

module.exports = LibraryFine;
