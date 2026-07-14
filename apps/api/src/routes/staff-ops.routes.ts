import { Router } from 'express';
import { z } from 'zod';
import { staffOpsService } from '../services/staff-ops.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { StaffAttendanceStatus, StaffAttendanceSource, LeavePartialDayType, LeaveRequestStatus } from '@prisma/client';

const router = Router();

// ==========================================
// PUBLIC/MY SELF ROUTES (Accessible by any authenticated staff)
// ==========================================

router.get('/staff-attendance/me', authenticateToken, async (req, res, next) => {
  try {
    const status = await staffOpsService.getMyTodayStatus(req.tenantId!, req.user!.id);
    res.json({
      statusCode: 200,
      message: 'Today staff attendance retrieved',
      data: status
    });
  } catch (error) {
    next(error);
  }
});

const selfCheckSchema = z.object({
  remarks: z.string().optional()
});

router.post('/staff-attendance/check-in', authenticateToken, validateBody(selfCheckSchema), async (req, res, next) => {
  try {
    const record = await staffOpsService.selfCheckIn(req.tenantId!, req.user!.id, req.body.remarks);
    res.json({
      statusCode: 200,
      message: 'Self check-in recorded successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
});

router.post('/staff-attendance/check-out', authenticateToken, validateBody(selfCheckSchema), async (req, res, next) => {
  try {
    const record = await staffOpsService.selfCheckOut(req.tenantId!, req.user!.id, req.body.remarks);
    res.json({
      statusCode: 200,
      message: 'Self check-out recorded successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
});

const submitLeaveSchema = z.object({
  leaveTypeId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  partialDayType: z.nativeEnum(LeavePartialDayType).default(LeavePartialDayType.FULL_DAY),
  reason: z.string().min(1),
  attachmentUrl: z.string().optional(),
  academicYearId: z.string().min(1)
});

router.post('/leave-requests', authenticateToken, validateBody(submitLeaveSchema), async (req, res, next) => {
  try {
    const request = await staffOpsService.submitLeaveRequest(
      req.tenantId!,
      req.user!.id,
      req.body,
      req.body.academicYearId
    );
    res.status(201).json({
      statusCode: 201,
      message: 'Leave request submitted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-requests/me', authenticateToken, async (req, res, next) => {
  try {
    // Find active employee for this user
    const emp = await prisma.employee.findFirst({
      where: { userId: req.user!.id, tenantId: req.tenantId! }
    });
    if (!emp) {
      return res.json({ statusCode: 200, message: 'My leave requests', data: [] });
    }

    const list = await staffOpsService.getLeaveRequests(req.tenantId!, emp.id);
    res.json({
      statusCode: 200,
      message: 'My leave requests list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-balances/me', authenticateToken, async (req, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query param is required' });
    }
    const emp = await prisma.employee.findFirst({
      where: { userId: req.user!.id, tenantId: req.tenantId! }
    });
    if (!emp) {
      return res.json({ statusCode: 200, message: 'My leave balances', data: [] });
    }
    const balances = await staffOpsService.getEmployeeLeaveBalances(req.tenantId!, emp.id, academicYearId);
    res.json({
      statusCode: 200,
      message: 'My leave balances retrieved',
      data: balances
    });
  } catch (error) {
    next(error);
  }
});


// ==========================================
// ADMIN WORKSPACE ROUTES (Require requireSchoolAdmin)
// ==========================================

const listAttendanceQuery = z.object({
  date: z.string().optional(),
  departmentId: z.string().optional(),
  employeeType: z.string().optional()
});

router.get('/staff-attendance', authenticateToken, requireSchoolAdmin, validateQuery(listAttendanceQuery), async (req, res, next) => {
  try {
    const list = await staffOpsService.listAttendance(req.tenantId!, req.query);
    res.json({
      statusCode: 200,
      message: 'Staff attendance status list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

const markAttendanceSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().min(1),
  status: z.nativeEnum(StaffAttendanceStatus),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  remarks: z.string().optional(),
  source: z.nativeEnum(StaffAttendanceSource).default(StaffAttendanceSource.MANUAL)
});

router.post('/staff-attendance', authenticateToken, requireSchoolAdmin, validateBody(markAttendanceSchema), async (req, res, next) => {
  try {
    const record = await staffOpsService.markAttendance(
      req.tenantId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Staff attendance record marked successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
});

router.get('/staff-attendance/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const settings = await staffOpsService.getSettings(req.tenantId!);
    res.json({
      statusCode: 200,
      message: 'Staff attendance settings retrieved',
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/staff-attendance/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const settings = await staffOpsService.updateSettings(
      req.tenantId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Staff attendance settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-types', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await staffOpsService.listLeaveTypes(req.tenantId!);
    res.json({
      statusCode: 200,
      message: 'Leave types retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

const createLeaveTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  isPaid: z.boolean().default(true),
  requiresApproval: z.boolean().default(true)
});

router.post('/leave-types', authenticateToken, requireSchoolAdmin, validateBody(createLeaveTypeSchema), async (req, res, next) => {
  try {
    const leaveType = await staffOpsService.createLeaveType(
      req.tenantId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.status(201).json({
      statusCode: 201,
      message: 'Leave type created successfully',
      data: leaveType
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-policies', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await staffOpsService.listLeavePolicies(req.tenantId!);
    res.json({
      statusCode: 200,
      message: 'Leave policies retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

const createLeavePolicySchema = z.object({
  name: z.string().min(1),
  academicYearId: z.string().optional(),
  employeeType: z.string().optional(),
  rules: z.array(z.object({
    leaveTypeId: z.string().min(1),
    annualAllowance: z.number(),
    carryForwardAllowed: z.boolean().default(false),
    maxCarryForward: z.number().optional()
  }))
});

router.post('/leave-policies', authenticateToken, requireSchoolAdmin, validateBody(createLeavePolicySchema), async (req, res, next) => {
  try {
    const policy = await staffOpsService.createLeavePolicy(
      req.tenantId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.status(201).json({
      statusCode: 201,
      message: 'Leave policy created successfully',
      data: policy
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-requests', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await staffOpsService.getLeaveRequests(req.tenantId!);
    res.json({
      statusCode: 200,
      message: 'All leave requests queue retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

const reviewLeaveSchema = z.object({
  status: z.nativeEnum(LeaveRequestStatus),
  comment: z.string().min(1),
  academicYearId: z.string().min(1)
});

router.post('/leave-requests/:id/review', authenticateToken, requireSchoolAdmin, validateBody(reviewLeaveSchema), async (req, res, next) => {
  try {
    const result = await staffOpsService.reviewLeaveRequest(
      req.tenantId!,
      req.params.id,
      req.body.status,
      req.body.comment,
      req.user!.id,
      req.user!.email,
      req.body.academicYearId
    );
    res.json({
      statusCode: 200,
      message: `Leave request status updated to ${req.body.status}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-requests/:id/impact', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const impact = await staffOpsService.getTeacherLeaveImpact(req.tenantId!, req.params.id);
    res.json({
      statusCode: 200,
      message: 'Teacher schedule and timetable impact analysis retrieved',
      data: impact
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-balances/:employeeId', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query param is required' });
    }
    const balances = await staffOpsService.getEmployeeLeaveBalances(req.tenantId!, req.params.employeeId, academicYearId);
    res.json({
      statusCode: 200,
      message: 'Employee leave balances retrieved',
      data: balances
    });
  } catch (error) {
    next(error);
  }
});

// Import prisma here to resolve compilation inside routes
import { prisma } from '../prisma';

export default router;
