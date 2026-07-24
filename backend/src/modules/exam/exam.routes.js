const express = require('express');
const examController = require('./exam.controller');
const {
  createExamSchema,
  createScheduleSchema,
  saveMarksSchema,
  createGradeSchema
} = require('./exam.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

// --- EXAMS ---
router.get('/', examController.getExams);
router.post('/', createExamSchema, validate, examController.createExam);
router.get('/:id', examController.getExamById);
router.put('/:id', createExamSchema, validate, examController.updateExam);
router.delete('/:id', examController.deleteExam);

// --- SCHEDULES ---
router.get('/schedules/all', examController.getSchedules);
router.post('/schedules', createScheduleSchema, validate, examController.createSchedule);
router.delete('/schedules/:id', examController.deleteSchedule);

// --- GRADES ---
router.get('/grades/all', examController.getGrades);
router.post('/grades', createGradeSchema, validate, examController.createGrade);
router.put('/grades/:id', createGradeSchema, validate, examController.updateGrade);
router.delete('/grades/:id', examController.deleteGrade);

// --- MARKS ---
router.get('/marks/all', examController.getMarks);
router.post('/marks', saveMarksSchema, validate, examController.saveMarks);

// --- RESULTS ---
router.get('/results/all', examController.getResults);
router.post('/results/process', examController.processResults);
router.post('/publish-results', examController.publishResults);

// --- REPORT CARDS ---
router.get('/report-card/details', examController.getReportCard);

module.exports = router;
