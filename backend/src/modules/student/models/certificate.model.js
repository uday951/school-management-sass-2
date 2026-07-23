const mongoose = require('mongoose');
const { CERTIFICATE_TYPES } = require('../student.constants');

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    certificateType: {
      type: String,
      enum: Object.values(CERTIFICATE_TYPES),
      required: true
    },
    certificateNo: {
      type: String,
      unique: true,
      required: true
    },
    issuedDate: {
      type: Date,
      default: Date.now
    },
    issuedBy: {
      type: String,
      default: 'Principal / Admin'
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

const CertificateIssuance = mongoose.model('CertificateIssuance', certificateSchema);

module.exports = CertificateIssuance;
