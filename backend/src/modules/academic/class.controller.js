const classService = require('./class.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');

/**
 * Get list of classes (Paginated, Searchable, Filterable)
 * GET /classes
 */
const getClasses = asyncHandler(async (req, res) => {
  const result = await classService.getAllClasses(req.query);
  return sendPaginated(res, 'Classes retrieved successfully', result.data, result.pagination);
});

/**
 * Get single class by ID
 * GET /classes/:id
 */
const getClassById = asyncHandler(async (req, res) => {
  const classItem = await classService.getClassById(req.params.id);
  return sendSuccess(res, 'Class details retrieved successfully', classItem);
});

/**
 * Create new class register
 * POST /classes
 */
const createClass = asyncHandler(async (req, res) => {
  const newClass = await classService.createClass(req.body);
  return sendCreated(res, 'Class created successfully', newClass);
});

/**
 * Update class register
 * PUT /classes/:id
 */
const updateClass = asyncHandler(async (req, res) => {
  const updatedClass = await classService.updateClass(req.params.id, req.body);
  return sendSuccess(res, 'Class updated successfully', updatedClass);
});

/**
 * Soft delete class register
 * DELETE /classes/:id
 */
const deleteClass = asyncHandler(async (req, res) => {
  await classService.deleteClass(req.params.id);
  return sendSuccess(res, 'Class deleted successfully', null);
});

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
