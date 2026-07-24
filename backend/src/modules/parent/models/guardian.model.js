const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true
    },
    guardianName: {
      type: String,
      required: [true, 'Guardian name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    isEmergencyContact: {
      type: Boolean,
      default: false
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

const Guardian = mongoose.model('Guardian', guardianSchema);

module.exports = Guardian;
