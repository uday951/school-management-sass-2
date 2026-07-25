const mongoose = require('mongoose');

const reportTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: 'default_school'
    },
    name: {
      type: String,
      required: [true, 'Report template name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Report category is required'],
      enum: ['students', 'teachers', 'attendance', 'fees', 'exams', 'academic', 'finance', 'custom']
    },
    columns: {
      type: [String],
      required: [true, 'Columns list is required']
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const ReportTemplate = mongoose.models.ReportTemplate || mongoose.model('ReportTemplate', reportTemplateSchema);

module.exports = ReportTemplate;
