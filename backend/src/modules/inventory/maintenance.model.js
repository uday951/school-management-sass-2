const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    assetCode: {
      type: String,
      required: [true, 'Asset Code is required'],
      trim: true,
      uppercase: true
    },
    assetName: {
      type: String,
      required: [true, 'Asset Name is required'],
      trim: true
    },
    maintenanceType: {
      type: String,
      required: [true, 'Maintenance Type is required'],
      trim: true,
      default: 'Routine Servicing'
    },
    scheduledDate: {
      type: String,
      required: [true, 'Scheduled Date is required'],
      trim: true
    },
    completedDate: {
      type: String,
      trim: true,
      default: ''
    },
    vendor: {
      type: String,
      trim: true,
      default: ''
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

maintenanceSchema.index({ tenantId: 1, assetCode: 1, status: 1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;
