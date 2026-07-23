const studentService = require('./student.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');

class StudentController {
  // GET /api/v1/students
  getStudents = asyncHandler(async (req, res) => {
    const { students, pagination } = await studentService.getStudentList(req.query);
    return sendPaginated(res, 'Student records retrieved successfully.', students, pagination);
  });

  // GET /api/v1/students/:id/profile
  getStudentProfile = asyncHandler(async (req, res) => {
    const profile = await studentService.getStudentProfile(req.params.id);
    return sendSuccess(res, 'Student profile fetched successfully.', profile);
  });

  // POST /api/v1/students/admissions
  createAdmission = asyncHandler(async (req, res) => {
    const student = await studentService.createAdmission(req.body);
    return sendCreated(res, 'Student admission created successfully.', student);
  });

  // GET /api/v1/students/admissions/next-number
  getNextAdmissionNumber = asyncHandler(async (req, res) => {
    const data = await studentService.getNextAdmissionNumber();
    return sendSuccess(res, 'Generated next admission number.', data);
  });

  // DELETE /api/v1/students/:id
  deleteStudent = asyncHandler(async (req, res) => {
    const result = await studentService.deleteStudent(req.params.id);
    return sendSuccess(res, result.message);
  });

  // POST /api/v1/students/bulk-delete
  bulkDelete = asyncHandler(async (req, res) => {
    const result = await studentService.bulkDelete(req.body.studentIds);
    return sendSuccess(res, result.message);
  });

  // POST /api/v1/students/bulk-promote
  bulkPromote = asyncHandler(async (req, res) => {
    const result = await studentService.bulkPromote(req.body);
    return sendSuccess(res, result.message);
  });

  // POST /api/v1/students/:id/transfer
  transferStudent = asyncHandler(async (req, res) => {
    const result = await studentService.transferStudent(req.params.id, req.body);
    return sendSuccess(res, result.message, { tcNumber: result.tcNumber });
  });

  // POST /api/v1/students/:id/certificates
  generateCertificate = asyncHandler(async (req, res) => {
    const { type = 'bonafide' } = req.body;
    const result = await studentService.generateCertificate(req.params.id, type);
    return sendSuccess(res, 'Certificate generated successfully.', result);
  });

  // GET /api/v1/students/:id/id-card
  getIdCard = asyncHandler(async (req, res) => {
    const result = await studentService.generateIdCard(req.params.id);
    return sendSuccess(res, 'Student ID Card payload fetched.', result);
  });

  // POST /api/v1/students/import
  importStudents = asyncHandler(async (req, res) => {
    const rawText = req.body.data || '';
    const fileType = req.body.fileType || 'csv';
    const result = await studentService.importStudents(rawText, fileType);
    return sendSuccess(res, `Bulk import processed. ${result.importedCount} records added.`, result);
  });

  // POST /api/v1/students/export
  exportStudents = asyncHandler(async (req, res) => {
    const result = await studentService.exportStudents(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
    return res.status(200).send(result.csvData);
  });
}

module.exports = new StudentController();
