const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
      default: 'default_tenant'
    },
    member: {
      type: String,
      required: [true, 'Member Name is required'],
      trim: true
    },
    book: {
      type: String,
      required: [true, 'Book Title is required'],
      trim: true
    },
    reservationDate: {
      type: String,
      required: [true, 'Reservation Date is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

reservationSchema.index({ tenantId: 1, member: 1, book: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
