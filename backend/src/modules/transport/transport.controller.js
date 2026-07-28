const transportService = require('./transport.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

class TransportController {
  // ─── Dashboard Stats ──────────────────────────────────────────────────────
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await transportService.getDashboardStats();
    return sendSuccess(res, 'Transport dashboard statistics retrieved.', stats);
  });

  // ─── Vehicles ─────────────────────────────────────────────────────────────
  getVehicles = asyncHandler(async (req, res) => {
    const list = await transportService.getVehicles(req.query);
    return sendSuccess(res, 'Vehicles list retrieved.', list);
  });

  getVehicleById = asyncHandler(async (req, res) => {
    const vehicle = await transportService.getVehicleById(req.params.id);
    return sendSuccess(res, 'Vehicle details retrieved.', vehicle);
  });

  createVehicle = asyncHandler(async (req, res) => {
    const vehicle = await transportService.createVehicle(req.body);
    return sendCreated(res, 'Vehicle registration record created.', vehicle);
  });

  updateVehicle = asyncHandler(async (req, res) => {
    const vehicle = await transportService.updateVehicle(req.params.id, req.body);
    return sendSuccess(res, 'Vehicle registration record updated.', vehicle);
  });

  deleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await transportService.deleteVehicle(req.params.id);
    return sendSuccess(res, 'Vehicle record soft-deleted.', vehicle);
  });

  // ─── Drivers ──────────────────────────────────────────────────────────────
  getDrivers = asyncHandler(async (req, res) => {
    const list = await transportService.getDrivers(req.query);
    return sendSuccess(res, 'Drivers directory retrieved.', list);
  });

  getDriverById = asyncHandler(async (req, res) => {
    const driver = await transportService.getDriverById(req.params.id);
    return sendSuccess(res, 'Driver profile retrieved.', driver);
  });

  createDriver = asyncHandler(async (req, res) => {
    const driver = await transportService.createDriver(req.body);
    return sendCreated(res, 'Driver record created.', driver);
  });

  updateDriver = asyncHandler(async (req, res) => {
    const driver = await transportService.updateDriver(req.params.id, req.body);
    return sendSuccess(res, 'Driver profile updated.', driver);
  });

  deleteDriver = asyncHandler(async (req, res) => {
    const driver = await transportService.deleteDriver(req.params.id);
    return sendSuccess(res, 'Driver record soft-deleted.', driver);
  });

  // ─── Routes ───────────────────────────────────────────────────────────────
  getRoutes = asyncHandler(async (req, res) => {
    const list = await transportService.getRoutes(req.query);
    return sendSuccess(res, 'Routes directory retrieved.', list);
  });

  getRouteById = asyncHandler(async (req, res) => {
    const route = await transportService.getRouteById(req.params.id);
    return sendSuccess(res, 'Route details retrieved.', route);
  });

  createRoute = asyncHandler(async (req, res) => {
    const route = await transportService.createRoute(req.body);
    return sendCreated(res, 'Route record created.', route);
  });

  updateRoute = asyncHandler(async (req, res) => {
    const route = await transportService.updateRoute(req.params.id, req.body);
    return sendSuccess(res, 'Route configuration updated.', route);
  });

  deleteRoute = asyncHandler(async (req, res) => {
    const route = await transportService.deleteRoute(req.params.id);
    return sendSuccess(res, 'Route record soft-deleted.', route);
  });

  // ─── Stops ────────────────────────────────────────────────────────────────
  getStops = asyncHandler(async (req, res) => {
    const list = await transportService.getStops(req.query);
    return sendSuccess(res, 'Stops sequence list retrieved.', list);
  });

  getStopById = asyncHandler(async (req, res) => {
    const stop = await transportService.getStopById(req.params.id);
    return sendSuccess(res, 'Stop details retrieved.', stop);
  });

  createStop = asyncHandler(async (req, res) => {
    const stop = await transportService.createStop(req.body);
    return sendCreated(res, 'Stop record created.', stop);
  });

  updateStop = asyncHandler(async (req, res) => {
    const stop = await transportService.updateStop(req.params.id, req.body);
    return sendSuccess(res, 'Stop details updated.', stop);
  });

  deleteStop = asyncHandler(async (req, res) => {
    const stop = await transportService.deleteStop(req.params.id);
    return sendSuccess(res, 'Stop record soft-deleted.', stop);
  });

  // ─── Student Allocation ───────────────────────────────────────────────────
  getAllocations = asyncHandler(async (req, res) => {
    const list = await transportService.getAllocations(req.query);
    return sendSuccess(res, 'Student allocations directory retrieved.', list);
  });

  getAllocationById = asyncHandler(async (req, res) => {
    const allocation = await transportService.getAllocationById(req.params.id);
    return sendSuccess(res, 'Allocation details retrieved.', allocation);
  });

  createAllocation = asyncHandler(async (req, res) => {
    const allocation = await transportService.createAllocation(req.body);
    return sendCreated(res, 'Student transport allocation saved.', allocation);
  });

  updateAllocation = asyncHandler(async (req, res) => {
    const allocation = await transportService.updateAllocation(req.params.id, req.body);
    return sendSuccess(res, 'Allocation parameters updated.', allocation);
  });

  deleteAllocation = asyncHandler(async (req, res) => {
    const allocation = await transportService.deleteAllocation(req.params.id);
    return sendSuccess(res, 'Student allocation soft-deleted.', allocation);
  });

  // ─── Fuel Logs ────────────────────────────────────────────────────────────
  getFuelLogs = asyncHandler(async (req, res) => {
    const list = await transportService.getFuelLogs(req.query);
    return sendSuccess(res, 'Fuel consumption logs retrieved.', list);
  });

  getFuelLogById = asyncHandler(async (req, res) => {
    const log = await transportService.getFuelLogById(req.params.id);
    return sendSuccess(res, 'Fuel log details retrieved.', log);
  });

  createFuelLog = asyncHandler(async (req, res) => {
    const log = await transportService.createFuelLog(req.body);
    return sendCreated(res, 'Fuel consumption log saved.', log);
  });

  updateFuelLog = asyncHandler(async (req, res) => {
    const log = await transportService.updateFuelLog(req.params.id, req.body);
    return sendSuccess(res, 'Fuel log parameters updated.', log);
  });

  deleteFuelLog = asyncHandler(async (req, res) => {
    const log = await transportService.deleteFuelLog(req.params.id);
    return sendSuccess(res, 'Fuel log entry soft-deleted.', log);
  });

  // ─── Maintenance ──────────────────────────────────────────────────────────
  getMaintenances = asyncHandler(async (req, res) => {
    const list = await transportService.getMaintenances(req.query);
    return sendSuccess(res, 'Vehicle maintenance logs retrieved.', list);
  });

  getMaintenanceById = asyncHandler(async (req, res) => {
    const maintenance = await transportService.getMaintenanceById(req.params.id);
    return sendSuccess(res, 'Maintenance record retrieved.', maintenance);
  });

  createMaintenance = asyncHandler(async (req, res) => {
    const maintenance = await transportService.createMaintenance(req.body);
    return sendCreated(res, 'Vehicle maintenance log saved.', maintenance);
  });

  updateMaintenance = asyncHandler(async (req, res) => {
    const maintenance = await transportService.updateMaintenance(req.params.id, req.body);
    return sendSuccess(res, 'Maintenance parameters updated.', maintenance);
  });

  deleteMaintenance = asyncHandler(async (req, res) => {
    const maintenance = await transportService.deleteMaintenance(req.params.id);
    return sendSuccess(res, 'Maintenance log soft-deleted.', maintenance);
  });

  // ─── Transport Fees ───────────────────────────────────────────────────────
  getTransportFees = asyncHandler(async (req, res) => {
    const list = await transportService.getTransportFees(req.query);
    return sendSuccess(res, 'Transport fees directory retrieved.', list);
  });

  getTransportFeeById = asyncHandler(async (req, res) => {
    const fee = await transportService.getTransportFeeById(req.params.id);
    return sendSuccess(res, 'Transport fee details retrieved.', fee);
  });

  createTransportFee = asyncHandler(async (req, res) => {
    const fee = await transportService.createTransportFee(req.body);
    return sendCreated(res, 'Transport fee rule created.', fee);
  });

  updateTransportFee = asyncHandler(async (req, res) => {
    const fee = await transportService.updateTransportFee(req.params.id, req.body);
    return sendSuccess(res, 'Transport fee rule parameters updated.', fee);
  });

  deleteTransportFee = asyncHandler(async (req, res) => {
    const fee = await transportService.deleteTransportFee(req.params.id);
    return sendSuccess(res, 'Transport fee record soft-deleted.', fee);
  });
}

module.exports = new TransportController();
