import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import { resolveMobileUserContext } from './mobile.middleware';
import { feesService } from '../services/fees.service';

const router = Router();

// Apply base authentication and mobile context parsing
router.use(authenticateToken, resolveMobileUserContext);

// 1. BOOTSTRAP ENDPOINT
router.get('/bootstrap', async (req, res, next) => {
  try {
    const user = req.user as any;
    const school = await prisma.school.findUnique({
      where: { id: req.schoolId },
      select: { id: true, name: true, code: true, status: true },
    });

    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId: req.schoolId, status: 'ACTIVE' },
      select: { id: true, name: true },
    });

    // Resolve Role(s)
    const resolvedRoles: string[] = [];
    if (user.userType === 'PLATFORM_SUPER_ADMIN') {
      resolvedRoles.push('PLATFORM_SUPER_ADMIN');
    } else if (user.userType === 'STUDENT') {
      resolvedRoles.push('STUDENT');
    } else if (user.userType === 'GUARDIAN') {
      resolvedRoles.push('GUARDIAN');
    } else if (user.userType === 'SCHOOL_ADMIN') {
      const employee = await prisma.employee.findFirst({
        where: { userId: user.id },
      });
      if (employee) {
        if (employee.employeeType === 'TEACHING') {
          resolvedRoles.push('TEACHER');
        }
        if (employee.employeeType === 'MANAGEMENT' || employee.employeeType === 'ADMINISTRATIVE') {
          resolvedRoles.push('PRINCIPAL');
        } else {
          const role = user.roleId ? await prisma.role.findUnique({ where: { id: user.roleId } }) : null;
          if (role?.code === 'TEACHER') {
            resolvedRoles.push('TEACHER');
          } else {
            resolvedRoles.push('PRINCIPAL');
          }
        }
      } else {
        resolvedRoles.push('PRINCIPAL');
      }
    }

    const unreadNotificationsCount = await prisma.notification.count({
      where: { userId: user.id, readAt: null },
    });

    res.json({
      statusCode: 200,
      message: 'Mobile bootstrap resolved',
      data: {
        user,
        school,
        activeYear,
        roles: resolvedRoles,
        unreadNotificationsCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 2. TEACHER DASHBOARD
router.get('/teacher/home', async (req, res, next) => {
  try {
    const user = req.user!;
    const employee = await prisma.employee.findFirst({
      where: { userId: user.id },
    });
    if (!employee) {
      throw new AppError(403, 'Employee profile required');
    }

    // Today's classes schedule entries count
    const today = new Date();
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    const classesToday = await prisma.timetableEntry.findMany({
      where: {
        tenantId: req.tenantId,
        employeeId: employee.id,
        dayOfWeek: dayOfWeek as any,
        timetable: { status: 'PUBLISHED' },
      },
      include: {
        subject: { select: { name: true } },
        timetable: {
          include: {
            section: { select: { name: true, gradeLevel: { select: { name: true } } } }
          }
        }
      },
    });

    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);

    // Fetch all attendance sessions recorded for today
    const attendanceSessions = await prisma.attendanceSession.findMany({
      where: {
        tenantId: req.tenantId,
        schoolId: req.schoolId,
        attendanceDate: todayMidnight,
      }
    });

    const recordedSectionIds = attendanceSessions
      .filter((s) => s.status === 'SUBMITTED' || s.status === 'LOCKED')
      .map((s) => s.sectionId);

    // Filter today's sections where attendance is missing
    const pendingAttendanceClasses = classesToday.filter((c) => !recordedSectionIds.includes(c.timetable.sectionId));

    // Map schedule items to attach live status
    const scheduleWithStatus = classesToday.map((c) => {
      const session = attendanceSessions.find(
        (s) => s.classId === c.timetable.classId && s.sectionId === c.timetable.sectionId
      );
      return {
        ...c,
        attendanceStatus: session ? session.status : 'PENDING',
        attendanceSessionId: session ? session.id : null,
      };
    });

    // Leave balance / stats
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { leaveType: true }
    });

    res.json({
      statusCode: 200,
      message: 'Teacher home metrics retrieved',
      data: {
        classesTodayCount: classesToday.length,
        attendancePendingCount: pendingAttendanceClasses.length,
        schedule: scheduleWithStatus,
        leaveRequests,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. STUDENT DASHBOARD
router.get('/student/home', async (req, res, next) => {
  try {
    const user = req.user!;
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        enrollments: {
          where: { isCurrent: true },
          include: { gradeLevel: true, section: true },
        },
      },
    });
    if (!student || student.enrollments.length === 0) {
      throw new AppError(403, 'Active student enrollment required');
    }

    const currentEnrollment = student.enrollments[0];

    // Resolve Active Year
    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId: req.schoolId, status: 'ACTIVE' },
    });
    const activeYearId = activeYear?.id || '';

    // Attendance stats
    const totalDays = await prisma.attendanceRecord.count({
      where: { studentId: student.id },
    });
    const presentDays = await prisma.attendanceRecord.count({
      where: { studentId: student.id, status: 'PRESENT' },
    });
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Homework count
    const homeworkCount = await prisma.homework.count({
      where: {
        classId: currentEnrollment.gradeLevelId,
        sectionId: currentEnrollment.sectionId,
        status: 'PUBLISHED',
      },
    });

    // Assignments pending review count
    const assignmentsCount = await prisma.assignment.count({
      where: {
        classId: currentEnrollment.gradeLevelId,
        sectionId: currentEnrollment.sectionId,
        status: 'PUBLISHED',
      },
    });

    // Outstanding fees unpaid - consistent with feesService!
    let outstandingFeesTotal = 0;
    if (activeYearId) {
      const account = await feesService.getStudentFeeAccount(req.tenantId!, student.id, activeYearId);
      outstandingFeesTotal = account.outstandingBalance;
    }

    // Today's Timetable & Timings
    const today = new Date();
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    const todaySchedule = await prisma.timetableEntry.findMany({
      where: {
        tenantId: req.tenantId!,
        dayOfWeek: dayOfWeek as any,
        timetable: {
          sectionId: currentEnrollment.sectionId,
          status: 'PUBLISHED',
        }
      },
      include: {
        subject: { select: { name: true } },
        teacher: { select: { firstName: true, lastName: true } },
        bellPeriod: { select: { name: true, periodNumber: true, startTime: true, endTime: true, sortOrder: true } }
      },
      orderBy: { bellPeriod: { sortOrder: 'asc' } }
    });

    // Today's Attendance logs (who marked what!)
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);
    const attendanceRecord = await prisma.attendanceRecord.findFirst({
      where: {
        studentId: student.id,
        session: {
          attendanceDate: todayMidnight
        }
      },
      include: {
        session: true
      }
    });

    let markedByName = 'Not marked yet';
    if (attendanceRecord?.session) {
      const markerUser = await prisma.user.findUnique({
        where: { id: attendanceRecord.session.markedByUserId },
        select: { firstName: true, lastName: true }
      });
      if (markerUser) {
        markedByName = `${markerUser.firstName} ${markerUser.lastName}`;
      } else {
        markedByName = 'School Staff';
      }
    }

    const todayAttendance = {
      status: attendanceRecord?.status || 'NOT_MARKED',
      markedBy: markedByName,
      markedAt: attendanceRecord?.createdAt || null,
      notes: attendanceRecord?.session?.notes || ''
    };

    res.json({
      statusCode: 200,
      message: 'Student home metrics retrieved',
      data: {
        studentId: student.id,
        studentEnrollmentId: currentEnrollment.id,
        attendancePercentage,
        homeworkCount,
        assignmentsCount,
        outstandingFeesTotal,
        todaySchedule: todaySchedule.map(item => ({
          id: item.id,
          subjectName: item.subject?.name || 'Subject',
          startTime: item.bellPeriod?.startTime || 'TBD',
          endTime: item.bellPeriod?.endTime || 'TBD',
          teacherName: item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : 'TBD',
          periodSequence: item.bellPeriod?.periodNumber || item.bellPeriod?.sortOrder || 0
        })),
        todayAttendance,
        classDetails: {
          gradeName: currentEnrollment.gradeLevel.name,
          sectionName: currentEnrollment.section.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 4. GUARDIAN DASHBOARD
router.get('/guardian/home', async (req, res, next) => {
  try {
    const user = req.user!;
    const guardian = await prisma.guardian.findUnique({
      where: { userId: user.id },
      include: {
        students: {
          include: {
            student: {
              include: {
                enrollments: {
                  where: { isCurrent: true },
                  include: { gradeLevel: true, section: true },
                },
              },
            },
          },
        },
      },
    });

    if (!guardian) {
      throw new AppError(403, 'Guardian profile required');
    }

    const children = guardian.students.map((gs) => {
      const currentEnrollment = gs.student.enrollments[0];
      return {
        id: gs.student.id,
        studentId: gs.student.id, // Aliased property to prevent selector mismatches on child switcher
        firstName: gs.student.firstName,
        lastName: gs.student.lastName,
        admissionNumber: gs.student.admissionNumber,
        gradeName: currentEnrollment?.gradeLevel.name || '',
        sectionName: currentEnrollment?.section.name || '',
      };
    });

    res.json({
      statusCode: 200,
      message: 'Guardian children list retrieved',
      data: { children },
    });
  } catch (error) {
    next(error);
  }
});

// GET STUDENT SAFE FEES
router.get('/student/fees', async (req, res, next) => {
  try {
    const user = req.user!;
    const student = await prisma.student.findUnique({
      where: { userId: user.id }
    });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    const activeYear = await prisma.academicYear.findFirst({
      where: { tenantId: req.tenantId!, status: 'ACTIVE' }
    });
    if (!activeYear) {
      throw new AppError(404, 'Active academic year not found');
    }

    const account = await feesService.getStudentFeeAccount(req.tenantId!, student.id, activeYear.id);
    const charges = await prisma.feeCharge.findMany({
      where: { tenantId: req.tenantId!, studentId: student.id, academicYearId: activeYear.id, status: { notIn: ['REVERSED', 'CANCELLED'] } },
      include: { allocations: true }
    });

    res.json({
      statusCode: 200,
      message: 'Student fee account retrieved safely',
      data: {
        summary: {
          totalChargedMinor: account.totalCharges,
          totalPaidMinor: account.totalPaid,
          totalOutstandingMinor: account.outstandingBalance
        },
        charges
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET GUARDIAN SAFE FEES FOR CHILD
router.get('/guardian/fees/:studentId', async (req, res, next) => {
  try {
    const user = req.user!;
    const guardian = await prisma.guardian.findUnique({
      where: { userId: user.id }
    });
    if (!guardian) {
      throw new AppError(403, 'Guardian profile required');
    }

    // Verify child link
    const link = await prisma.studentGuardian.findFirst({
      where: { guardianId: guardian.id, studentId: req.params.studentId }
    });
    if (!link) {
      throw new AppError(403, 'Unauthorized child access');
    }

    const activeYear = await prisma.academicYear.findFirst({
      where: { tenantId: req.tenantId!, status: 'ACTIVE' }
    });
    if (!activeYear) {
      throw new AppError(404, 'Active academic year not found');
    }

    const account = await feesService.getStudentFeeAccount(req.tenantId!, req.params.studentId, activeYear.id);
    const charges = await prisma.feeCharge.findMany({
      where: { tenantId: req.tenantId!, studentId: req.params.studentId, academicYearId: activeYear.id, status: { notIn: ['REVERSED', 'CANCELLED'] } },
      include: { allocations: true }
    });

    res.json({
      statusCode: 200,
      message: 'Guardian child fee account retrieved safely',
      data: {
        summary: {
          totalChargedMinor: account.totalCharges,
          totalPaidMinor: account.totalPaid,
          totalOutstandingMinor: account.outstandingBalance
        },
        charges
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET STUDENT SAFE ATTENDANCE
router.get('/student/attendance', async (req, res, next) => {
  try {
    const user = req.user!;
    const student = await prisma.student.findUnique({
      where: { userId: user.id }
    });
    if (!student) {
      throw new AppError(404, 'Student profile not found');
    }

    const totalDays = await prisma.attendanceRecord.count({ where: { studentId: student.id } });
    const presentDays = await prisma.attendanceRecord.count({ where: { studentId: student.id, status: 'PRESENT' } });
    const absentDays = await prisma.attendanceRecord.count({ where: { studentId: student.id, status: 'ABSENT' } });
    const lateDays = await prisma.attendanceRecord.count({ where: { studentId: student.id, status: 'LATE' } });
    const leaveDays = await prisma.attendanceRecord.count({ where: { studentId: student.id, status: 'LEAVE' } });

    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId: req.tenantId!,
        studentId: student.id,
        session: {
          attendanceDate: { gte: thirtyDaysAgo }
        }
      },
      include: {
        session: true
      }
    });

    const userIds = Array.from(new Set(records.map(r => r.session.markedByUserId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    // Sort records in-memory by attendanceDate descending
    records.sort((a, b) => new Date(b.session.attendanceDate).getTime() - new Date(a.session.attendanceDate).getTime());

    res.json({
      statusCode: 200,
      message: 'Student attendance records summary retrieved safely',
      data: {
        summary: {
          percentage,
          presentCount: presentDays,
          absentCount: absentDays,
          lateCount: lateDays,
          leaveCount: leaveDays
        },
        records: records.map(r => {
          const u = users.find(usr => usr.id === r.session.markedByUserId);
          return {
            id: r.id,
            date: r.session.attendanceDate,
            status: r.status,
            markedBy: u ? `${u.firstName} ${u.lastName}` : 'School Staff',
            notes: r.session?.notes || ''
          };
        })
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET GUARDIAN SAFE ATTENDANCE SUMMARY FOR CHILD
router.get('/guardian/attendance/:studentId/summary', async (req, res, next) => {
  try {
    const user = req.user!;
    const guardian = await prisma.guardian.findUnique({
      where: { userId: user.id }
    });
    if (!guardian) {
      throw new AppError(403, 'Guardian profile required');
    }

    // Verify child link
    const link = await prisma.studentGuardian.findFirst({
      where: { guardianId: guardian.id, studentId: req.params.studentId }
    });
    if (!link) {
      throw new AppError(403, 'Unauthorized child access');
    }

    const studentId = req.params.studentId;

    const totalDays = await prisma.attendanceRecord.count({ where: { studentId } });
    const presentDays = await prisma.attendanceRecord.count({ where: { studentId, status: 'PRESENT' } });
    const absentDays = await prisma.attendanceRecord.count({ where: { studentId, status: 'ABSENT' } });
    const lateDays = await prisma.attendanceRecord.count({ where: { studentId, status: 'LATE' } });
    const leaveDays = await prisma.attendanceRecord.count({ where: { studentId, status: 'LEAVE' } });

    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId: req.tenantId!,
        studentId,
        session: {
          attendanceDate: { gte: thirtyDaysAgo }
        }
      },
      include: {
        session: true
      }
    });

    const userIds = Array.from(new Set(records.map(r => r.session.markedByUserId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    records.sort((a, b) => new Date(b.session.attendanceDate).getTime() - new Date(a.session.attendanceDate).getTime());

    res.json({
      statusCode: 200,
      message: 'Guardian child attendance summary retrieved safely',
      data: {
        percentage,
        presentCount: presentDays,
        absentCount: absentDays,
        lateCount: lateDays,
        leaveCount: leaveDays,
        records: records.map(r => {
          const u = users.find(usr => usr.id === r.session.markedByUserId);
          return {
            id: r.id,
            date: r.session.attendanceDate,
            status: r.status,
            markedBy: u ? `${u.firstName} ${u.lastName}` : 'School Staff',
            notes: r.session?.notes || ''
          };
        })
      }
    });
  } catch (error) {
    next(error);
  }
});

// 5. PRINCIPAL EXECUTIVE DASHBOARD
router.get('/principal/dashboard', async (req, res, next) => {
  try {
    if (req.user!.userType !== 'SCHOOL_ADMIN') {
      throw new AppError(403, 'Access denied');
    }

    const totalStudents = await prisma.student.count({ where: { schoolId: req.schoolId } });
    const totalEmployees = await prisma.employee.count({ where: { schoolId: req.schoolId } });

    // Checked-in visitors count
    const insideCount = await prisma.visitRecord.count({
      where: { tenantId: req.tenantId, status: 'CHECKED_IN' },
    });

    // Pending gate passes count
    const pendingPasses = await prisma.studentGatePass.count({
      where: { tenantId: req.tenantId, status: 'PENDING' },
    });

    // Leave request approvals pending count
    const pendingLeaves = await prisma.leaveRequest.count({
      where: { tenantId: req.tenantId, status: 'PENDING' },
    });

    res.json({
      statusCode: 200,
      message: 'Principal metrics aggregated',
      data: {
        totalStudents,
        totalEmployees,
        insideCount,
        pendingPasses,
        pendingLeaves,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET PRINCIPAL FACULTY DETAILS
router.get('/principal/faculty', async (req, res, next) => {
  try {
    if (req.user!.userType !== 'SCHOOL_ADMIN') {
      throw new AppError(403, 'Access denied');
    }

    const activeYear = await prisma.academicYear.findFirst({
      where: { tenantId: req.tenantId, status: 'ACTIVE' }
    });
    if (!activeYear) {
      throw new AppError(404, 'Active academic year not found');
    }

    const employees = await prisma.employee.findMany({
      where: { tenantId: req.tenantId, schoolId: req.schoolId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        designation: true,
        primaryDepartment: { select: { name: true } },
      }
    });

    const today = new Date();
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);

    const [classTeacherAssignments, timetableEntries, staffAttendance, studentSessions] = await Promise.all([
      prisma.classTeacherAssignment.findMany({
        where: { tenantId: req.tenantId, academicYearId: activeYear.id, status: 'ACTIVE' },
        include: { gradeLevel: true, section: true }
      }),
      prisma.timetableEntry.findMany({
        where: {
          tenantId: req.tenantId,
          dayOfWeek: dayOfWeek as any,
          timetable: { status: 'PUBLISHED', academicYearId: activeYear.id, schoolId: req.schoolId }
        },
        include: { timetable: true }
      }),
      prisma.staffAttendanceRecord.findMany({
        where: { tenantId: req.tenantId, date: todayMidnight }
      }),
      prisma.attendanceSession.findMany({
        where: { tenantId: req.tenantId, schoolId: req.schoolId, attendanceDate: todayMidnight }
      })
    ]);

    const data = employees.map(emp => {
      // 1. Resolve Class Teacher assignment (Leading Class)
      const leadAssignment = classTeacherAssignments.find(a => a.employeeId === emp.id);
      const leadingClass = leadAssignment
        ? `${leadAssignment.gradeLevel.name} - ${leadAssignment.section.name}`
        : 'None';

      // 2. Count Today's Classes
      const empEntries = timetableEntries.filter(t => t.employeeId === emp.id);
      const classesTodayCount = empEntries.length;

      // 3. Staff Attendance Check-In Status
      const attendanceRec = staffAttendance.find(r => r.employeeId === emp.id);
      const checkInStatus = attendanceRec ? attendanceRec.status : 'PENDING';

      // 4. Student Attendance Duty Status
      let studentAttendanceStatus = 'NO_CLASSES';
      if (classesTodayCount > 0) {
        // Find unique sections this teacher is scheduled to teach today
        const uniqueSections = Array.from(new Set(empEntries.map(e => e.timetable.sectionId)));
        
        // Count how many of these sections have student attendance submitted/locked today
        const completedSessions = studentSessions.filter(s =>
          uniqueSections.includes(s.sectionId) &&
          (s.status === 'SUBMITTED' || s.status === 'LOCKED')
        );

        if (completedSessions.length === uniqueSections.length) {
          studentAttendanceStatus = 'COMPLETED';
        } else if (completedSessions.length > 0) {
          studentAttendanceStatus = 'PARTIAL';
        } else {
          studentAttendanceStatus = 'PENDING';
        }
      }

      return {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        designation: emp.designation,
        department: emp.primaryDepartment?.name || 'Academic',
        leadingClass,
        classesTodayCount,
        checkInStatus,
        studentAttendanceStatus
      };
    });

    res.json({
      statusCode: 200,
      message: 'Faculty list and status metrics retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
});

// 6. IN-APP NOTIFICATIONS
router.get('/notifications', async (req, res, next) => {
  try {
    const list = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ statusCode: 200, message: 'Notifications retrieved', data: list });
  } catch (error) {
    next(error);
  }
});

router.post('/notifications/:id/read', async (req, res, next) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { readAt: new Date() },
    });
    res.json({ statusCode: 200, message: 'Notification marked read', data: notif });
  } catch (error) {
    next(error);
  }
});

export default router;
