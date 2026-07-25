const mongoose = require('mongoose');

const reportExportSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReportTemplate',
      default: null
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv'],
      required: [true, 'Export format is required']
    },
    url: {
      type: String,
      default: ''
    },
    generatedBy: {
      type: String,
      default: 'admin'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const ReportExport = mongoose.models.ReportExport || mongoose.model('ReportExport', reportExportSchema);

module.exports = ReportExport;
