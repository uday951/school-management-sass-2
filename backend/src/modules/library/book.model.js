const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      required: [true, 'Book Title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true
    },
    publisher: {
      type: String,
      required: [true, 'Publisher is required'],
      trim: true
    },
    edition: {
      type: String,
      trim: true,
      default: '1st Edition'
    },
    language: {
      type: String,
      trim: true,
      default: 'English'
    },
    shelfNumber: {
      type: String,
      trim: true,
      default: 'A-1'
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative']
    },
    coverUrl: {
      type: String,
      default: null
    },
    coverPublicId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'discontinued'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

bookSchema.index({ tenantId: 1, isbn: 1 }, { unique: true });
bookSchema.index({ tenantId: 1, title: 1 });
bookSchema.index({ tenantId: 1, category: 1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
