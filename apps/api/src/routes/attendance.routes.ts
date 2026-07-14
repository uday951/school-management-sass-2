import { Router } from 'express';
import { z } from 'zod';
import { attendanceService } from '../services/attendance.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { AttendanceType, AttendanceStatus, AttendanceSessionStatus, CorrectionRequestStatus, Status, UserType } from '@prisma/client';
import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';

const router = Router();

// ===================================================
// 1. STUDENT & GUARDIAN PORTAL ENDPOINTS
// ===================================================

router.get('/student/summary', authenticateToken, async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: { tenantId: req.tenantId!, userId: req.user!.id }
    });
    if (!student) {
      throw new AppError(404, 'Student profile not mapped to login credentials');
    }
    const summary = await attendanceService.getStudentSummary(req.tenantId!, student.id);
    res.json({
      statusCode: 200,
      message: 'Student summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

router.get('/guardian/children/:studentId/summary', authenticateToken, async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const summary = await attendanceService.getGuardianChildSummary(req.tenantId!, req.user!.id, studentId);
    res.json({
      statusCode: 200,
      message: 'Guardian child summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

// ===================================================
// 2. TEACHER & SHARED ATTENDANCE MARKING ENDPOINTS
// ===================================================

// Retrieve active assigned classes for teacher context
router.get('/my-classes', authenticateToken, async (req, res, next) => {
  try {
    const tenantId = req.tenantId!;
    const user = req.user!;

    if (user.userType === 'PLATFORM_SUPER_ADMIN' || user.userType === 'SCHOOL_ADMIN') {
      // Admins see all active classes & sections and can map any active subject
      const [sections, subjects] = await Promise.all([
        prisma.section.findMany({
          where: { tenantId, status: Status.ACTIVE },
          include: {
            gradeLevel: { select: { id: true, name: true, code: true } }
          }
        }),
        prisma.subject.findMany({
          where: { tenantId, status: Status.ACTIVE },
          select: { id: true, name: true }
        })
      ]);

      return res.json({
        statusCode: 200,
        message: 'Admin sections and subjects retrieved successfully',
        data: sections.map(s => ({
          sectionId: s.id,
          sectionName: s.name,
          classId: s.gradeLevel.id,
          className: s.gradeLevel.name,
          role: 'ADMIN',
          subjects: subjects.map(sub => ({ id: sub.id, name: sub.name }))
        }))
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { tenantId, userId: user.id }
    });

    if (!employee || employee.status !== 'ACTIVE') {
      return res.json({ statusCode: 200, message: 'No active employee assignments found', data: [] });
    }

    const [classTeacherAssignments, teacherAssignments] = await Promise.all([
      prisma.classTeacherAssignment.findMany({
        where: { tenantId, employeeId: employee.id, status: Status.ACTIVE },
        include: { gradeLevel: { select: { name: true } }, section: { select: { name: true } } }
      }),
      prisma.teacherAssignment.findMany({
        where: { tenantId, employeeId: employee.id, status: Status.ACTIVE },
        include: { gradeLevel: { select: { name: true } }, section: { select: { name: true } }, subject: { select: { name: true } } }
      })
    ]);

    const myClassesMap = new Map<string, any>();

    // 1. Process Class Teacher Assignments
    for (const a of classTeacherAssignments) {
      const key = `${a.gradeLevelId}-${a.sectionId}`;
      myClassesMap.set(key, {
        sectionId: a.sectionId,
        sectionName: a.section.name,
        classId: a.gradeLevelId,
        className: a.gradeLevel.name,
        role: 'CLASS_TEACHER',
        subjects: []
      });
    }

    // 2. Process Teacher Subject Assignments & map subjects
    for (const a of teacherAssignments) {
      const key = `${a.gradeLevelId}-${a.sectionId}`;
      const subjectObj = { id: a.subjectId, name: a.subject.name };
      
      if (myClassesMap.has(key)) {
        const existing = myClassesMap.get(key);
        // Avoid duplicate subjects
        if (!existing.subjects.some((s: any) => s.id === a.subjectId)) {
          existing.subjects.push(subjectObj);
        }
      } else {
        myClassesMap.set(key, {
          sectionId: a.sectionId,
          sectionName: a.section.name,
          classId: a.gradeLevelId,
          className: a.gradeLevel.name,
          role: 'SUBJECT_TEACHER',
          subjects: [subjectObj]
        });
      }
    }

    // Fallback: If a Class Teacher assignment doesn't have explicit subjects taught,
    // we populate it with all active subjects in that school/tenant so they can select.
    const allSubjects = await prisma.subject.findMany({
      where: { tenantId, status: Status.ACTIVE },
      select: { id: true, name: true }
    });

    for (const value of myClassesMap.values()) {
      if (!value.subjects || value.subjects.length === 0) {
        value.subjects = allSubjects.map(sub => ({ id: sub.id, name: sub.name }));
      }
    }

    res.json({
      statusCode: 200,
      message: 'Teacher classes retrieved successfully',
      data: Array.from(myClassesMap.values())
    });
  } catch (error) {
    next(error);
  }
});

// Get Student Roster
const rosterQuerySchema = z.object({
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  date: z.string().min(1)
});

router.get('/roster', authenticateToken, validateQuery(rosterQuerySchema), async (req, res, next) => {
  try {
    const { academicYearId, classId, sectionId, date } = req.query;
    const roster = await attendanceService.resolveRoster(
      req.tenantId!,
      req.schoolId!,
      academicYearId as string,
      classId as string,
      sectionId as string,
      new Date(date as string)
    );

    res.json({
      statusCode: 200,
      message: 'Section roster resolved successfully',
      data: roster.map(r => ({
        studentId: r.student.id,
        studentEnrollmentId: r.id,
        rollNumber: r.rollNumber,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        admissionNumber: r.student.admissionNumber
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Save Draft
const recordItemSchema = z.object({
  studentId: z.string(),
  studentEnrollmentId: z.string(),
  status: z.nativeEnum(AttendanceStatus),
  reason: z.string().optional(),
  remarks: z.string().optional(),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional()
});

const saveDraftSchema = z.object({
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  attendanceDate: z.string().min(1),
  attendanceType: z.nativeEnum(AttendanceType).default(AttendanceType.DAILY),
  subjectId: z.string().optional(),
  periodNumber: z.number().optional(),
  periodLabel: z.string().optional(),
  notes: z.string().optional(),
  records: z.array(recordItemSchema)
});

router.post('/sessions/draft', authenticateToken, validateBody(saveDraftSchema), async (req, res, next) => {
  try {
    const { academicYearId, classId, sectionId, attendanceDate, ...rest } = req.body;
    const session = await attendanceService.saveDraft(
      req.tenantId!,
      req.schoolId!,
      academicYearId,
      classId,
      sectionId,
      attendanceDate,
      rest,
      req.user!.id,
      req.user!.email,
      req.user!.userType
    );

    res.status(201).json({
      statusCode: 201,
      message: 'Draft attendance session saved successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// Submit Attendance
const submitSchema = z.object({
  notes: z.string().optional(),
  records: z.array(recordItemSchema)
});

router.post('/sessions/:id/submit', authenticateToken, validateBody(submitSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await attendanceService.submitAttendance(
      req.tenantId!,
      req.schoolId!,
      id,
      req.body,
      req.user!.id,
      req.user!.email,
      req.user!.userType
    );

    res.json({
      statusCode: 200,
      message: 'Attendance session successfully submitted',
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// Find existing session by context
router.get('/sessions/find', authenticateToken, async (req, res, next) => {
  try {
    const { academicYearId, classId, sectionId, date, attendanceType, periodNumber, subjectId } = req.query;
    if (!academicYearId || !classId || !sectionId || !date) {
      return res.status(400).json({
        statusCode: 400,
        message: 'academicYearId, classId, sectionId, and date are required query parameters'
      });
    }

    const attendanceDate = new Date(date as string);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const session = await prisma.attendanceSession.findFirst({
      where: {
        tenantId: req.tenantId!,
        schoolId: req.schoolId!,
        academicYearId: academicYearId as string,
        classId: classId as string,
        sectionId: sectionId as string,
        attendanceDate,
        attendanceType: (attendanceType as any) || 'DAILY',
        periodNumber: periodNumber ? Number(periodNumber) : null,
        subjectId: (subjectId as string) || null,
      },
      include: {
        records: true,
      },
    });

    res.json({
      statusCode: 200,
      message: 'Attendance session lookup completed',
      data: session || null,
    });
  } catch (error) {
    next(error);
  }
});

// Single Session Details
router.get('/sessions/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await prisma.attendanceSession.findFirst({
      where: { id, tenantId: req.tenantId!, schoolId: req.schoolId! },
      include: {
        records: {
          include: {
            student: { select: { firstName: true, lastName: true, admissionNumber: true } }
          }
        },
        class: { select: { name: true } },
        section: { select: { name: true } }
      }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    res.json({
      statusCode: 200,
      message: 'Attendance session details retrieved successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// Request Correction
const correctionSchema = z.object({
  reason: z.string().min(1, 'Reason for correction is required'),
  items: z.array(z.object({
    attendanceRecordId: z.string(),
    oldStatus: z.nativeEnum(AttendanceStatus),
    requestedStatus: z.nativeEnum(AttendanceStatus),
    reason: z.string().optional()
  }))
});

router.post('/sessions/:id/correction', authenticateToken, validateBody(correctionSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await attendanceService.requestCorrection(
      req.tenantId!,
      req.schoolId!,
      id,
      req.body,
      req.user!.id,
      req.user!.email
    );

    res.status(201).json({
      statusCode: 201,
      message: 'Attendance correction request submitted to admin queue',
      data: request
    });
  } catch (error) {
    next(error);
  }
});

// ===================================================
// 3. ADMIN-ONLY ATTENDANCE MANAGEMENT & REPORTS
// ===================================================

// Fetch Settings / Policies
router.get('/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const policy = await attendanceService.getPolicy(req.tenantId!, req.schoolId!);
    res.json({
      statusCode: 200,
      message: 'Attendance settings retrieved successfully',
      data: policy
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const policy = await attendanceService.updatePolicy(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Attendance settings updated successfully',
      data: policy
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard metrics
const dateQuerySchema = z.object({
  date: z.string()
});

router.get('/dashboard', authenticateToken, requireSchoolAdmin, validateQuery(dateQuerySchema), async (req, res, next) => {
  try {
    const stats = await attendanceService.getDashboard(
      req.tenantId!,
      req.schoolId!,
      req.query.date as string
    );
    res.json({
      statusCode: 200,
      message: 'Dashboard metrics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Daily Monitor list
router.get('/daily-monitor', authenticateToken, requireSchoolAdmin, validateQuery(dateQuerySchema), async (req, res, next) => {
  try {
    const monitor = await attendanceService.getDailyMonitor(
      req.tenantId!,
      req.schoolId!,
      req.query.date as string
    );
    res.json({
      statusCode: 200,
      message: 'Daily monitor status list retrieved successfully',
      data: monitor
    });
  } catch (error) {
    next(error);
  }
});

// Absentees List
router.get('/absentees', authenticateToken, requireSchoolAdmin, validateQuery(dateQuerySchema), async (req, res, next) => {
  try {
    const absentees = await attendanceService.getAbsenteeList(
      req.tenantId!,
      req.schoolId!,
      req.query.date as string
    );
    res.json({
      statusCode: 200,
      message: 'Absentee list retrieved successfully',
      data: absentees
    });
  } catch (error) {
    next(error);
  }
});

// Low Attendance Report
const lowQuerySchema = z.object({
  academicYearId: z.string().min(1)
});

router.get('/reports/low-attendance', authenticateToken, requireSchoolAdmin, validateQuery(lowQuerySchema), async (req, res, next) => {
  try {
    const report = await attendanceService.getLowAttendanceList(
      req.tenantId!,
      req.schoolId!,
      req.query.academicYearId as string
    );
    res.json({
      statusCode: 200,
      message: 'Low attendance list compiled successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
});

// Class Grid Report
const classReportQuerySchema = z.object({
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1)
});

router.get('/reports/class', authenticateToken, requireSchoolAdmin, validateQuery(classReportQuerySchema), async (req, res, next) => {
  try {
    const { academicYearId, classId, sectionId, startDate, endDate } = req.query;
    const report = await attendanceService.getClassReport(
      req.tenantId!,
      req.schoolId!,
      academicYearId as string,
      classId as string,
      sectionId as string,
      startDate as string,
      endDate as string
    );
    res.json({
      statusCode: 200,
      message: 'Class grid report compiled successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
});

// Lock session
router.post('/sessions/:id/lock', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await attendanceService.lockSession(req.tenantId!, req.schoolId!, id, req.user!.id, req.user!.email);
    res.json({
      statusCode: 200,
      message: 'Attendance session successfully locked',
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// Reopen session
const reopenSchema = z.object({
  reason: z.string().min(1, 'Reopening reason is required')
});

router.post('/sessions/:id/reopen', authenticateToken, requireSchoolAdmin, validateBody(reopenSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const session = await attendanceService.reopenSession(req.tenantId!, req.schoolId!, id, reason, req.user!.id, req.user!.email);
    res.json({
      statusCode: 200,
      message: 'Attendance session successfully reopened as draft',
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// List pending corrections
router.get('/corrections', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await prisma.attendanceCorrectionRequest.findMany({
      where: { tenantId: req.tenantId!, schoolId: req.schoolId!, status: CorrectionRequestStatus.PENDING },
      include: {
        requestedBy: { select: { firstName: true, lastName: true, email: true } },
        session: {
          include: {
            class: { select: { name: true } },
            section: { select: { name: true } }
          }
        },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      statusCode: 200,
      message: 'Pending correction requests queue retrieved successfully',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

// Review correction request
const reviewCorrectionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reviewComment: z.string().optional()
});

router.post('/corrections/:id/review', authenticateToken, requireSchoolAdmin, validateBody(reviewCorrectionSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewComment } = req.body;
    const result = await attendanceService.reviewCorrection(
      req.tenantId!,
      req.schoolId!,
      id,
      action,
      reviewComment,
      req.user!.id,
      req.user!.email
    );

    res.json({
      statusCode: 200,
      message: `Correction request successfully processed with action ${action}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
