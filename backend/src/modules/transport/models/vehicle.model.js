const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    vehicleNo: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    registrationNo: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: ['bus', 'van', 'mini_bus', 'other'],
      default: 'bus'
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    insuranceNo: {
      type: String,
      required: [true, 'Insurance number is required'],
      trim: true
    },
    insuranceExpiry: {
      type: Date,
      required: [true, 'Insurance expiry date is required']
    },
    rcDetails: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

vehicleSchema.index({ isDeleted: 1, vehicleNo: 1 });
vehicleSchema.index({ isDeleted: 1, status: 1 });

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
