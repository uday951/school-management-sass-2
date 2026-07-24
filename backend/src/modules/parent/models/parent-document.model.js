const mongoose = require('mongoose');

const parentDocumentSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true
    },
    documentName: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true,
      default: 'Identity Proof'
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    publicId: {
      type: String,
      trim: true,
      default: ''
    },
    uploadedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active'
    }
  },
  { timestamps: true }
);

const ParentDocument = mongoose.model('ParentDocument', parentDocumentSchema);

module.exports = ParentDocument;
