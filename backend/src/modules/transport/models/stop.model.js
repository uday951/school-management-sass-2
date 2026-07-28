const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route reference is required'],
      index: true
    },
    stopName: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true
    },
    pickupTime: {
      type: String,
      required: [true, 'Pickup time is required'],
      trim: true
    },
    dropTime: {
      type: String,
      required: [true, 'Drop time is required'],
      trim: true
    },
    latitude: {
      type: Number,
      default: 0
    },
    longitude: {
      type: Number,
      default: 0
    },
    sequenceOrder: {
      type: Number,
      required: [true, 'Sequence order is required']
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

stopSchema.index({ routeId: 1, sequenceOrder: 1 });

const Stop = mongoose.models.Stop || mongoose.model('Stop', stopSchema);

module.exports = Stop;
