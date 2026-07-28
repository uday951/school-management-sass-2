const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema(
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
    logDate: {
      type: Date,
      required: [true, 'Log date is required'],
      default: Date.now
    },
    fuelQuantity: {
      type: Number,
      required: [true, 'Fuel quantity is required'],
      min: [0.1, 'Fuel quantity must be positive']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.1, 'Price must be positive']
    },
    mileage: {
      type: Number,
      default: 0
    },
    odometerReading: {
      type: Number,
      required: [true, 'Odometer reading is required']
    },
    fuelStation: {
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

fuelLogSchema.index({ isDeleted: 1, vehicleId: 1 });

const FuelLog = mongoose.models.FuelLog || mongoose.model('FuelLog', fuelLogSchema);

module.exports = FuelLog;
