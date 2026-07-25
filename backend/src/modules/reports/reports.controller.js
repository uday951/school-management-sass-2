const reportsService = require('./reports.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

class ReportsController {
  getDashboardSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getDashboardSummary();
    return sendSuccess(res, 'Dashboard analytics retrieved successfully.', data);
  });

  getStudentSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getStudentSummary(req.query);
    return sendSuccess(res, 'Student analytics retrieved successfully.', data);
  });

  getTeacherSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getTeacherSummary(req.query);
    return sendSuccess(res, 'Teacher analytics retrieved successfully.', data);
  });

  getAttendanceSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getAttendanceSummary(req.query);
    return sendSuccess(res, 'Attendance analytics retrieved successfully.', data);
  });

  getFeeSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getFeeSummary(req.query);
    return sendSuccess(res, 'Fee analytics retrieved successfully.', data);
  });

  getExamSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getExamSummary(req.query);
    return sendSuccess(res, 'Exam analytics retrieved successfully.', data);
  });

  getAcademicSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getAcademicSummary(req.query);
    return sendSuccess(res, 'Academic analytics retrieved successfully.', data);
  });

  getFinancialSummary = asyncHandler(async (req, res) => {
    const data = await reportsService.getFinancialSummary(req.query);
    return sendSuccess(res, 'Financial analytics retrieved successfully.', data);
  });

  // Templates
  getTemplates = asyncHandler(async (req, res) => {
    const data = await reportsService.getTemplates();
    return sendSuccess(res, 'Report templates list retrieved.', data);
  });

  createTemplate = asyncHandler(async (req, res) => {
    const data = await reportsService.createTemplate(req.body);
    return sendCreated(res, 'Report template created successfully.', data);
  });

  runCustomReport = asyncHandler(async (req, res) => {
    const data = await reportsService.runCustomReport(req.body);
    return sendSuccess(res, 'Custom report run output compiled.', data);
  });

  // Export
  generateExport = asyncHandler(async (req, res) => {
    const result = await reportsService.generateExport(req.query);
    if (result.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.csv`);
      return res.status(200).send(result.data);
    }
    return sendSuccess(res, 'Export output compiled.', result.data);
  });
}

module.exports = new ReportsController();
