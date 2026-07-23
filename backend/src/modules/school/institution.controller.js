const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');
const institutionService = require('./institution.service');

/**
 * @desc   Get Institution Profile
 * @route  GET /api/v1/institution
 * @access Protected (Super Admin, School Admin, Teacher, Parent)
 */
const getInstitution = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const institution = await institutionService.getInstitution(tenantId);
  return sendSuccess(res, 'Institution details retrieved successfully', institution);
});

/**
 * @desc   Create Institution Profile
 * @route  POST /api/v1/institution
 * @access Protected (Super Admin, School Admin)
 */
const createInstitution = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const institution = await institutionService.createInstitution(req.body, req.files, tenantId);
  return sendCreated(res, 'Institution profile created successfully', institution);
});

/**
 * @desc   Update Institution Profile
 * @route  PUT /api/v1/institution/:id
 * @access Protected (Super Admin, School Admin)
 */
const updateInstitution = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const institution = await institutionService.updateInstitution(
    req.params.id,
    req.body,
    req.files,
    tenantId
  );
  return sendSuccess(res, 'Institution profile updated successfully', institution);
});

/**
 * @desc   Delete Institution Profile
 * @route  DELETE /api/v1/institution/:id
 * @access Protected (Super Admin)
 */
const deleteInstitution = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await institutionService.deleteInstitution(req.params.id, tenantId);
  return sendSuccess(res, 'Institution profile deleted successfully');
});

module.exports = {
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution
};
