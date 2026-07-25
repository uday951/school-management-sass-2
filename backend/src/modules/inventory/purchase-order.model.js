const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    poNumber: {
      type: String,
      required: [true, 'Purchase Order Number is required'],
      trim: true,
      uppercase: true
    },
    vendor: {
      type: String,
      required: [true, 'Vendor Name is required'],
      trim: true
    },
    orderDate: {
      type: String,
      required: [true, 'Order Date is required'],
      trim: true
    },
    deliveryDate: {
      type: String,
      trim: true,
      default: ''
    },
    items: [purchaseOrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
