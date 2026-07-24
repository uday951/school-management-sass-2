const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    title: {
      type: String,
      required: [true, 'Holiday title is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required'],
      unique: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

const Holiday = mongoose.models.Holiday || mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
