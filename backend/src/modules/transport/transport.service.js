const transportRepository = require('./transport.repository');
const ApiError = require('../../utils/apiError.util');
const mongoose = require('mongoose');

class TransportService {
  // ─── Dashboard Stats ──────────────────────────────────────────────────────
  async getDashboardStats() {
    const vehicles = await transportRepository.findVehicles({});
    const drivers = await transportRepository.findDrivers({});
    const allocations = await transportRepository.findAllocations({});
    const fuelLogs = await transportRepository.findFuelLogs({});
    const maintenances = await transportRepository.findMaintenances({});

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const totalDrivers = drivers.length;
    const assignedStudents = allocations.filter(a => a.status === 'active').length;

    // Fuel costs summary
    const fuelCost = fuelLogs.reduce((acc, log) => acc + (log.price * log.fuelQuantity), 0);

    // Maintenance Alerts: Vehicles due for insurance renewal in the next 30 days
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const maintenanceAlerts = vehicles
      .filter(v => v.insuranceExpiry && new Date(v.insuranceExpiry) <= thirtyDaysFromNow)
      .map(v => ({
        vehicleId: v._id,
        vehicleNo: v.vehicleNo,
        alertType: 'Insurance Expiry',
        expiryDate: v.insuranceExpiry
      }));

    return {
      totalVehicles,
      activeVehicles,
      totalDrivers,
      assignedStudents,
      todayTrips: totalVehicles > 0 ? activeVehicles * 2 : 0, // simple dynamic trip calculation
      fuelCost,
      maintenanceAlerts
    };
  }

