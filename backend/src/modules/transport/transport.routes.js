const express = require('express');
const transportController = require('./transport.controller');
const { 
  createVehicleSchema, 
  createDriverSchema, 
  createRouteSchema, 
  createStopSchema, 
  createAllocationSchema, 
  createFuelLogSchema, 
  createMaintenanceSchema, 
  createTransportFeeSchema 
} = require('./transport.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

// ─── Dashboard Stats ──────────────────────────────────────────────────────
router.get('/dashboard-stats', transportController.getDashboardStats);

// ─── Vehicles ─────────────────────────────────────────────────────────────
router.get('/vehicles', transportController.getVehicles);
router.get('/vehicles/:id', transportController.getVehicleById);
router.post('/vehicles', createVehicleSchema, validate, transportController.createVehicle);
router.put('/vehicles/:id', transportController.updateVehicle);
router.delete('/vehicles/:id', transportController.deleteVehicle);

// ─── Drivers ──────────────────────────────────────────────────────────────
router.get('/drivers', transportController.getDrivers);
router.get('/drivers/:id', transportController.getDriverById);
router.post('/drivers', createDriverSchema, validate, transportController.createDriver);
router.put('/drivers/:id', transportController.updateDriver);
router.delete('/drivers/:id', transportController.deleteDriver);

// ─── Routes ───────────────────────────────────────────────────────────────
router.get('/routes', transportController.getRoutes);
router.get('/routes/:id', transportController.getRouteById);
router.post('/routes', createRouteSchema, validate, transportController.createRoute);
router.put('/routes/:id', transportController.updateRoute);
router.delete('/routes/:id', transportController.deleteRoute);

// ─── Stops ────────────────────────────────────────────────────────────────
router.get('/stops', transportController.getStops);
router.get('/stops/:id', transportController.getStopById);
router.post('/stops', createStopSchema, validate, transportController.createStop);
router.put('/stops/:id', transportController.updateStop);
router.delete('/stops/:id', transportController.deleteStop);

// ─── Student Allocation ───────────────────────────────────────────────────
router.get('/allocations', transportController.getAllocations);
router.get('/allocations/:id', transportController.getAllocationById);
router.post('/allocations', createAllocationSchema, validate, transportController.createAllocation);
router.put('/allocations/:id', transportController.updateAllocation);
router.delete('/allocations/:id', transportController.deleteAllocation);

// ─── Fuel Logs ────────────────────────────────────────────────────────────
router.get('/fuel-logs', transportController.getFuelLogs);
router.get('/fuel-logs/:id', transportController.getFuelLogById);
router.post('/fuel-logs', createFuelLogSchema, validate, transportController.createFuelLog);
router.put('/fuel-logs/:id', transportController.updateFuelLog);
router.delete('/fuel-logs/:id', transportController.deleteFuelLog);

// ─── Maintenance ──────────────────────────────────────────────────────────
router.get('/maintenances', transportController.getMaintenances);
router.get('/maintenances/:id', transportController.getMaintenanceById);
router.post('/maintenances', createMaintenanceSchema, validate, transportController.createMaintenance);
router.put('/maintenances/:id', transportController.updateMaintenance);
router.delete('/maintenances/:id', transportController.deleteMaintenance);

// ─── Transport Fees ───────────────────────────────────────────────────────
router.get('/fees', transportController.getTransportFees);
router.get('/fees/:id', transportController.getTransportFeeById);
router.post('/fees', createTransportFeeSchema, validate, transportController.createTransportFee);
router.put('/fees/:id', transportController.updateTransportFee);
router.delete('/fees/:id', transportController.deleteTransportFee);

module.exports = router;
