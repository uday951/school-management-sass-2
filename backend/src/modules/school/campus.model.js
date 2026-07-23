const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    name: {
      type: String,
      required: [true, 'Campus Name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Campus Code is required'],
      trim: true,
      uppercase: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    principal: {
      type: String,
      required: [true, 'Principal Name is required'],
      trim: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact Number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
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

campusSchema.index({ tenantId: 1, code: 1 }, { unique: true });
campusSchema.index({ tenantId: 1, name: 1 });
campusSchema.index({ tenantId: 1, principal: 1 });
campusSchema.index({ tenantId: 1, email: 1 });

const Campus = mongoose.model('Campus', campusSchema);

module.exports = Campus;
