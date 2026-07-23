const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    fatherName: {
      type: String,
      trim: true,
      default: ''
    },
    motherName: {
      type: String,
      trim: true,
      default: ''
    },
    guardianName: {
      type: String,
      trim: true,
      default: ''
    },
    occupation: {
      type: String,
      trim: true,
      default: ''
    },
    parentPhone: {
      type: String,
      trim: true,
      default: ''
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },

    // Emergency Contact
    emergencyName: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyPhone: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyRelation: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

const Parent = mongoose.model('Parent', parentSchema);

module.exports = Parent;
