const mongoose = require('mongoose');

const feeCategorySchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Fee Category Name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const FeeCategory = mongoose.models.FeeCategory || mongoose.model('FeeCategory', feeCategorySchema);

module.exports = FeeCategory;
