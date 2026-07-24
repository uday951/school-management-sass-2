const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');
const timetableService = require('./timetable.service');

// ─── PERIOD CONTROLLERS ───────────────────────────────────────────────────────

const getPeriods = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await timetableService.getPeriods(req.query, tenantId);
  return sendPaginated(res, 'Periods retrieved successfully', data, pagination);
});

const createPeriod = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const period = await timetableService.createPeriod(req.body, tenantId);
  return sendCreated(res, 'Period created successfully', period);
});

const updatePeriod = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const period = await timetableService.updatePeriod(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Period updated successfully', period);
});

const deletePeriod = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await timetableService.deletePeriod(req.params.id, tenantId);
  return sendSuccess(res, 'Period deleted successfully');
});

// ─── TIMETABLE CONTROLLERS ───────────────────────────────────────────────────

const getTimetables = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await timetableService.getTimetables(req.query, tenantId);
  return sendPaginated(res, 'Timetables retrieved successfully', data, pagination);
});

const createTimetable = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const entry = await timetableService.createTimetable(req.body, tenantId);
  return sendCreated(res, 'Timetable entry created successfully', entry);
});

const updateTimetable = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const entry = await timetableService.updateTimetable(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Timetable entry updated successfully', entry);
});

const deleteTimetable = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await timetableService.deleteTimetable(req.params.id, tenantId);
  return sendSuccess(res, 'Timetable entry deleted successfully');
});

// ─── ROOM CONTROLLERS ────────────────────────────────────────────────────────

const getRooms = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await timetableService.getRooms(req.query, tenantId);
  return sendPaginated(res, 'Rooms retrieved successfully', data, pagination);
});

const createRoom = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const room = await timetableService.createRoom(req.body, tenantId);
  return sendCreated(res, 'Room allocated successfully', room);
});

const updateRoom = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const room = await timetableService.updateRoom(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Room updated successfully', room);
});

const deleteRoom = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await timetableService.deleteRoom(req.params.id, tenantId);
  return sendSuccess(res, 'Room deleted successfully');
});

// ─── SUBJECT ALLOCATION CONTROLLERS ──────────────────────────────────────────

const getSubjectAllocations = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await timetableService.getSubjectAllocations(req.query, tenantId);
  return sendPaginated(res, 'Subject allocations retrieved successfully', data, pagination);
});

const createSubjectAllocation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const allocation = await timetableService.createSubjectAllocation(req.body, tenantId);
  return sendCreated(res, 'Subject assigned successfully', allocation);
});

const updateSubjectAllocation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const allocation = await timetableService.updateSubjectAllocation(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Subject allocation updated successfully', allocation);
});

const deleteSubjectAllocation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await timetableService.deleteSubjectAllocation(req.params.id, tenantId);
  return sendSuccess(res, 'Subject allocation deleted successfully');
});

// ─── SUBSTITUTE CONTROLLERS ─────────────────────────────────────────────────

const getSubstitutes = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await timetableService.getSubstitutes(req.query, tenantId);
  return sendPaginated(res, 'Substitute teacher logs retrieved successfully', data, pagination);
});

const createSubstitute = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const substitute = await timetableService.createSubstitute(req.body, tenantId);
  return sendCreated(res, 'Substitute teacher assigned successfully', substitute);
});

const updateSubstitute = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const substitute = await timetableService.updateSubstitute(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Substitute assignment updated successfully', substitute);
});

const deleteSubstitute = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await timetableService.deleteSubstitute(req.params.id, tenantId);
  return sendSuccess(res, 'Substitute assignment deleted successfully');
});

module.exports = {
  getPeriods,
  createPeriod,
  updatePeriod,
  deletePeriod,

  getTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable,

  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,

  getSubjectAllocations,
  createSubjectAllocation,
  updateSubjectAllocation,
  deleteSubjectAllocation,

  getSubstitutes,
  createSubstitute,
  updateSubstitute,
  deleteSubstitute
};
