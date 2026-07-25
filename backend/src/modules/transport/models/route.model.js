const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true
    },
    routeCode: {
      type: String,
      required: [true, 'Route code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0, 'Distance cannot be negative']
    },
    estimatedTime: {
      type: String,
      required: [true, 'Estimated time is required'],
      trim: true
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

routeSchema.index({ isDeleted: 1, routeCode: 1 });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

module.exports = Route;
