const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      default: null
    },
    experienceDuration: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Experience = mongoose.model('Experience', experienceSchema);

module.exports = Experience;
