const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    assetName: {
      type: String,
      required: [true, 'Asset Name is required'],
      trim: true
    },
    assetCode: {
      type: String,
      required: [true, 'Asset Code is required'],
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    serialNumber: {
      type: String,
      trim: true,
      default: ''
    },
    purchaseDate: {
      type: String,
      required: [true, 'Purchase Date is required'],
      trim: true
    },
    purchaseCost: {
      type: Number,
      required: [true, 'Purchase Cost is required'],
      min: [0, 'Purchase Cost must be positive']
    },
    currentValue: {
      type: Number,
      default: 0
    },
    vendor: {
      type: String,
      trim: true,
      default: ''
    },
    warrantyExpiry: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Store'
    },
    status: {
      type: String,
      enum: ['available', 'allocated', 'maintenance', 'retired'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

assetSchema.index({ tenantId: 1, assetCode: 1 }, { unique: true });
assetSchema.index({ tenantId: 1, category: 1 });
assetSchema.index({ tenantId: 1, status: 1 });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
