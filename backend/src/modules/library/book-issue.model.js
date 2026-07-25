const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    member: {
      type: String,
      required: [true, 'Member is required'],
      trim: true
    },
    memberType: {
      type: String,
      required: true,
      enum: ['Student', 'Teacher'],
      default: 'Student'
    },
    book: {
      type: String,
      required: [true, 'Book Title is required'],
      trim: true
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      trim: true
    },
    issueDate: {
      type: String,
      required: [true, 'Issue Date is required'],
      trim: true
    },
    dueDate: {
      type: String,
      required: [true, 'Due Date is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue'],
      default: 'issued'
    }
  },
  {
    timestamps: true
  }
);

bookIssueSchema.index({ tenantId: 1, member: 1, isbn: 1, status: 1 });

const BookIssue = mongoose.model('BookIssue', bookIssueSchema);

module.exports = BookIssue;
