const mongoose = require('mongoose');

const parentStudentMappingSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    relationship: {
      type: String,
      trim: true,
      default: 'Parent'
    },
    isPrimary: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate links between same parent and student
parentStudentMappingSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

const ParentStudentMapping = mongoose.model('ParentStudentMapping', parentStudentMappingSchema);

module.exports = ParentStudentMapping;
