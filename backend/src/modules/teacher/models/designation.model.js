const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Designation name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Designation code is required'],
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

designationSchema.index({ tenantId: 1, name: 1 }, { unique: true });
designationSchema.index({ tenantId: 1, code: 1 }, { unique: true });

designationSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Designation = mongoose.model('Designation', designationSchema);

module.exports = Designation;
