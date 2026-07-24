const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true
    },
    degree: {
      type: String,
      required: [true, 'Degree name is required'],
      trim: true
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true
    },
    boardUniversity: {
      type: String,
      required: [true, 'Board/University is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Year of completion is required']
    },
    percentageCgpa: {
      type: String,
      required: [true, 'Percentage/CGPA is required'],
      trim: true
    },
    certificateUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Qualification = mongoose.model('Qualification', qualificationSchema);

module.exports = Qualification;
