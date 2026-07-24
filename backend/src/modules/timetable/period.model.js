const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    name: {
      type: String,
      required: [true, 'Period Name is required'],
      trim: true
    },
    startTime: {
      type: String,
      required: [true, 'Start Time is required'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End Time is required'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required']
    },
    isBreak: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

periodSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Period = mongoose.model('Period', periodSchema);

module.exports = Period;
