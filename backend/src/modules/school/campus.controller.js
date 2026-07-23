const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');
const campusService = require('./campus.service');

/**
 * @desc   Get Paginated Campus List (with search, filter, sort)
 * @route  GET /api/v1/campuses
 * @access Protected (Super Admin, School Admin, Teacher)
 */
const getCampuses = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await campusService.getCampuses(req.query, tenantId);
  return sendPaginated(res, 'Campuses retrieved successfully', data, pagination);
});

/**
 * @desc   Get Single Campus by ID
 * @route  GET /api/v1/campuses/:id
 * @access Protected (Super Admin, School Admin, Teacher)
 */
const getCampusById = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const campus = await campusService.getCampusById(req.params.id, tenantId);
  return sendSuccess(res, 'Campus details retrieved successfully', campus);
});

/**
 * @desc   Create New Campus
 * @route  POST /api/v1/campuses
 * @access Protected (Super Admin, School Admin)
 */
const createCampus = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const campus = await campusService.createCampus(req.body, tenantId);
  return sendCreated(res, 'Campus created successfully', campus);
});

/**
 * @desc   Update Campus
 * @route  PUT /api/v1/campuses/:id
 * @access Protected (Super Admin, School Admin)
 */
const updateCampus = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const campus = await campusService.updateCampus(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Campus updated successfully', campus);
});

/**
 * @desc   Toggle / Update Campus Status (Activate / Deactivate)
 * @route  PATCH /api/v1/campuses/:id/status
 * @access Protected (Super Admin, School Admin)
 */
const toggleCampusStatus = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const campus = await campusService.toggleCampusStatus(req.params.id, req.body.status, tenantId);
  return sendSuccess(res, `Campus status updated to ${campus.status}`, campus);
});

/**
 * @desc   Delete Campus
 * @route  DELETE /api/v1/campuses/:id
 * @access Protected (Super Admin, School Admin)
 */
const deleteCampus = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await campusService.deleteCampus(req.params.id, tenantId);
  return sendSuccess(res, 'Campus deleted successfully');
});

module.exports = {
  getCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  toggleCampusStatus,
  deleteCampus
};
