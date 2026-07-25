const express = require('express');
const reportsController = require('./reports.controller');
const { createTemplateSchema, runCustomReportSchema } = require('./reports.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

router.get('/dashboard', reportsController.getDashboardSummary);
router.get('/students', reportsController.getStudentSummary);
router.get('/teachers', reportsController.getTeacherSummary);
router.get('/attendance', reportsController.getAttendanceSummary);
router.get('/fees', reportsController.getFeeSummary);
router.get('/exams', reportsController.getExamSummary);
router.get('/academic', reportsController.getAcademicSummary);
router.get('/finance', reportsController.getFinancialSummary);

// Templates & Custom
router.get('/templates', reportsController.getTemplates);
router.post('/templates', createTemplateSchema, validate, reportsController.createTemplate);
router.post('/custom', runCustomReportSchema, validate, reportsController.runCustomReport);

// Export Center
router.get('/export', reportsController.generateExport);

module.exports = router;
