const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    publisherName: {
      type: String,
      required: [true, 'Publisher Name is required'],
      trim: true
    },
    contact: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

publisherSchema.index({ tenantId: 1, publisherName: 1 }, { unique: true });

const Publisher = mongoose.model('Publisher', publisherSchema);

module.exports = Publisher;
