const { body } = require('express-validator');

const createVehicleSchema = [
  body('vehicleNo').trim().notEmpty().withMessage('Vehicle number is required.'),
  body('registrationNo').trim().notEmpty().withMessage('Registration number is required.'),
  body('capacity').isNumeric().withMessage('Capacity must be a numeric value.'),
  body('manufacturer').trim().notEmpty().withMessage('Manufacturer is required.'),
  body('model').trim().notEmpty().withMessage('Model is required.'),
  body('insuranceNo').trim().notEmpty().withMessage('Insurance number is required.'),
  body('insuranceExpiry').isISO8601().withMessage('Valid insurance expiry ISO date is required.')
];

const createDriverSchema = [
  body('name').trim().notEmpty().withMessage('Driver Name is required.'),
  body('licenseNo').trim().notEmpty().withMessage('License number is required.'),
  body('licenseExpiry').isISO8601().withMessage('Valid license expiry ISO date is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.')
];

const createRouteSchema = [
  body('routeName').trim().notEmpty().withMessage('Route Name is required.'),
  body('routeCode').trim().notEmpty().withMessage('Route Code is required.'),
  body('distance').isNumeric().withMessage('Distance must be a numeric value.'),
  body('estimatedTime').trim().notEmpty().withMessage('Estimated time is required.')
];

const createStopSchema = [
  body('routeId').isMongoId().withMessage('Valid Route reference is required.'),
  body('stopName').trim().notEmpty().withMessage('Stop Name is required.'),
  body('pickupTime').trim().notEmpty().withMessage('Pickup time is required.'),
  body('dropTime').trim().notEmpty().withMessage('Drop time is required.'),
  body('sequenceOrder').isNumeric().withMessage('Sequence order must be numeric.')
];

const createAllocationSchema = [
  body('studentId').isMongoId().withMessage('Valid Student reference is required.'),
  body('routeId').isMongoId().withMessage('Valid Route reference is required.'),
  body('pickupStopId').isMongoId().withMessage('Valid Pickup Stop reference is required.'),
  body('dropStopId').isMongoId().withMessage('Valid Drop Stop reference is required.')
];

const createFuelLogSchema = [
  body('vehicleId').isMongoId().withMessage('Valid Vehicle reference is required.'),
  body('fuelQuantity').isNumeric().withMessage('Fuel quantity must be numeric.'),
  body('price').isNumeric().withMessage('Price must be numeric.'),
  body('odometerReading').isNumeric().withMessage('Odometer reading must be numeric.')
];

const createMaintenanceSchema = [
  body('vehicleId').isMongoId().withMessage('Valid Vehicle reference is required.'),
  body('serviceDate').isISO8601().withMessage('Valid service ISO date is required.'),
  body('repairDetails').trim().notEmpty().withMessage('Repair details are required.'),
  body('cost').isNumeric().withMessage('Cost must be a numeric value.')
];

const createTransportFeeSchema = [
  body('studentId').isMongoId().withMessage('Valid Student reference is required.'),
  body('dueDate').isISO8601().withMessage('Valid due ISO date is required.')
];

module.exports = {
  createVehicleSchema,
  createDriverSchema,
  createRouteSchema,
  createStopSchema,
  createAllocationSchema,
  createFuelLogSchema,
  createMaintenanceSchema,
  createTransportFeeSchema
};
