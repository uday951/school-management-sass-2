const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true
    },
    relationship: {
      type: String,
      trim: true,
      default: 'Father'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    altPhone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: 'USA'
    },
    occupation: {
      type: String,
      trim: true,
      default: ''
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for searching
parentSchema.index({ tenantId: 1, phone: 1 });
parentSchema.index({ name: 'text', email: 'text', phone: 'text' });

// Pre-find hook to exclude soft-deleted records by default
parentSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Parent = mongoose.model('Parent', parentSchema);

module.exports = Parent;
