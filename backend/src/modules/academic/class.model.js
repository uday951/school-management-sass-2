const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true
    },
    classCode: {
      type: String,
      required: [true, 'Class code is required'],
      trim: true,
      uppercase: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'active', 'inactive'],
        message: 'Status must be ACTIVE or INACTIVE'
      },
      default: 'ACTIVE'
    },
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

// Virtual getters for flexible property access (name/className, code/classCode)
classSchema.virtual('name').get(function () {
  return this.className;
});

classSchema.virtual('code').get(function () {
  return this.classCode;
});

classSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

classSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

classSchema.set('toObject', { virtuals: true });

// Index for searching and soft delete filter
classSchema.index({ isDeleted: 1, classCode: 1 });
classSchema.index({ isDeleted: 1, className: 1 });

const Class = mongoose.models.Class || mongoose.model('Class', classSchema);

module.exports = Class;
