const subjectService = require('./subject.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');

/**
 * Get list of subjects (Paginated, Searchable, Filterable)
 * GET /subjects
 */
const getSubjects = asyncHandler(async (req, res) => {
  const result = await subjectService.getAllSubjects(req.query);
  return sendPaginated(res, 'Subjects retrieved successfully', result.data, result.pagination);
});

/**
 * Get single subject by ID
 * GET /subjects/:id
 */
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id);
  return sendSuccess(res, 'Subject details retrieved successfully', subject);
});

/**
 * Create new subject
 * POST /subjects
 */
const createSubject = asyncHandler(async (req, res) => {
  const newSubject = await subjectService.createSubject(req.body);
  return sendCreated(res, 'Subject created successfully', newSubject);
});

/**
 * Update subject
 * PUT /subjects/:id
 */
const updateSubject = asyncHandler(async (req, res) => {
  const updatedSubject = await subjectService.updateSubject(req.params.id, req.body);
  return sendSuccess(res, 'Subject updated successfully', updatedSubject);
});

/**
 * Enable / Disable subject status toggle
 * PATCH /subjects/:id/status
 */
const toggleSubjectStatus = asyncHandler(async (req, res) => {
  const updatedSubject = await subjectService.toggleSubjectStatus(req.params.id, req.body.status);
  return sendSuccess(res, 'Subject status updated successfully', updatedSubject);
});

/**
 * Assign Teacher and Classes to Subject
 * PUT /subjects/:id/assign
 */
const assignSubjectDetails = asyncHandler(async (req, res) => {
  const updatedSubject = await subjectService.assignSubjectDetails(req.params.id, req.body);
  return sendSuccess(res, 'Subject assignments updated successfully', updatedSubject);
});

/**
 * Soft delete subject
 * DELETE /subjects/:id
 */
const deleteSubject = asyncHandler(async (req, res) => {
  await subjectService.deleteSubject(req.params.id);
  return sendSuccess(res, 'Subject deleted successfully', null);
});

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  toggleSubjectStatus,
  assignSubjectDetails,
  deleteSubject
};
