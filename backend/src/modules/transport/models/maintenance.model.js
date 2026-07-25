const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
      index: true
    },
    serviceDate: {
      type: Date,
      required: [true, 'Service date is required']
    },
    repairDetails: {
      type: String,
      required: [true, 'Repair details are required'],
      trim: true
    },
    insuranceRenewal: {
      type: Boolean,
      default: false
    },
    fitnessCertificate: {
      type: Boolean,
      default: false
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative']
    },
    vendor: {
      type: String,
      default: '',
      trim: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

maintenanceSchema.index({ isDeleted: 1, vehicleId: 1 });

const Maintenance = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;
