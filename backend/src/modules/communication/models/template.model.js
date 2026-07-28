const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school',
      index: true
    },
    name: {
      type: String,
      required: [true, 'Template Name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['sms', 'email', 'notification'],
      required: [true, 'Template Type is required']
    },
    subject: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      required: [true, 'Template Content is required']
    },
    variables: {
      type: [String], // e.g. ['studentName', 'dueDate', 'amount']
      default: []
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

module.exports = Template;
