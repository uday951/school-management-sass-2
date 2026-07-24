const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    roomNumber: {
      type: String,
      required: [true, 'Room Number is required'],
      trim: true,
      uppercase: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    roomType: {
      type: String,
      required: [true, 'Room Type is required'],
      enum: ['Classroom', 'Lab', 'Auditorium', 'Library', 'Sports Hall', 'Other'],
      default: 'Classroom'
    }
  },
  {
    timestamps: true
  }
);

roomSchema.index({ tenantId: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
