const mongoose = require('mongoose');

const assetAllocationSchema = new mongoose.Schema(
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
    allocatedTo: {
      type: String,
      required: [true, 'Allocated To is required'],
      trim: true
    },
    allocatedType: {
      type: String,
      enum: ['Teacher', 'Staff', 'Department'],
      default: 'Staff'
    },
    allocationDate: {
      type: String,
      required: [true, 'Allocation Date is required'],
      trim: true
    },
    expectedReturnDate: {
      type: String,
      trim: true,
      default: ''
    },
    actualReturnDate: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'returned'],
      default: 'active'
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

assetAllocationSchema.index({ tenantId: 1, assetCode: 1, status: 1 });

const AssetAllocation = mongoose.model('AssetAllocation', assetAllocationSchema);

module.exports = AssetAllocation;
