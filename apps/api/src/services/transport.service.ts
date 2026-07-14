import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { VehicleType, VehicleStatus, TripType, TransportAttendanceStatus } from '@prisma/client';

export const transportService = {
  // Settings
  async getSettings(tenantId: string) {
    let settings = await prisma.transportSettings.findUnique({
      where: { tenantId }
    });
    if (!settings) {
      settings = await prisma.transportSettings.create({
        data: { tenantId }
      });
    }
    return settings;
  },

  async updateSettings(tenantId: string, data: any) {
    const settings = await this.getSettings(tenantId);
    return prisma.transportSettings.update({
      where: { id: settings.id },
      data: {
        transportEnabled: data.transportEnabled,
        capacityWarningsEnabled: data.capacityWarningsEnabled,
        transportAttendanceEnabled: data.transportAttendanceEnabled
      }
    });
  },

  // Vehicles
  async listVehicles(tenantId: string) {
    return prisma.vehicle.findMany({
      where: { tenantId },
      orderBy: { registrationNumber: 'asc' }
    });
  },

  async createVehicle(
    tenantId: string,
    data: {
      registrationNumber: string;
      vehicleCode?: string;
      vehicleType: VehicleType;
      make?: string;
      model?: string;
      year?: number;
      seatingCapacity: number;
      notes?: string;
      insuranceExpiry?: string;
      fitnessExpiry?: string;
      permitExpiry?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.vehicle.findUnique({
      where: { tenantId_registrationNumber: { tenantId, registrationNumber: data.registrationNumber } }
    });
    if (existing) throw new AppError(400, 'Vehicle registration number already exists within tenant');

    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId,
        registrationNumber: data.registrationNumber,
        vehicleCode: data.vehicleCode || null,
        vehicleType: data.vehicleType,
        make: data.make || null,
        model: data.model || null,
        year: data.year || null,
        seatingCapacity: data.seatingCapacity,
        notes: data.notes || null,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
        fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry) : null,
        permitExpiry: data.permitExpiry ? new Date(data.permitExpiry) : null,
        status: VehicleStatus.ACTIVE
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'VEHICLE_CREATE',
      entityType: 'Vehicle',
      entityId: vehicle.id,
      newValues: vehicle
    });

    return vehicle;
  },

  // Drivers
  async listDrivers(tenantId: string) {
    return prisma.driverProfile.findMany({
      where: { tenantId },
      include: { employee: true },
      orderBy: { fullName: 'asc' }
    });
  },

  async createDriver(
    tenantId: string,
    data: {
      employeeId?: string;
      fullName?: string;
      phone?: string;
      licenseNumber: string;
      licenseExpiry?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    if (data.employeeId) {
      const existingProfile = await prisma.driverProfile.findUnique({
        where: { employeeId: data.employeeId }
      });
      if (existingProfile) throw new AppError(400, 'Employee already mapped as driver');
    }

    const driver = await prisma.driverProfile.create({
      data: {
        tenantId,
        employeeId: data.employeeId || null,
        fullName: data.fullName || null,
        phone: data.phone || null,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        status: 'ACTIVE'
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'DRIVER_CREATE',
      entityType: 'DriverProfile',
      entityId: driver.id,
      newValues: driver
    });

    return driver;
  },

  // Routes
  async listRoutes(tenantId: string) {
    return prisma.transportRoute.findMany({
      where: { tenantId },
      include: { stops: { include: { stop: true } } },
      orderBy: { name: 'asc' }
    });
  },

  async createRoute(tenantId: string, data: { name: string; code?: string; description?: string }, actorUserId: string, actorEmail: string) {
    const existing = await prisma.transportRoute.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } }
    });
    if (existing) throw new AppError(400, 'Transport Route name already exists');

    const route = await prisma.transportRoute.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        status: 'ACTIVE'
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'ROUTE_CREATE',
      entityType: 'TransportRoute',
      entityId: route.id,
      newValues: route
    });

    return route;
  },

  // Stops
  async listStops(tenantId: string) {
    return prisma.transportStop.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  },

  async createStop(
    tenantId: string,
    data: { name: string; code?: string; addressText?: string; latitude?: number; longitude?: number },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.transportStop.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } }
    });
    if (existing) throw new AppError(400, 'Stop name already exists');

    const stop = await prisma.transportStop.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code || null,
        addressText: data.addressText || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        status: 'ACTIVE'
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'STOP_CREATE',
      entityType: 'TransportStop',
      entityId: stop.id,
      newValues: stop
    });

    return stop;
  },

  // Route Stop Mapping Sequence
  async addStopToRoute(
    tenantId: string,
    data: {
      routeId: string;
      stopId: string;
      sequenceNumber: number;
      plannedArrivalTime?: string;
      plannedDepartureTime?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const route = await prisma.transportRoute.findFirst({ where: { id: data.routeId, tenantId } });
    if (!route) throw new AppError(404, 'Route not found');

    const stop = await prisma.transportStop.findFirst({ where: { id: data.stopId, tenantId } });
    if (!stop) throw new AppError(404, 'Stop not found');

    const seqExisting = await prisma.routeStop.findUnique({
      where: { tenantId_routeId_sequenceNumber: { tenantId, routeId: data.routeId, sequenceNumber: data.sequenceNumber } }
    });
    if (seqExisting) throw new AppError(400, 'Duplicate sequence number rejected');

    const mapping = await prisma.routeStop.create({
      data: {
        tenantId,
        routeId: data.routeId,
        stopId: data.stopId,
        sequenceNumber: data.sequenceNumber,
        plannedArrivalTime: data.plannedArrivalTime || null,
        plannedDepartureTime: data.plannedDepartureTime || null
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'ROUTE_STOP_ADD',
      entityType: 'RouteStop',
      entityId: mapping.id,
      newValues: mapping
    });

    return mapping;
  },

  // Trips
  async listTrips(tenantId: string, routeId?: string) {
    const where: any = { tenantId };
    if (routeId) where.routeId = routeId;
    return prisma.transportTrip.findMany({
      where,
      include: { route: true, vehicle: true, driver: true },
      orderBy: { name: 'asc' }
    });
  },

  async createTrip(
    tenantId: string,
    data: {
      routeId: string;
      vehicleId: string;
      driverProfileId?: string;
      tripType: TripType;
      name: string;
      startTime?: string;
      endTime?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const route = await prisma.transportRoute.findFirst({ where: { id: data.routeId, tenantId } });
    if (!route) throw new AppError(404, 'Route not found');

    const vehicle = await prisma.vehicle.findFirst({ where: { id: data.vehicleId, tenantId } });
    if (!vehicle) throw new AppError(404, 'Vehicle not found');

    if (data.driverProfileId) {
      const driver = await prisma.driverProfile.findFirst({ where: { id: data.driverProfileId, tenantId } });
      if (!driver) throw new AppError(404, 'Driver profile not found');
    }

    const trip = await prisma.transportTrip.create({
      data: {
        tenantId,
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        driverProfileId: data.driverProfileId || null,
        tripType: data.tripType,
        name: data.name,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        status: 'ACTIVE'
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'TRIP_CREATE',
      entityType: 'TransportTrip',
      entityId: trip.id,
      newValues: trip
    });

    return trip;
  },

  // Student assignments
  async assignStudent(
    tenantId: string,
    data: {
      academicYearId: string;
      studentId: string;
      studentEnrollmentId: string;
      pickupTripId?: string;
      pickupStopId?: string;
      dropTripId?: string;
      dropStopId?: string;
      effectiveFrom: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const student = await prisma.student.findFirst({ where: { id: data.studentId, tenantId } });
    if (!student) throw new AppError(404, 'Student belongs to tenant');

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { id: data.studentEnrollmentId, studentId: data.studentId, tenantId }
    });
    if (!enrollment) throw new AppError(400, 'Enrollment valid check failed');

    // Stop route validity check
    if (data.pickupTripId && data.pickupStopId) {
      const trip = await prisma.transportTrip.findFirst({ where: { id: data.pickupTripId, tenantId } });
      if (!trip) throw new AppError(404, 'Pickup trip not found');

      const isStopMapped = await prisma.routeStop.findFirst({
        where: { tenantId, routeId: trip.routeId, stopId: data.pickupStopId }
      });
      if (!isStopMapped) throw new AppError(400, 'Pickup stop must belong to route');

      // Seating capacity warning checks
      const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
      const currentAssigned = await prisma.studentTransportAssignment.count({
        where: { tenantId, pickupTripId: data.pickupTripId, status: 'ACTIVE' }
      });
      if (vehicle && currentAssigned >= vehicle.seatingCapacity) {
        console.warn(`Capacity warning: vehicle ${vehicle.registrationNumber} seating capacity limit reached!`);
      }
    }

    if (data.dropTripId && data.dropStopId) {
      const trip = await prisma.transportTrip.findFirst({ where: { id: data.dropTripId, tenantId } });
      if (!trip) throw new AppError(404, 'Drop trip not found');

      const isStopMapped = await prisma.routeStop.findFirst({
        where: { tenantId, routeId: trip.routeId, stopId: data.dropStopId }
      });
      if (!isStopMapped) throw new AppError(400, 'Drop stop must belong to route');
    }

    // Prevent duplicate active assignments
    await prisma.studentTransportAssignment.deleteMany({
      where: { tenantId, academicYearId: data.academicYearId, studentId: data.studentId }
    });

    const assignment = await prisma.studentTransportAssignment.create({
      data: {
        tenantId,
        academicYearId: data.academicYearId,
        studentId: data.studentId,
        studentEnrollmentId: data.studentEnrollmentId,
        pickupTripId: data.pickupTripId || null,
        pickupStopId: data.pickupStopId || null,
        dropTripId: data.dropTripId || null,
        dropStopId: data.dropStopId || null,
        effectiveFrom: new Date(data.effectiveFrom),
        status: 'ACTIVE',
        assignedByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'TRANSPORT_ASSIGN',
      entityType: 'StudentTransportAssignment',
      entityId: assignment.id,
      newValues: assignment
    });

    return assignment;
  },

  // Bulk assignment
  async bulkAssign(
    tenantId: string,
    data: {
      academicYearId: string;
      studentIds: string[];
      pickupTripId?: string;
      pickupStopId?: string;
      dropTripId?: string;
      dropStopId?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const list: any[] = [];
    for (const studentId of data.studentIds) {
      const enrollment = await prisma.studentEnrollment.findFirst({
        where: { studentId, academicYearId: data.academicYearId, tenantId, isCurrent: true }
      });
      if (!enrollment) continue;

      const assign = await this.assignStudent(
        tenantId,
        {
          academicYearId: data.academicYearId,
          studentId,
          studentEnrollmentId: enrollment.id,
          pickupTripId: data.pickupTripId,
          pickupStopId: data.pickupStopId,
          dropTripId: data.dropTripId,
          dropStopId: data.dropStopId,
          effectiveFrom: new Date().toISOString()
        },
        actorUserId,
        actorEmail
      );
      list.push(assign);
    }
    return list;
  },

  // Attendance mark
  async markAttendance(
    tenantId: string,
    data: {
      tripId: string;
      studentId: string;
      date: string;
      status: TransportAttendanceStatus;
    },
    actorUserId: string
  ) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const record = await prisma.transportAttendance.upsert({
      where: {
        tenantId_tripId_studentId_date: {
          tenantId,
          tripId: data.tripId,
          studentId: data.studentId,
          date
        }
      },
      update: {
        status: data.status,
        markedByUserId: actorUserId
      },
      create: {
        tenantId,
        tripId: data.tripId,
        studentId: data.studentId,
        date,
        status: data.status,
        markedByUserId: actorUserId
      }
    });

    return record;
  },

  // Student portal lookups
  async getStudentAssignment(tenantId: string, studentId: string) {
    return prisma.studentTransportAssignment.findFirst({
      where: { tenantId, studentId, status: 'ACTIVE' },
      include: {
        pickupTrip: { include: { vehicle: true, route: true } },
        pickupStop: true,
        dropTrip: { include: { vehicle: true, route: true } },
        dropStop: true
      }
    });
  },

  async getChildAssignment(tenantId: string, studentId: string, parentUserId: string) {
    const guardian = await prisma.guardian.findFirst({ where: { userId: parentUserId, tenantId } });
    if (!guardian) throw new AppError(403, 'Unauthorized parent profile access');

    const link = await prisma.studentGuardian.findFirst({
      where: { tenantId, studentId, guardianId: guardian.id }
    });
    if (!link) throw new AppError(403, 'Guardian child transport details blocked');

    return this.getStudentAssignment(tenantId, studentId);
  },

  // Dashboard Metrics
  async getDashboardMetrics(tenantId: string) {
    const activeVehicles = await prisma.vehicle.count({ where: { tenantId, status: VehicleStatus.ACTIVE } });
    const activeRoutes = await prisma.transportRoute.count({ where: { tenantId, status: 'ACTIVE' } });
    const studentsAssigned = await prisma.studentTransportAssignment.count({
      where: { tenantId, status: 'ACTIVE' }
    });

    const maintenanceVehicles = await prisma.vehicle.count({
      where: { tenantId, status: VehicleStatus.MAINTENANCE }
    });

    const todayTrips = await prisma.transportTrip.count({ where: { tenantId, status: 'ACTIVE' } });

    return {
      activeVehicles,
      activeRoutes,
      studentsAssigned,
      maintenanceVehicles,
      todayTrips
    };
  }
};
