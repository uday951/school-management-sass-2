import { Router } from 'express';
import { z } from 'zod';
import { timetableService } from '../services/timetable.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { 
  BellPeriodType, 
  TimetableEntryType, 
  AvailabilityType, 
  OverrideType, 
  Status,
  RoomType,
  UserType
} from '@prisma/client';

const router = Router();

// ==========================================
// A. SCHOOL WORKING DAYS (Admin Only)
// ==========================================
const workingDaysSchema = z.object({
  workingDays: z.array(z.object({
    dayOfWeek: z.string(),
    isWorkingDay: z.boolean()
  }))
});

router.get('/timetable/working-days', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.getWorkingDays(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Working days retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.put('/timetable/working-days', authenticateToken, requireSchoolAdmin, validateBody(workingDaysSchema), async (req, res, next) => {
  try {
    const data = await timetableService.updateWorkingDays(
      req.tenantId!,
      req.schoolId!,
      req.body.workingDays,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Working days updated', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// B. BELL SCHEDULES & PERIODS (Admin Only)
// ==========================================
const createBellScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false)
});

const updateBellScheduleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  status: z.nativeEnum(Status).optional()
});

const setPeriodsSchema = z.object({
  periods: z.array(z.object({
    name: z.string().min(1),
    periodNumber: z.number().optional(),
    periodType: z.nativeEnum(BellPeriodType),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format HH:MM'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format HH:MM'),
    sortOrder: z.number()
  }))
});

const dayMappingsSchema = z.object({
  mappings: z.array(z.object({
    dayOfWeek: z.string(),
    bellScheduleId: z.string()
  }))
});