  // ─── Vehicles ─────────────────────────────────────────────────────────────
  async getVehicles(queryParams) {
    const filter = {};
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.search) {
      filter.$or = [
        { vehicleNo: { $regex: queryParams.search, $options: 'i' } },
        { registrationNo: { $regex: queryParams.search, $options: 'i' } },
        { manufacturer: { $regex: queryParams.search, $options: 'i' } },
        { model: { $regex: queryParams.search, $options: 'i' } }
      ];
    }
    return transportRepository.findVehicles(filter);
  }

  async getVehicleById(id) {
    const vehicle = await transportRepository.findVehicleById(id);
    if (!vehicle) throw ApiError.notFound('Vehicle not found.');
    return vehicle;
  }

  async createVehicle(payload) {
    const { vehicleNo, registrationNo, capacity, manufacturer, model, insuranceNo, insuranceExpiry } = payload;
    if (!vehicleNo || !registrationNo || !capacity || !manufacturer || !model || !insuranceNo || !insuranceExpiry) {
      throw ApiError.badRequest('Missing required vehicle fields.');
    }
    return transportRepository.createVehicle({
      ...payload,
      capacity: Number(capacity),
      insuranceExpiry: new Date(insuranceExpiry)
    });
  }

  async updateVehicle(id, payload) {
    await this.getVehicleById(id);
    return transportRepository.updateVehicle(id, payload);
  }

  async deleteVehicle(id) {
    await this.getVehicleById(id);
    return transportRepository.softDeleteVehicle(id);
  }

  // ─── Drivers ──────────────────────────────────────────────────────────────
  async getDrivers(queryParams) {
    const filter = {};
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.search) {
      filter.name = { $regex: queryParams.search, $options: 'i' };
    }
    return transportRepository.findDrivers(filter);
  }

  async getDriverById(id) {
    const driver = await transportRepository.findDriverById(id);
    if (!driver) throw ApiError.notFound('Driver not found.');
    return driver;
  }

  async createDriver(payload) {
    const { name, licenseNo, licenseExpiry, phone } = payload;
    if (!name || !licenseNo || !licenseExpiry || !phone) {
      throw ApiError.badRequest('Missing required driver fields.');
    }
    return transportRepository.createDriver({
      ...payload,
      licenseExpiry: new Date(licenseExpiry)
    });
  }

  async updateDriver(id, payload) {
    await this.getDriverById(id);
    return transportRepository.updateDriver(id, payload);
  }

  async deleteDriver(id) {
    await this.getDriverById(id);
    return transportRepository.softDeleteDriver(id);
  }

  // ─── Routes ───────────────────────────────────────────────────────────────
  async getRoutes(queryParams) {
    const filter = {};
    if (queryParams.search) {
      filter.$or = [
        { routeName: { $regex: queryParams.search, $options: 'i' } },
        { routeCode: { $regex: queryParams.search, $options: 'i' } }
      ];
    }
    return transportRepository.findRoutes(filter);
  }

  async getRouteById(id) {
    const route = await transportRepository.findRouteById(id);
    if (!route) throw ApiError.notFound('Route not found.');
    return route;
  }

  async createRoute(payload) {
    const { routeName, routeCode, distance, estimatedTime } = payload;
    if (!routeName || !routeCode || !distance || !estimatedTime) {
      throw ApiError.badRequest('Missing required route fields.');
    }
    return transportRepository.createRoute({
      ...payload,
      distance: Number(distance)
    });
  }

  async updateRoute(id, payload) {
    await this.getRouteById(id);
    return transportRepository.updateRoute(id, payload);
  }

  async deleteRoute(id) {
    await this.getRouteById(id);
    return transportRepository.softDeleteRoute(id);
  }

  // ─── Stops ────────────────────────────────────────────────────────────────
  async getStops(queryParams) {
    const filter = {};
    if (queryParams.routeId) filter.routeId = queryParams.routeId;
    return transportRepository.findStops(filter);
  }

  async getStopById(id) {
    const stop = await transportRepository.findStopById(id);
    if (!stop) throw ApiError.notFound('Stop not found.');
    return stop;
  }

  async createStop(payload) {
    const { routeId, stopName, pickupTime, dropTime, sequenceOrder } = payload;
    if (!routeId || !stopName || !pickupTime || !dropTime || sequenceOrder === undefined) {
      throw ApiError.badRequest('Missing required stop fields.');
    }
    return transportRepository.createStop({
      ...payload,
      sequenceOrder: Number(sequenceOrder)
    });
  }

  async updateStop(id, payload) {
    await this.getStopById(id);
    return transportRepository.updateStop(id, payload);
  }

  async deleteStop(id) {
    await this.getStopById(id);
    return transportRepository.softDeleteStop(id);
  }

  // ─── Student Allocation & Cross Module Fees Sync ──────────────────────────
  async getAllocations(queryParams) {
    const filter = {};
    if (queryParams.studentId) filter.studentId = queryParams.studentId;
    return transportRepository.findAllocations(filter);
  }

  async getAllocationById(id) {
    const allocation = await transportRepository.findAllocationById(id);
    if (!allocation) throw ApiError.notFound('Allocation details not found.');
    return allocation;
  }

  async createAllocation(payload) {
    const { studentId, routeId, pickupStopId, dropStopId, academicYear = '2026-2027' } = payload;
    if (!studentId || !routeId || !pickupStopId || !dropStopId) {
      throw ApiError.badRequest('Missing student allocation fields.');
    }

    const allocation = await transportRepository.createAllocation({
      studentId,
      routeId,
      pickupStopId,
      dropStopId,
      academicYear,
      status: 'active'
    });

    // Auto-sync Transport Fee mapping
    await this.syncTransportBilling(studentId);

    return allocation;
  }

  async updateAllocation(id, payload) {
    const allocation = await transportRepository.findAllocationById(id);
    if (!allocation) throw ApiError.notFound('Allocation not found.');

    const updated = await transportRepository.updateAllocation(id, payload);

    // Sync billing details
    await this.syncTransportBilling(allocation.studentId._id || allocation.studentId);

    return updated;
  }

  async deleteAllocation(id) {
    const allocation = await transportRepository.findAllocationById(id);
    if (!allocation) throw ApiError.notFound('Allocation not found.');

    const deleted = await transportRepository.softDeleteAllocation(id);

    // Remove or soft-delete billing details
    const studentId = allocation.studentId._id || allocation.studentId;
    const TransportFee = mongoose.models.TransportFee || mongoose.model('TransportFee');
    await TransportFee.findOneAndUpdate({ studentId }, { $set: { isDeleted: true } });

    // Also remove the corresponding StudentFee invoice entry
    const StudentFee = mongoose.models.StudentFee || mongoose.model('StudentFee');
    const FeeCategory = mongoose.models.FeeCategory || mongoose.model('FeeCategory');
    const category = await FeeCategory.findOne({ name: 'Transport Fees' });
    if (category) {
      const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure');
      const structures = await FeeStructure.find({ category: category._id });
      const structureIds = structures.map(s => s._id);
      await StudentFee.findOneAndUpdate(
        { studentId, feeStructureId: { $in: structureIds } },
        { $set: { isDeleted: true } }
      );
    }

    return deleted;
  }

  // Helper method: Sync student transport fee structure billing
  async syncTransportBilling(studentId) {
    try {
      const Student = mongoose.models.Student || mongoose.model('Student');
      const studentObj = await Student.findById(studentId);
      if (!studentObj) return;

      const TransportFee = mongoose.models.TransportFee || mongoose.model('TransportFee');
      
      // Upsert TransportFee profile details
      let transportFee = await TransportFee.findOne({ studentId, isDeleted: false });
      if (!transportFee) {
        transportFee = await TransportFee.create({
          studentId,
          monthlyFee: 150,
          quarterlyFee: 450,
          yearlyFee: 1500,
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          status: 'unpaid'
        });
      }

      // Upsert billing module StudentFee invoices entry
      const FeeCategory = mongoose.models.FeeCategory || mongoose.model('FeeCategory');
      const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure');
      const StudentFee = mongoose.models.StudentFee || mongoose.model('StudentFee');

      // 1. Get/create FeeCategory "Transport Fees"
      let category = await FeeCategory.findOne({ name: 'Transport Fees', isDeleted: false });
      if (!category) {
        category = await FeeCategory.create({
          name: 'Transport Fees',
          description: 'Monthly school transport and fleet services billing'
        });
      }

      // 2. Get/create FeeStructure matching student class
      let structure = await FeeStructure.findOne({ 
        category: category._id, 
        class: studentObj.class, 
        isDeleted: false 
      });
      if (!structure) {
        structure = await FeeStructure.create({
          academicYear: studentObj.academicYear || '2026-2027',
          class: studentObj.class,
          category: category._id,
          amount: 1500,
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        });
      }

      // 3. Get/create StudentFee allocation invoice
      let studentFee = await StudentFee.findOne({ 
        studentId, 
        feeStructureId: structure._id, 
        isDeleted: false 
      });
      if (!studentFee) {
        await StudentFee.create({
          studentId,
          feeStructureId: structure._id,
          amount: 1500,
          totalAmount: 1500,
          pendingAmount: 1500,
          status: 'unpaid'
        });
      }
    } catch (err) {
      console.error('[Sync Transport Billing Error]:', err);
    }
  }

  // ─── Fuel Logs ────────────────────────────────────────────────────────────
  async getFuelLogs(queryParams) {
    const filter = {};
    if (queryParams.vehicleId) filter.vehicleId = queryParams.vehicleId;
    return transportRepository.findFuelLogs(filter);
  }

  async getFuelLogById(id) {
    const log = await transportRepository.findFuelLogById(id);
    if (!log) throw ApiError.notFound('Fuel log entry not found.');
    return log;
  }

  async createFuelLog(payload) {
    const { vehicleId, fuelQuantity, price, odometerReading } = payload;
    if (!vehicleId || !fuelQuantity || !price || !odometerReading) {
      throw ApiError.badRequest('Missing required fuel log fields.');
    }
    return transportRepository.createFuelLog({
      ...payload,
      fuelQuantity: Number(fuelQuantity),
      price: Number(price),
      odometerReading: Number(odometerReading)
    });
  }

  async updateFuelLog(id, payload) {
    await this.getFuelLogById(id);
    return transportRepository.updateFuelLog(id, payload);
  }

  async deleteFuelLog(id) {
    await this.getFuelLogById(id);
    return transportRepository.softDeleteFuelLog(id);
  }

  // ─── Maintenance ──────────────────────────────────────────────────────────
  async getMaintenances(queryParams) {
    const filter = {};
    if (queryParams.vehicleId) filter.vehicleId = queryParams.vehicleId;
    return transportRepository.findMaintenances(filter);
  }

  async getMaintenanceById(id) {
    const maintenance = await transportRepository.findMaintenanceById(id);
    if (!maintenance) throw ApiError.notFound('Maintenance record not found.');
    return maintenance;
  }

  async createMaintenance(payload) {
    const { vehicleId, serviceDate, repairDetails, cost } = payload;
    if (!vehicleId || !serviceDate || !repairDetails || cost === undefined) {
      throw ApiError.badRequest('Missing required maintenance fields.');
    }
    return transportRepository.createMaintenance({
      ...payload,
      cost: Number(cost),
      serviceDate: new Date(serviceDate)
    });
  }

  async updateMaintenance(id, payload) {
    await this.getMaintenanceById(id);
    return transportRepository.updateMaintenance(id, payload);
  }

  async deleteMaintenance(id) {
    await this.getMaintenanceById(id);
    return transportRepository.softDeleteMaintenance(id);
  }

  // ─── Transport Fees ───────────────────────────────────────────────────────
  async getTransportFees(queryParams) {
    const filter = {};
    if (queryParams.studentId) filter.studentId = queryParams.studentId;
    return transportRepository.findTransportFees(filter);
  }

  async getTransportFeeById(id) {
    const fee = await transportRepository.findTransportFeeById(id);
    if (!fee) throw ApiError.notFound('Transport fee record not found.');
    return fee;
  }

  async createTransportFee(payload) {
    const { studentId, dueDate } = payload;
    if (!studentId || !dueDate) {
      throw ApiError.badRequest('Missing required transport fee fields.');
    }
    return transportRepository.createTransportFee({
      ...payload,
      monthlyFee: Number(payload.monthlyFee || 0),
      quarterlyFee: Number(payload.quarterlyFee || 0),
      yearlyFee: Number(payload.yearlyFee || 0),
      dueDate: new Date(dueDate)
    });
  }

  async updateTransportFee(id, payload) {
    await this.getTransportFeeById(id);
    return transportRepository.updateTransportFee(id, payload);
  }

  async deleteTransportFee(id) {
    await this.getTransportFeeById(id);
    return transportRepository.softDeleteTransportFee(id);
  }
}

module.exports = new TransportService();
