const mongoose = require('mongoose');

const bookCategorySchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    categoryName: {
      type: String,
      required: [true, 'Category Name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

bookCategorySchema.index({ tenantId: 1, categoryName: 1 }, { unique: true });

const BookCategory = mongoose.model('BookCategory', bookCategorySchema);

module.exports = BookCategory;
