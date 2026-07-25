const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    name: {
      type: String,
      required: [true, 'Author Name is required'],
      trim: true
    },
    biography: {
      type: String,
      trim: true,
      default: ''
    },
    nationality: {
      type: String,
      trim: true,
      default: 'International'
    }
  },
  {
    timestamps: true
  }
);

authorSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
