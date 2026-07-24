const examService = require('./exam.service');
const { sendSuccess, sendCreated } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

class ExamController {
  // --- EXAMS ---
  getExams = asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      type: req.query.type,
      classId: req.query.classId,
      status: req.query.status
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit
    };
    const results = await examService.getExams(filters, options);
    return sendSuccess(res, 'Exams list retrieved.', results);
  });

  getExamById = asyncHandler(async (req, res) => {
    const exam = await examService.getExamById(req.params.id);
    return sendSuccess(res, 'Exam details retrieved.', exam);
  });

  createExam = asyncHandler(async (req, res) => {
    const exam = await examService.createExam(req.body);
    return sendCreated(res, 'Exam cycle created successfully.', exam);
  });

  updateExam = asyncHandler(async (req, res) => {
    const exam = await examService.updateExam(req.params.id, req.body);
    return sendSuccess(res, 'Exam details updated successfully.', exam);
  });

  deleteExam = asyncHandler(async (req, res) => {
    const result = await examService.deleteExam(req.params.id);
    return sendSuccess(res, 'Exam deleted successfully.', result);
  });

  // --- SCHEDULES ---
  getSchedules = asyncHandler(async (req, res) => {
    const filters = {
      examId: req.query.examId,
      classId: req.query.classId,
      subjectId: req.query.subjectId
    };
    const schedules = await examService.getSchedules(filters);
    return sendSuccess(res, 'Exam schedules retrieved.', schedules);
  });

  createSchedule = asyncHandler(async (req, res) => {
    const schedule = await examService.createSchedule(req.body);
    return sendCreated(res, 'Subject exam schedule added.', schedule);
  });

  deleteSchedule = asyncHandler(async (req, res) => {
    const result = await examService.deleteSchedule(req.params.id);
    return sendSuccess(res, 'Subject exam schedule removed.', result);
  });

  // --- GRADES ---
  getGrades = asyncHandler(async (req, res) => {
    const grades = await examService.getGrades();
    return sendSuccess(res, 'Grading scales list retrieved.', grades);
  });

  createGrade = asyncHandler(async (req, res) => {
    const grade = await examService.createGrade(req.body);
    return sendCreated(res, 'Grade configuration created.', grade);
  });

  updateGrade = asyncHandler(async (req, res) => {
    const grade = await examService.updateGrade(req.params.id, req.body);
    return sendSuccess(res, 'Grade configuration updated.', grade);
  });

  deleteGrade = asyncHandler(async (req, res) => {
    const result = await examService.deleteGrade(req.params.id);
    return sendSuccess(res, 'Grade configuration deleted.', result);
  });

  // --- MARKS ---
  getMarks = asyncHandler(async (req, res) => {
    const filters = {
      studentId: req.query.studentId,
      examId: req.query.examId,
      subjectId: req.query.subjectId
    };
    const marks = await examService.getMarks(filters);
    return sendSuccess(res, 'Marks listing retrieved.', marks);
  });

  saveMarks = asyncHandler(async (req, res) => {
    const marks = await examService.saveMarks(req.body);
    return sendSuccess(res, 'Marks score saved successfully.', marks);
  });

  // --- RESULTS ---
  getResults = asyncHandler(async (req, res) => {
    const filters = {
      examId: req.query.examId,
      studentId: req.query.studentId,
      status: req.query.status,
      isPublished: req.query.isPublished
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit
    };
    const results = await examService.getResults(filters, options);
    return sendSuccess(res, 'Consolidated exam results retrieved.', results);
  });

  processResults = asyncHandler(async (req, res) => {
    const result = await examService.processResults(req.body.examId);
    return sendSuccess(res, `Consolidated marks processed successfully for all students.`, result);
  });

  publishResults = asyncHandler(async (req, res) => {
    const { examId, isPublished } = req.body;
    const result = await examService.publishResults(examId, isPublished);
    return sendSuccess(
      res,
      `Results for this exam have been successfully ${isPublished ? 'published' : 'unpublished'}.`,
      result
    );
  });

  // --- REPORT CARDS ---
  getReportCard = asyncHandler(async (req, res) => {
    const { studentId, examId } = req.query;
    const reportCard = await examService.getReportCardDetails(studentId, examId);
    return sendSuccess(res, 'Aggregated report card prepared.', reportCard);
  });
}

module.exports = new ExamController();
