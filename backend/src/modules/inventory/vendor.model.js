const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    vendorName: {
      type: String,
      required: [true, 'Vendor Name is required'],
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    taxId: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

vendorSchema.index({ tenantId: 1, vendorName: 1 }, { unique: true });

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
