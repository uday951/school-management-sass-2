const Vehicle = require('./models/vehicle.model');
const Driver = require('./models/driver.model');
const Route = require('./models/route.model');
const Stop = require('./models/stop.model');
const StudentTransport = require('./models/student-transport.model');
const FuelLog = require('./models/fuel-log.model');
const Maintenance = require('./models/maintenance.model');
const TransportFee = require('./models/transport-fee.model');

class TransportRepository {
  // ─── Vehicles ─────────────────────────────────────────────────────────────
  async findVehicles(filter = {}) {
    return Vehicle.find({ isDeleted: false, ...filter }).lean();
  }

  async findVehicleById(id) {
    return Vehicle.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createVehicle(data) {
    return Vehicle.create(data);
  }

  async updateVehicle(id, data) {
    return Vehicle.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteVehicle(id) {
    return Vehicle.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Drivers ──────────────────────────────────────────────────────────────
  async findDrivers(filter = {}) {
    return Driver.find({ isDeleted: false, ...filter }).populate('assignedVehicle').lean();
  }

  async findDriverById(id) {
    return Driver.findOne({ _id: id, isDeleted: false }).populate('assignedVehicle').lean();
  }

  async createDriver(data) {
    return Driver.create(data);
  }

  async updateDriver(id, data) {
    return Driver.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteDriver(id) {
    return Driver.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Routes ───────────────────────────────────────────────────────────────
  async findRoutes(filter = {}) {
    return Route.find({ isDeleted: false, ...filter })
      .populate('assignedVehicle')
      .populate('assignedDriver')
      .lean();
  }

  async findRouteById(id) {
    return Route.findOne({ _id: id, isDeleted: false })
      .populate('assignedVehicle')
      .populate('assignedDriver')
      .lean();
  }

  async createRoute(data) {
    return Route.create(data);
  }

  async updateRoute(id, data) {
    return Route.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteRoute(id) {
    return Route.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Stops ────────────────────────────────────────────────────────────────
  async findStops(filter = {}) {
    return Stop.find({ isDeleted: false, ...filter }).sort({ sequenceOrder: 1 }).lean();
  }

  async findStopById(id) {
    return Stop.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createStop(data) {
    return Stop.create(data);
  }

  async updateStop(id, data) {
    return Stop.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteStop(id) {
    return Stop.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Student Allocation ───────────────────────────────────────────────────
  async findAllocations(filter = {}) {
    return StudentTransport.find({ isDeleted: false, ...filter })
      .populate('studentId')
      .populate('routeId')
      .populate('pickupStopId')
      .populate('dropStopId')
      .lean();
  }

  async findAllocationById(id) {
    return StudentTransport.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('routeId')
      .populate('pickupStopId')
      .populate('dropStopId')
      .lean();
  }

  async findAllocationByStudentId(studentId) {
    return StudentTransport.findOne({ studentId, isDeleted: false })
      .populate('studentId')
      .populate('routeId')
      .populate('pickupStopId')
      .populate('dropStopId')
      .lean();
  }

  async createAllocation(data) {
    return StudentTransport.create(data);
  }

  async updateAllocation(id, data) {
    return StudentTransport.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteAllocation(id) {
    return StudentTransport.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Fuel Logs ────────────────────────────────────────────────────────────
  async findFuelLogs(filter = {}) {
    return FuelLog.find({ isDeleted: false, ...filter }).populate('vehicleId').sort({ logDate: -1 }).lean();
  }

  async findFuelLogById(id) {
    return FuelLog.findOne({ _id: id, isDeleted: false }).populate('vehicleId').lean();
  }

  async createFuelLog(data) {
    return FuelLog.create(data);
  }

  async updateFuelLog(id, data) {
    return FuelLog.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteFuelLog(id) {
    return FuelLog.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Maintenance ──────────────────────────────────────────────────────────
  async findMaintenances(filter = {}) {
    return Maintenance.find({ isDeleted: false, ...filter }).populate('vehicleId').sort({ serviceDate: -1 }).lean();
  }

  async findMaintenanceById(id) {
    return Maintenance.findOne({ _id: id, isDeleted: false }).populate('vehicleId').lean();
  }

  async createMaintenance(data) {
    return Maintenance.create(data);
  }

  async updateMaintenance(id, data) {
    return Maintenance.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteMaintenance(id) {
    return Maintenance.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }

  // ─── Transport Fees ───────────────────────────────────────────────────────
  async findTransportFees(filter = {}) {
    return TransportFee.find({ isDeleted: false, ...filter }).populate('studentId').lean();
  }

  async findTransportFeeById(id) {
    return TransportFee.findOne({ _id: id, isDeleted: false }).populate('studentId').lean();
  }

  async findTransportFeeByStudentId(studentId) {
    return TransportFee.findOne({ studentId, isDeleted: false }).populate('studentId').lean();
  }

  async createTransportFee(data) {
    return TransportFee.create(data);
  }

  async updateTransportFee(id, data) {
    return TransportFee.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDeleteTransportFee(id) {
    return TransportFee.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
  }
}

module.exports = new TransportRepository();
