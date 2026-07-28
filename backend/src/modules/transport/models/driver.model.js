const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true
    },
    licenseNo: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    emergencyContact: {
      type: String,
      default: '',
      trim: true
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

driverSchema.index({ isDeleted: 1, licenseNo: 1 });
driverSchema.index({ isDeleted: 1, status: 1 });

const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

module.exports = Driver;