router.get('/bell-schedules', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.listBellSchedules(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Bell schedules retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/bell-schedules', authenticateToken, requireSchoolAdmin, validateBody(createBellScheduleSchema), async (req, res, next) => {
  try {
    const data = await timetableService.createBellSchedule(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Bell schedule created', data });
  } catch (error) {
    next(error);
  }
});

router.get('/bell-schedules/day-mappings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.getDaySchedules(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Working day schedules retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.put('/bell-schedules/day-mappings', authenticateToken, requireSchoolAdmin, validateBody(dayMappingsSchema), async (req, res, next) => {
  try {
    const data = await timetableService.setDaySchedules(
      req.tenantId!,
      req.schoolId!,
      req.body.mappings,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Working day schedules updated', data });
  } catch (error) {
    next(error);
  }
});

router.get('/bell-schedules/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.getBellSchedule(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Bell schedule retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/bell-schedules/:id', authenticateToken, requireSchoolAdmin, validateBody(updateBellScheduleSchema), async (req, res, next) => {
  try {
    const data = await timetableService.updateBellSchedule(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Bell schedule updated', data });
  } catch (error) {
    next(error);
  }
});

router.post('/bell-schedules/:id/periods', authenticateToken, requireSchoolAdmin, validateBody(setPeriodsSchema), async (req, res, next) => {
  try {
    const data = await timetableService.setBellPeriods(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body.periods,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Bell schedule periods reconfigured', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// C. ROOM MANAGEMENT (Admin Only)
// ==========================================
const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  roomType: z.nativeEnum(RoomType).optional(),
  capacity: z.number().optional()
});

const updateRoomSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  roomType: z.nativeEnum(RoomType).optional(),
  capacity: z.number().optional(),
  status: z.nativeEnum(Status).optional()
});

router.get('/rooms', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.listRooms(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Rooms retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/rooms', authenticateToken, requireSchoolAdmin, validateBody(createRoomSchema), async (req, res, next) => {
  try {
    const data = await timetableService.createRoom(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Room created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/rooms/:id', authenticateToken, requireSchoolAdmin, validateBody(updateRoomSchema), async (req, res, next) => {
  try {
    const data = await timetableService.updateRoom(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Room updated', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// D. TIMETABLES & ENTRIES (Admin Only)
// ==========================================
const createTimetableSchema = z.object({
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1)
});

const validateEntrySchema = z.object({
  dayOfWeek: z.string(),
  bellPeriodId: z.string(),
  subjectId: z.string().optional(),
  employeeId: z.string().optional(),
  roomId: z.string().optional(),
  entryType: z.nativeEnum(TimetableEntryType),
  notes: z.string().optional()
});

const createEntrySchema = validateEntrySchema;

router.get('/timetables', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.listTimetables(req.tenantId!, req.schoolId!, req.query.academicYearId as string);
    res.json({ statusCode: 200, message: 'Timetables list retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/timetables', authenticateToken, requireSchoolAdmin, validateBody(createTimetableSchema), async (req, res, next) => {
  try {
    const data = await timetableService.createTimetableDraft(
      req.tenantId!,
      req.schoolId!,
      req.body.academicYearId,
      req.body.classId,
      req.body.sectionId,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 201, message: 'Timetable draft established', data });
  } catch (error) {
    next(error);
  }
});

router.get('/timetables/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.getTimetable(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Timetable retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/timetables/:id/entries', authenticateToken, requireSchoolAdmin, validateBody(createEntrySchema), async (req, res, next) => {
  try {
    const data = await timetableService.addTimetableEntry(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 201, message: 'Timetable entry added', data });
  } catch (error) {
    next(error);
  }
});

router.post('/timetables/:id/validate', authenticateToken, requireSchoolAdmin, validateBody(validateEntrySchema), async (req, res, next) => {
  try {
    const skipEntryId = req.query.skipEntryId as string;
    const data = await timetableService.validateSlotConflicts(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      skipEntryId
    );
    res.json({ statusCode: 200, message: 'Slot verification complete', data });
  } catch (error) {
    next(error);
  }
});

router.post('/timetables/:id/publish', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.publishTimetable(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Timetable published successfully', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/timetable-entries/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.deleteTimetableEntry(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Timetable entry deleted', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// E. TEACHER AVAILABILITY (Admin Only)
// ==========================================
const createAvailabilitySchema = z.object({
  employeeId: z.string().min(1),
  dayOfWeek: z.string(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  availabilityType: z.nativeEnum(AvailabilityType),
  reason: z.string().optional()
});

router.get('/teacher-availability', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.listTeacherAvailabilities(req.tenantId!, req.schoolId!, req.query.employeeId as string);
    res.json({ statusCode: 200, message: 'Teacher availabilities retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/teacher-availability', authenticateToken, requireSchoolAdmin, validateBody(createAvailabilitySchema), async (req, res, next) => {
  try {
    const data = await timetableService.createTeacherAvailability(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 201, message: 'Teacher availability added', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/teacher-availability/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.deleteTeacherAvailability(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Teacher availability removed', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// F. TEMPORARY OVERRIDES (Admin Only)
// ==========================================
const createOverrideSchema = z.object({
  date: z.string(),
  bellPeriodId: z.string(),
  overrideType: z.nativeEnum(OverrideType),
  originalTimetableEntryId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  subjectId: z.string().optional(),
  employeeId: z.string().optional(),
  roomId: z.string().optional(),
  reason: z.string().min(1)
});

router.get('/schedule-overrides', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.listOverrides(req.tenantId!, req.schoolId!, req.query.date as string);
    res.json({ statusCode: 200, message: 'Overrides retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/schedule-overrides', authenticateToken, requireSchoolAdmin, validateBody(createOverrideSchema), async (req, res, next) => {
  try {
    const data = await timetableService.createOverride(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 201, message: 'Override established', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/schedule-overrides/:id/cancel', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.cancelOverride(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Override canceled', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// G. SUBSTITUTIONS (Admin Only)
// ==========================================
const assignSubSchema = z.object({
  date: z.string(),
  timetableEntryId: z.string(),
  substituteEmployeeId: z.string(),
  reason: z.string().optional()
});

router.get('/substitutions', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.listSubstitutions(req.tenantId!, req.schoolId!, req.query.date as string);
    res.json({ statusCode: 200, message: 'Substitutions retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/substitutions', authenticateToken, requireSchoolAdmin, validateBody(assignSubSchema), async (req, res, next) => {
  try {
    const data = await timetableService.assignSubstitute(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 201, message: 'Substitute assigned successfully', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/substitutions/:id/cancel', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await timetableService.cancelSubstitution(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({ statusCode: 200, message: 'Substitution canceled', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// H. USER PORTALS (Teacher, Student, Guardian)
// ==========================================

// 1. Teacher own schedule view
router.get('/teacher/schedule', authenticateToken, async (req, res, next) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const data = await timetableService.getTeacherSchedule(req.tenantId!, req.user!.id, dateStr);
    res.json({ statusCode: 200, message: 'Teacher schedule resolved', data });
  } catch (error) {
    next(error);
  }
});

// 2. Student own timetable view
router.get('/student/timetable', authenticateToken, async (req, res, next) => {
  try {
    if (req.user!.userType !== UserType.STUDENT) {
      throw new Error('Access denied: user is not registered as student');
    }
    const data = await timetableService.getStudentTimetable(req.tenantId!, req.user!.id);
    res.json({ statusCode: 200, message: 'Student timetable resolved', data });
  } catch (error) {
    next(error);
  }
});

// 3. Guardian linked child timetable view
router.get('/guardian/children/:studentId/timetable', authenticateToken, async (req, res, next) => {
  try {
    if (req.user!.userType !== UserType.GUARDIAN) {
      throw new Error('Access denied: user is not registered as guardian');
    }
    const data = await timetableService.getGuardianChildTimetable(req.tenantId!, req.user!.id, req.params.studentId);
    res.json({ statusCode: 200, message: 'Child student timetable resolved', data });
  } catch (error) {
    next(error);
  }
});

export default router;
