const mongoose = require('mongoose');

const parentCommunicationSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['SMS', 'Email', 'Circular', 'Notice', 'Call Log', 'Meeting'],
      default: 'SMS'
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Sent', 'Delivered', 'Failed', 'Scheduled', 'Logged'],
      default: 'Sent'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const ParentCommunication = mongoose.model('ParentCommunication', parentCommunicationSchema);

module.exports = ParentCommunication;
