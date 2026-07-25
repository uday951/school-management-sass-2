const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    itemName: {
      type: String,
      required: [true, 'Item Name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    minimumStock: {
      type: Number,
      required: true,
      default: 5,
      min: 0
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available Quantity cannot be negative']
    },
    unit: {
      type: String,
      trim: true,
      default: 'pcs'
    }
  },
  {
    timestamps: true
  }
);

stockSchema.index({ tenantId: 1, itemName: 1 }, { unique: true });

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
