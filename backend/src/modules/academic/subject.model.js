const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [0, 'Credits must be non-negative']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'active', 'inactive'],
        message: 'Status must be ACTIVE or INACTIVE'
      },
      default: 'ACTIVE'
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual getters for frontend field compatibility
subjectSchema.virtual('name').get(function () {
  return this.subjectName;
});

subjectSchema.virtual('code').get(function () {
  return this.subjectCode;
});

subjectSchema.virtual('teacherId').get(function () {
  return this.teacher;
});

subjectSchema.virtual('assignedClasses').get(function () {
  return this.classes;
});

subjectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

subjectSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

subjectSchema.set('toObject', { virtuals: true });

// Indexes
subjectSchema.index({ isDeleted: 1, subjectCode: 1 });
subjectSchema.index({ isDeleted: 1, subjectName: 1 });
subjectSchema.index({ isDeleted: 1, department: 1 });

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

module.exports = Subject;
