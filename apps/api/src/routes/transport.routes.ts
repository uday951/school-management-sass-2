import { Router } from 'express';
import { z } from 'zod';
import { transportService } from '../services/transport.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { VehicleType, VehicleStatus, TripType, TransportAttendanceStatus } from '@prisma/client';

const router = Router();

// Student self access
router.get('/student/me', authenticateToken, async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user!.id, tenantId: req.tenantId! }
    });
    if (!student) {
      return res.json({ statusCode: 200, message: 'No student profile', data: null });
    }
    const assign = await transportService.getStudentAssignment(req.tenantId!, student.id);
    res.json({ statusCode: 200, message: 'Student transport assignment', data: assign });
  } catch (error) {
    next(error);
  }
});

// Guardian linked-child access
router.get('/guardian/children/:studentId', authenticateToken, async (req, res, next) => {
  try {
    const assign = await transportService.getChildAssignment(req.tenantId!, req.params.studentId, req.user!.id);
    res.json({ statusCode: 200, message: 'Child transport assignment', data: assign });
  } catch (error) {
    next(error);
  }
});

// Admin endpoints
router.get('/dashboard', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const stats = await transportService.getDashboardMetrics(req.tenantId!);
    res.json({ statusCode: 200, message: 'Transport dashboard metrics retrieved', data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const settings = await transportService.getSettings(req.tenantId!);
    res.json({ statusCode: 200, message: 'Transport settings retrieved', data: settings });
  } catch (error) {
    next(error);
  }
});

const settingsSchema = z.object({
  transportEnabled: z.boolean(),
  capacityWarningsEnabled: z.boolean(),
  transportAttendanceEnabled: z.boolean()
});

router.patch('/settings', authenticateToken, requireSchoolAdmin, validateBody(settingsSchema), async (req, res, next) => {
  try {
    const settings = await transportService.updateSettings(req.tenantId!, req.body);
    res.json({ statusCode: 200, message: 'Transport settings updated', data: settings });
  } catch (error) {
    next(error);
  }
});

// Vehicles
router.get('/vehicles', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await transportService.listVehicles(req.tenantId!);
    res.json({ statusCode: 200, message: 'Vehicles list', data: list });
  } catch (error) {
    next(error);
  }
});

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  vehicleCode: z.string().optional(),
  vehicleType: z.nativeEnum(VehicleType),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  seatingCapacity: z.number().int().min(1),
  notes: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  fitnessExpiry: z.string().optional(),
  permitExpiry: z.string().optional()
});

router.post('/vehicles', authenticateToken, requireSchoolAdmin, validateBody(vehicleSchema), async (req, res, next) => {
  try {
    const vehicle = await transportService.createVehicle(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Vehicle created successfully', data: vehicle });
  } catch (error) {
    next(error);
  }
});

// Drivers
router.get('/drivers', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await transportService.listDrivers(req.tenantId!);
    res.json({ statusCode: 200, message: 'Drivers profiles list', data: list });
  } catch (error) {
    next(error);
  }
});

const driverSchema = z.object({
  employeeId: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.string().optional()
});

router.post('/drivers', authenticateToken, requireSchoolAdmin, validateBody(driverSchema), async (req, res, next) => {
  try {
    const driver = await transportService.createDriver(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Driver profile created successfully', data: driver });
  } catch (error) {
    next(error);
  }
});

// Routes
router.get('/routes', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await transportService.listRoutes(req.tenantId!);
    res.json({ statusCode: 200, message: 'Routes list', data: list });
  } catch (error) {
    next(error);
  }
});

const routeSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional()
});

router.post('/routes', authenticateToken, requireSchoolAdmin, validateBody(routeSchema), async (req, res, next) => {
  try {
    const route = await transportService.createRoute(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Route created successfully', data: route });
  } catch (error) {
    next(error);
  }
});

// Stops
router.get('/stops', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await transportService.listStops(req.tenantId!);
    res.json({ statusCode: 200, message: 'Stops list', data: list });
  } catch (error) {
    next(error);
  }
});

const stopSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  addressText: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

router.post('/stops', authenticateToken, requireSchoolAdmin, validateBody(stopSchema), async (req, res, next) => {
  try {
    const stop = await transportService.createStop(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Stop created successfully', data: stop });
  } catch (error) {
    next(error);
  }
});

const addStopSchema = z.object({
  routeId: z.string().min(1),
  stopId: z.string().min(1),
  sequenceNumber: z.number().int().min(1),
  plannedArrivalTime: z.string().optional(),
  plannedDepartureTime: z.string().optional()
});

router.post('/route-stops', authenticateToken, requireSchoolAdmin, validateBody(addStopSchema), async (req, res, next) => {
  try {
    const mapping = await transportService.addStopToRoute(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Stop added to route successfully', data: mapping });
  } catch (error) {
    next(error);
  }
});

// Trips
router.get('/trips', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await transportService.listTrips(req.tenantId!, req.query.routeId as string);
    res.json({ statusCode: 200, message: 'Trips list', data: list });
  } catch (error) {
    next(error);
  }
});

const tripSchema = z.object({
  routeId: z.string().min(1),
  vehicleId: z.string().min(1),
  driverProfileId: z.string().optional(),
  tripType: z.nativeEnum(TripType),
  name: z.string().min(1),
  startTime: z.string().optional(),
  endTime: z.string().optional()
});

router.post('/trips', authenticateToken, requireSchoolAdmin, validateBody(tripSchema), async (req, res, next) => {
  try {
    const trip = await transportService.createTrip(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Trip created successfully', data: trip });
  } catch (error) {
    next(error);
  }
});

// Assignments
const assignSchema = z.object({
  academicYearId: z.string().min(1),
  studentId: z.string().min(1),
  studentEnrollmentId: z.string().min(1),
  pickupTripId: z.string().optional(),
  pickupStopId: z.string().optional(),
  dropTripId: z.string().optional(),
  dropStopId: z.string().optional(),
  effectiveFrom: z.string()
});

router.post('/assignments', authenticateToken, requireSchoolAdmin, validateBody(assignSchema), async (req, res, next) => {
  try {
    const assign = await transportService.assignStudent(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Student transport assigned successfully', data: assign });
  } catch (error) {
    next(error);
  }
});

const bulkAssignSchema = z.object({
  academicYearId: z.string().min(1),
  studentIds: z.array(z.string()).min(1),
  pickupTripId: z.string().optional(),
  pickupStopId: z.string().optional(),
  dropTripId: z.string().optional(),
  dropStopId: z.string().optional()
});

router.post('/assignments/bulk', authenticateToken, requireSchoolAdmin, validateBody(bulkAssignSchema), async (req, res, next) => {
  try {
    const list = await transportService.bulkAssign(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Bulk assignments processed', data: list });
  } catch (error) {
    next(error);
  }
});

// Attendance mark
const attendanceSchema = z.object({
  tripId: z.string().min(1),
  studentId: z.string().min(1),
  date: z.string(),
  status: z.nativeEnum(TransportAttendanceStatus)
});

router.post('/attendance', authenticateToken, requireSchoolAdmin, validateBody(attendanceSchema), async (req, res, next) => {
  try {
    const record = await transportService.markAttendance(req.tenantId!, req.body, req.user!.id);
    res.json({ statusCode: 200, message: 'Transport attendance marked', data: record });
  } catch (error) {
    next(error);
  }
});

import { prisma } from '../prisma';
export default router;
