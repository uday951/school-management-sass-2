import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import {
  AttendanceType,
  AttendanceSessionStatus,
  AttendanceStatus,
  CorrectionRequestStatus,
  Status,
  UserType
} from '@prisma/client';

export interface AttendanceRecordDto {
  studentId: string;
  studentEnrollmentId: string;
  status: AttendanceStatus;
  reason?: string;
  remarks?: string;
  arrivalTime?: string;
  departureTime?: string;
}

export const attendanceService = {
  // 1. SETTINGS & POLICY
  getPolicy: async (tenantId: string, schoolId: string) => {
    let policy = await prisma.attendancePolicy.findUnique({
      where: { tenantId_schoolId: { tenantId, schoolId } }
    });

    if (!policy) {
      // Seed default policy
      policy = await prisma.attendancePolicy.create({
        data: {
          tenantId,
          schoolId,
          dailyEnabled: true,
          periodEnabled: false,
          allowLate: true,
          allowHalfDay: true,
          allowExcused: true,
          allowLeave: true,
          minimumRequiredPercentage: 75.0,
          lateWeight: 1.0,
          halfDayWeight: 0.5,
          excusedWeight: 1.0,
          leaveWeight: 1.0
        }
      });
    }

    return policy;
  },

  updatePolicy: async (
    tenantId: string,
    schoolId: string,
    data: any,
    actorUserId: string,
    actorEmail: string
  ) => {
    const existing = await attendanceService.getPolicy(tenantId, schoolId);

    const updated = await prisma.attendancePolicy.update({
      where: { id: existing.id },
      data: {
        dailyEnabled: data.dailyEnabled !== undefined ? data.dailyEnabled : existing.dailyEnabled,
        periodEnabled: data.periodEnabled !== undefined ? data.periodEnabled : existing.periodEnabled,
        allowLate: data.allowLate !== undefined ? data.allowLate : existing.allowLate,
        allowHalfDay: data.allowHalfDay !== undefined ? data.allowHalfDay : existing.allowHalfDay,
        allowExcused: data.allowExcused !== undefined ? data.allowExcused : existing.allowExcused,
        allowLeave: data.allowLeave !== undefined ? data.allowLeave : existing.allowLeave,
        minimumRequiredPercentage: data.minimumRequiredPercentage !== undefined ? Number(data.minimumRequiredPercentage) : existing.minimumRequiredPercentage,
        lateWeight: data.lateWeight !== undefined ? Number(data.lateWeight) : existing.lateWeight,
        halfDayWeight: data.halfDayWeight !== undefined ? Number(data.halfDayWeight) : existing.halfDayWeight,
        excusedWeight: data.excusedWeight !== undefined ? Number(data.excusedWeight) : existing.excusedWeight,
        leaveWeight: data.leaveWeight !== undefined ? Number(data.leaveWeight) : existing.leaveWeight
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ATTENDANCE_POLICY_UPDATED',
      entityType: 'AttendancePolicy',
      entityId: updated.id,
      oldValues: existing,
      newValues: updated
    });

    return updated;
  },

  // 2. TEACHER AUTHORIZATION CHECK
  checkTeacherAuthorization: async (
    tenantId: string,
    schoolId: string,
    academicYearId: string,
    classId: string,
    sectionId: string,
    userId: string,
    userType: UserType,
    date?: Date,
    periodNumber?: number,
    subjectId?: string
  ) => {
    // Verify user tenant matches the target tenantId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true }
    });

    if (!user || user.tenantId !== tenantId) {
      return { isAuthorized: false, employeeId: null };
    }

    if (userType === 'PLATFORM_SUPER_ADMIN' || userType === 'SCHOOL_ADMIN') {
      return { isAuthorized: true, employeeId: null };
    }

    // Resolve user to employee profile
    const employee = await prisma.employee.findUnique({
      where: { tenantId, schoolId, userId }
    });

    if (!employee || employee.status !== 'ACTIVE') {
      return { isAuthorized: false, employeeId: null };
    }

    // C. Check Substitution if date & period is provided
    if (date && periodNumber !== undefined) {
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);

      // Find published base timetable
      const timetable = await prisma.timetable.findFirst({
        where: {
          tenantId,
          schoolId,
          academicYearId,
          classId,
          sectionId,
          status: 'PUBLISHED'
        }
      });

      if (timetable) {
        const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayName = daysOfWeek[targetDate.getDay()];

        // Find timetable entry matching dayOfWeek and period number
        const entry = await prisma.timetableEntry.findFirst({
          where: {
            timetableId: timetable.id,
            dayOfWeek: dayName,
            bellPeriod: {
              periodNumber
            }
          }
        });

        if (entry) {
          // Check active substitution
          const sub = await prisma.substitution.findFirst({
            where: {
              tenantId,
              schoolId,
              date: targetDate,
              timetableEntryId: entry.id,
              status: 'ASSIGNED'
            }
          });

          if (sub) {
            if (sub.substituteEmployeeId === employee.id) {
              return { isAuthorized: true, employeeId: employee.id };
            }
            if (sub.originalEmployeeId === employee.id) {
              // Original teacher is replaced on this day, so they are not authorized
              return { isAuthorized: false, employeeId: employee.id };
            }
          } else {
            // No substitution, if employee is the scheduled teacher, they are authorized
            if (entry.employeeId === employee.id) {
              return { isAuthorized: true, employeeId: employee.id };
            }
          }
        }
      }
    }

    // A. Check Class Teacher Assignment
    const classTeacher = await prisma.classTeacherAssignment.findFirst({
      where: {
        tenantId,
        schoolId,
        academicYearId,
        gradeLevelId: classId,
        sectionId,
        employeeId: employee.id,
        status: Status.ACTIVE
      }
    });

    if (classTeacher) {
      return { isAuthorized: true, employeeId: employee.id };
    }

    // B. Check Subject Teacher Assignment
    const subjectTeacher = await prisma.teacherAssignment.findFirst({
      where: {
        tenantId,
        schoolId,
        academicYearId,
        gradeLevelId: classId,
        sectionId,
        employeeId: employee.id,
        status: Status.ACTIVE
      }
    });

    if (subjectTeacher) {
      return { isAuthorized: true, employeeId: employee.id };
    }

    return { isAuthorized: false, employeeId: employee.id };
  },

  // 3. STUDENT ROSTER RESOLUTION
  resolveRoster: async (
    tenantId: string,
    schoolId: string,
    academicYearId: string,
    classId: string,
    sectionId: string,
    date: Date
  ) => {
    // Resolve all potential current enrollments for the section
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        tenantId,
        schoolId,
        academicYearId,
        gradeLevelId: classId,
        sectionId,
        status: 'ACTIVE',
        isCurrent: true
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            status: true
          }
        }
      },
      orderBy: { rollNumber: 'asc' }
    });

    // Filter in-memory by dates to avoid MongoDB null field lookup discrepancies
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    return enrollments.filter(e => {
      if (e.student.status !== 'ACTIVE') return false;
      
      if (e.startDate) {
        const start = new Date(e.startDate);
        start.setUTCHours(0, 0, 0, 0);
        if (start > targetDate) return false;
      }
      
      if (e.endDate) {
        const end = new Date(e.endDate);
        end.setUTCHours(0, 0, 0, 0);
        if (end < targetDate) return false;
      }
      
      return true;
    });
  },

  // 4. CREATE / SAVE DRAFT SESSIONS
  saveDraft: async (
    tenantId: string,
    schoolId: string,
    academicYearId: string,
    classId: string,
    sectionId: string,
    attendanceDateStr: string,
    dto: {
      attendanceType: AttendanceType;
      subjectId?: string;
      periodNumber?: number;
      periodLabel?: string;
      notes?: string;
      records: AttendanceRecordDto[];
    },
    actorUserId: string,
    actorEmail: string,
    actorUserType: UserType
  ) => {
    const attendanceDate = new Date(attendanceDateStr);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // A. Validate permissions
    const { isAuthorized, employeeId } = await attendanceService.checkTeacherAuthorization(
      tenantId,
      schoolId,
      academicYearId,
      classId,
      sectionId,
      actorUserId,
      actorUserType,
      attendanceDate,
      dto.periodNumber || undefined,
      dto.subjectId || undefined
    );

    if (!isAuthorized) {
      throw new AppError(403, 'Permission denied: you are not assigned as a teacher for this section');
    }

    // B. Check if session already exists
    let session = await prisma.attendanceSession.findFirst({
      where: {
        tenantId,
        schoolId,
        academicYearId,
        classId,
        sectionId,
        attendanceDate,
        attendanceType: dto.attendanceType,
        periodNumber: dto.periodNumber || null,
        subjectId: dto.subjectId || null
      }
    });

    if (session) {
      if (session.status === AttendanceSessionStatus.LOCKED) {
        throw new AppError(400, 'This attendance session has been finalized and locked by administrator');
      }
    }

    const resolvedRoster = await attendanceService.resolveRoster(
      tenantId,
      schoolId,
      academicYearId,
      classId,
      sectionId,
      attendanceDate
    );

    const rosterStudentIds = new Set(resolvedRoster.map(r => r.studentId));

    // C. Upsert session & records in transaction
    const result = await prisma.$transaction(async (tx) => {
      if (!session) {
        session = await tx.attendanceSession.create({
          data: {
            tenantId,
            schoolId,
            academicYearId,
            classId,
            sectionId,
            attendanceDate,
            attendanceType: dto.attendanceType,
            subjectId: dto.subjectId || null,
            periodNumber: dto.periodNumber || null,
            periodLabel: dto.periodLabel || null,
            status: AttendanceSessionStatus.DRAFT,
            markedByUserId: actorUserId,
            markedByEmployeeId: employeeId,
            notes: dto.notes || null
          }
        });
      } else {
        session = await tx.attendanceSession.update({
          where: { id: session.id },
          data: {
            notes: dto.notes || null,
            status: AttendanceSessionStatus.DRAFT,
            markedByUserId: actorUserId,
            markedByEmployeeId: employeeId
          }
        });

        // Delete old records to rebuild draft
        await tx.attendanceRecord.deleteMany({
          where: { tenantId, attendanceSessionId: session.id }
        });
      }

      // Filter input records by active roster student mapping
      const validRecords = dto.records.filter(r => rosterStudentIds.has(r.studentId));

      if (validRecords.length > 0) {
        await tx.attendanceRecord.createMany({
          data: validRecords.map(r => ({
            tenantId,
            attendanceSessionId: session!.id,
            studentId: r.studentId,
            studentEnrollmentId: r.studentEnrollmentId,
            status: r.status,
            arrivalTime: r.arrivalTime ? new Date(r.arrivalTime) : null,
            departureTime: r.departureTime ? new Date(r.departureTime) : null,
            reason: r.reason || null,
            remarks: r.remarks || null,
            markedByUserId: actorUserId
          }))
        });
      }

      return session;
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ATTENDANCE_DRAFT_SAVED',
      entityType: 'AttendanceSession',
      entityId: result.id,
      newValues: { status: result.status, recordsCount: dto.records.length }
    });

    return result;
  },

  // 5. SUBMIT SESSIONS
  submitAttendance: async (
    tenantId: string,
    schoolId: string,
    sessionId: string,
    dto: {
      records: AttendanceRecordDto[];
      notes?: string;
    },
    actorUserId: string,
    actorEmail: string,
    actorUserType: UserType
  ) => {
    // A. Fetch session
    const session = await prisma.attendanceSession.findFirst({
      where: { id: sessionId, tenantId, schoolId }
    });

    if (!session) throw new AppError(404, 'Attendance session not found');
    if (session.status === AttendanceSessionStatus.LOCKED) {
      throw new AppError(400, 'Locked sessions cannot be submitted or edited directly');
    }

    // B. Check teacher assignment authorization
    const { isAuthorized } = await attendanceService.checkTeacherAuthorization(
      tenantId,
      schoolId,
      session.academicYearId,
      session.classId,
      session.sectionId,
      actorUserId,
      actorUserType,
      session.attendanceDate,
      session.periodNumber || undefined,
      session.subjectId || undefined
    );

    if (!isAuthorized) {
      throw new AppError(403, 'Permission denied: you are not assigned as a teacher for this section');
    }

    const roster = await attendanceService.resolveRoster(
      tenantId,
      schoolId,
      session.academicYearId,
      session.classId,
      session.sectionId,
      session.attendanceDate
    );

    // Validate that each roster student has a marked status
    const submittedStudentIds = new Set(dto.records.map(r => r.studentId));
    const missingStudents = roster.filter(s => !submittedStudentIds.has(s.studentId));
    if (missingStudents.length > 0) {
      throw new AppError(400, `Roster validation failed. Missing attendance markers for ${missingStudents.length} students`);
    }

    const rosterStudentIds = new Set(roster.map(r => r.studentId));
    const validRecords = dto.records.filter(r => rosterStudentIds.has(r.studentId));

    // C. Execute submission transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update session status
      const updatedSession = await tx.attendanceSession.update({
        where: { id: sessionId },
        data: {
          status: AttendanceSessionStatus.SUBMITTED,
          submittedAt: new Date(),
          notes: dto.notes || session.notes
        }
      });

      // 2. Wipe old records
      await tx.attendanceRecord.deleteMany({
        where: { tenantId, attendanceSessionId: sessionId }
      });

      // 3. Insert submitted records
      if (validRecords.length > 0) {
        await tx.attendanceRecord.createMany({
          data: validRecords.map(r => ({
            tenantId,
            attendanceSessionId: sessionId,
            studentId: r.studentId,
            studentEnrollmentId: r.studentEnrollmentId,
            status: r.status,
            arrivalTime: r.arrivalTime ? new Date(r.arrivalTime) : null,
            departureTime: r.departureTime ? new Date(r.departureTime) : null,
            reason: r.reason || null,
            remarks: r.remarks || null,
            markedByUserId: actorUserId
          }))
        });
      }

      return updatedSession;
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ATTENDANCE_SUBMITTED',
      entityType: 'AttendanceSession',
      entityId: sessionId,
      newValues: { status: result.status, submittedAt: result.submittedAt }
    });

    return result;
  },

  // 6. ADMIN LOCK ATTENDANCE SESSIONS
  lockSession: async (
    tenantId: string,
    schoolId: string,
    sessionId: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const session = await prisma.attendanceSession.findFirst({
      where: { id: sessionId, tenantId, schoolId }
    });
    if (!session) throw new AppError(404, 'Attendance session not found');

    const updated = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        status: AttendanceSessionStatus.LOCKED,
        lockedAt: new Date(),
        lockedByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ATTENDANCE_LOCKED',
      entityType: 'AttendanceSession',
      entityId: sessionId,
      newValues: { status: AttendanceSessionStatus.LOCKED, lockedAt: updated.lockedAt }
    });

    return updated;
  },

  // 7. ADMIN REOPEN SESSIONS
  reopenSession: async (
    tenantId: string,
    schoolId: string,
    sessionId: string,
    reason: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const session = await prisma.attendanceSession.findFirst({
      where: { id: sessionId, tenantId, schoolId }
    });
    if (!session) throw new AppError(404, 'Attendance session not found');
    if (!reason.trim()) throw new AppError(400, 'Reopening reason is required');

    const updated = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        status: AttendanceSessionStatus.REOPENED,
        notes: session.notes 
          ? `${session.notes}\n[Reopened reason: ${reason}]` 
          : `[Reopened reason: ${reason}]`
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ATTENDANCE_REOPENED',
      entityType: 'AttendanceSession',
      entityId: sessionId,
      newValues: { status: AttendanceSessionStatus.REOPENED, reason }
    });

    return updated;
  },

  // 8. CORRECTION WORKFLOWS
  requestCorrection: async (
    tenantId: string,
    schoolId: string,
    sessionId: string,
    dto: {
      reason: string;
      items: Array<{
        attendanceRecordId: string;
        oldStatus: AttendanceStatus;
        requestedStatus: AttendanceStatus;
        reason?: string;
      }>;
    },
    actorUserId: string,
    actorEmail: string
  ) => {
    const session = await prisma.attendanceSession.findFirst({
      where: { id: sessionId, tenantId, schoolId }
    });
    if (!session) throw new AppError(404, 'Attendance session not found');
    if (session.status !== AttendanceSessionStatus.LOCKED && session.status !== AttendanceSessionStatus.SUBMITTED) {
      throw new AppError(400, 'Correction requests are only permitted for submitted or locked attendance sessions');
    }

    const request = await prisma.attendanceCorrectionRequest.create({
      data: {
        tenantId,
        schoolId,
        attendanceSessionId: sessionId,
        requestedByUserId: actorUserId,
        reason: dto.reason,
        status: CorrectionRequestStatus.PENDING,
        items: {
          create: dto.items.map(item => ({
            tenantId,
            attendanceRecordId: item.attendanceRecordId,
            oldStatus: item.oldStatus,
            requestedStatus: item.requestedStatus,
            reason: item.reason || null
          }))
        }
      },
      include: { items: true }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CORRECTION_REQUESTED',
      entityType: 'AttendanceCorrectionRequest',
      entityId: request.id,
      newValues: { status: CorrectionRequestStatus.PENDING }
    });

    return request;
  },

  reviewCorrection: async (
    tenantId: string,
    schoolId: string,
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    reviewComment: string | undefined,
    actorUserId: string,
    actorEmail: string
  ) => {
    const request = await prisma.attendanceCorrectionRequest.findFirst({
      where: { id: requestId, tenantId, schoolId },
      include: { items: true }
    });

    if (!request) throw new AppError(404, 'Correction request not found');
    if (request.status !== CorrectionRequestStatus.PENDING) {
      throw new AppError(400, 'This correction request has already been reviewed');
    }

    if (action === 'REJECT') {
      const updated = await prisma.attendanceCorrectionRequest.update({
        where: { id: requestId },
        data: {
          status: CorrectionRequestStatus.REJECTED,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date(),
          reviewComment: reviewComment || 'Rejected by School Administrator'
        }
      });

      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId,
        action: 'CORRECTION_REJECTED',
        entityType: 'AttendanceCorrectionRequest',
        entityId: requestId,
        newValues: { status: CorrectionRequestStatus.REJECTED }
      });

      return updated;
    }

    // APPROVE FLOW (Update records in transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Update each record item
      for (const item of request.items) {
        await tx.attendanceRecord.update({
          where: { id: item.attendanceRecordId, tenantId },
          data: { status: item.requestedStatus }
        });
      }

      // Update request status
      const updatedRequest = await tx.attendanceCorrectionRequest.update({
        where: { id: requestId },
        data: {
          status: CorrectionRequestStatus.APPROVED,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date(),
          reviewComment: reviewComment || 'Approved and records updated'
        }
      });

      return updatedRequest;
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CORRECTION_APPROVED',
      entityType: 'AttendanceCorrectionRequest',
      entityId: requestId,
      newValues: { status: CorrectionRequestStatus.APPROVED }
    });

    return result;
  },

  // 9. SCHOOL ADMIN DASHBOARD METRICS
  getDashboard: async (tenantId: string, schoolId: string, dateStr: string) => {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    // Resolve Expected Sections
    const activeSections = await prisma.section.findMany({
      where: { tenantId, schoolId, status: Status.ACTIVE },
      select: { id: true, name: true, gradeLevel: { select: { name: true } } }
    });

    const expectedCount = activeSections.length;

    // Fetch sessions created for this date
    const sessions = await prisma.attendanceSession.findMany({
      where: { tenantId, schoolId, attendanceDate: date },
      include: {
        records: true,
        class: { select: { name: true } },
        section: { select: { name: true } }
      }
    });

    const submittedSessions = sessions.filter(s => s.status === 'SUBMITTED' || s.status === 'LOCKED');
    const draftSessions = sessions.filter(s => s.status === 'DRAFT' || s.status === 'REOPENED');

    const submittedCount = submittedSessions.length;
    const draftCount = draftSessions.length;
    const missingCount = Math.max(0, expectedCount - submittedCount);

    // Calculate aggregated records for finalized daily records
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalHalfDay = 0;

    for (const s of submittedSessions) {
      for (const r of s.records) {
        if (r.status === 'PRESENT') totalPresent++;
        else if (r.status === 'ABSENT') totalAbsent++;
        else if (r.status === 'LATE') totalLate++;
        else if (r.status === 'HALF_DAY') totalHalfDay++;
      }
    }

    // Resolve missing sections list
    const submittedSectionIds = new Set(submittedSessions.map(s => s.sectionId));
    const missingSections = activeSections.filter(sec => !submittedSectionIds.has(sec.id));

    // Fetch pending corrections
    const pendingCorrectionsCount = await prisma.attendanceCorrectionRequest.count({
      where: { tenantId, schoolId, status: CorrectionRequestStatus.PENDING }
    });

    return {
      expectedSections: expectedCount,
      submittedSessionsCount: submittedCount,
      draftSessionsCount: draftCount,
      missingSessionsCount: missingCount,
      totalPresent,
      totalAbsent,
      totalLate,
      totalHalfDay,
      missingSections: missingSections.map(m => ({
        id: m.id,
        name: m.name,
        class: m.gradeLevel.name
      })),
      recentSubmissions: submittedSessions.slice(0, 5).map(s => ({
        id: s.id,
        class: s.class.name,
        section: s.section.name,
        submittedAt: s.submittedAt
      })),
      pendingCorrections: pendingCorrectionsCount
    };
  },

  // 10. DAILY ATTENDANCE MONITOR
  getDailyMonitor: async (tenantId: string, schoolId: string, dateStr: string) => {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const activeSections = await prisma.section.findMany({
      where: { tenantId, schoolId, status: Status.ACTIVE },
      include: { gradeLevel: { select: { name: true } } },
      orderBy: [{ gradeLevel: { displayOrder: 'asc' } }, { displayOrder: 'asc' }]
    });

    const sessions = await prisma.attendanceSession.findMany({
      where: { tenantId, schoolId, attendanceDate: date },
      include: { records: { select: { status: true } } }
    });

    const sessionBySection = new Map(sessions.map(s => [s.sectionId, s]));

    return activeSections.map(sec => {
      const sess = sessionBySection.get(sec.id);
      let status = 'MISSING';
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let halfDayCount = 0;

      if (sess) {
        status = sess.status;
        sess.records.forEach(r => {
          if (r.status === 'PRESENT') presentCount++;
          else if (r.status === 'ABSENT') absentCount++;
          else if (r.status === 'LATE') lateCount++;
          else if (r.status === 'HALF_DAY') halfDayCount++;
        });
      }

      return {
        sectionId: sec.id,
        className: sec.gradeLevel.name,
        sectionName: sec.name,
        status,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        halfDay: halfDayCount,
        sessionId: sess?.id || null
      };
    });
  },

  // 11. ABSENTEE LIST REPORT
  getAbsenteeList: async (tenantId: string, schoolId: string, dateStr: string) => {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        status: { in: ['ABSENT', 'HALF_DAY'] },
        session: { schoolId, attendanceDate: date, status: { in: ['SUBMITTED', 'LOCKED'] } }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            guardians: {
              where: { isPrimary: true },
              include: {
                guardian: {
                  select: { firstName: true, lastName: true, phone: true, email: true }
                }
              }
            }
          }
        },
        session: {
          include: {
            class: { select: { name: true } },
            section: { select: { name: true } }
          }
        }
      }
    });

    return records.map(r => {
      const g = r.student.guardians?.[0]?.guardian;
      return {
        studentId: r.student.id,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        admissionNumber: r.student.admissionNumber,
        className: r.session.class.name,
        sectionName: r.session.section.name,
        status: r.status,
        reason: r.reason || null,
        remarks: r.remarks || null,
        guardianName: g ? `${g.firstName} ${g.lastName}` : null,
        guardianPhone: g?.phone || null,
        guardianEmail: g?.email || null
      };
    });
  },

  // 12. LOW ATTENDANCE DETECTION
  getLowAttendanceList: async (tenantId: string, schoolId: string, academicYearId: string) => {
    const policy = await attendanceService.getPolicy(tenantId, schoolId);

    // Get all active students enrolled this academic year
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { tenantId, schoolId, academicYearId, status: 'ACTIVE' },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, admissionNumber: true }
        },
        gradeLevel: { select: { name: true } },
        section: { select: { name: true } }
      }
    });

    const list = [];

    for (const e of enrollments) {
      // Find all records for student inside submitted/locked sessions
      const records = await prisma.attendanceRecord.findMany({
        where: {
          tenantId,
          studentId: e.studentId,
          session: { academicYearId, status: { in: ['SUBMITTED', 'LOCKED'] } }
        }
      });

      if (records.length === 0) continue;

      let weightedPresent = 0;
      records.forEach(r => {
        if (r.status === 'PRESENT') weightedPresent += 1.0;
        else if (r.status === 'LATE') weightedPresent += policy.lateWeight;
        else if (r.status === 'HALF_DAY') weightedPresent += policy.halfDayWeight;
        else if (r.status === 'EXCUSED') weightedPresent += policy.excusedWeight;
        else if (r.status === 'LEAVE') weightedPresent += policy.leaveWeight;
      });

      const percentage = (weightedPresent / records.length) * 100;

      if (percentage < policy.minimumRequiredPercentage) {
        list.push({
          studentId: e.studentId,
          firstName: e.student.firstName,
          lastName: e.student.lastName,
          admissionNumber: e.student.admissionNumber,
          className: e.gradeLevel.name,
          sectionName: e.section.name,
          percentage: Math.round(percentage * 10) / 10,
          denominator: records.length,
          numerator: weightedPresent
        });
      }
    }

    return list;
  },

  // 13. CLASS MONTHLY REPORT
  getClassReport: async (
    tenantId: string,
    schoolId: string,
    academicYearId: string,
    classId: string,
    sectionId: string,
    startDateStr: string,
    endDateStr: string
  ) => {
    const policy = await attendanceService.getPolicy(tenantId, schoolId);
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const roster = await prisma.studentEnrollment.findMany({
      where: { tenantId, schoolId, academicYearId, gradeLevelId: classId, sectionId, status: 'ACTIVE' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } }
      },
      orderBy: { rollNumber: 'asc' }
    });

    const reportData = [];

    for (const e of roster) {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          tenantId,
          studentId: e.studentId,
          session: {
            academicYearId,
            classId,
            sectionId,
            status: { in: ['SUBMITTED', 'LOCKED'] },
            attendanceDate: { gte: start, lte: end }
          }
        }
      });

      let present = 0;
      let absent = 0;
      let late = 0;
      let halfDay = 0;
      let excused = 0;
      let leave = 0;

      records.forEach(r => {
        if (r.status === 'PRESENT') present++;
        else if (r.status === 'ABSENT') absent++;
        else if (r.status === 'LATE') late++;
        else if (r.status === 'HALF_DAY') halfDay++;
        else if (r.status === 'EXCUSED') excused++;
        else if (r.status === 'LEAVE') leave++;
      });

      const total = records.length;
      let percentage = 0.0;
      if (total > 0) {
        const weighted = 
          (present * 1.0) +
          (late * policy.lateWeight) +
          (halfDay * policy.halfDayWeight) +
          (excused * policy.excusedWeight) +
          (leave * policy.leaveWeight);
        percentage = (weighted / total) * 100;
      }

      reportData.push({
        studentId: e.studentId,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        admissionNumber: e.student.admissionNumber,
        rollNumber: e.rollNumber || 'N/A',
        present,
        absent,
        late,
        halfDay,
        excused,
        leave,
        total,
        percentage: total > 0 ? Math.round(percentage * 10) / 10 : 100.0
      });
    }

    return reportData;
  },

  getStudentSummary: async (tenantId: string, studentId: string) => {
    // Fetch active enrollment to get school context
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId, status: 'ACTIVE', isCurrent: true },
      include: {
        gradeLevel: { select: { name: true } },
        section: { select: { name: true } },
        academicYear: { select: { name: true } }
      }
    });

    if (!enrollment) {
      throw new AppError(404, 'No active academic year enrollment found for this student');
    }

    const policy = await attendanceService.getPolicy(tenantId, enrollment.schoolId);

    // Fetch records in submitted/locked sessions
    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        studentId,
        session: { status: { in: ['SUBMITTED', 'LOCKED'] } }
      },
      include: {
        session: {
          select: {
            attendanceDate: true,
            notes: true,
            class: { select: { name: true } },
            section: { select: { name: true } }
          }
        }
      },
      orderBy: { session: { attendanceDate: 'desc' } }
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let excused = 0;
    let leave = 0;

    records.forEach(r => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') absent++;
      else if (r.status === 'LATE') late++;
      else if (r.status === 'HALF_DAY') halfDay++;
      else if (r.status === 'EXCUSED') excused++;
      else if (r.status === 'LEAVE') leave++;
    });

    const total = records.length;
    let percentage = 100.0;
    if (total > 0) {
      const weighted =
        (present * 1.0) +
        (late * policy.lateWeight) +
        (halfDay * policy.halfDayWeight) +
        (excused * policy.excusedWeight) +
        (leave * policy.leaveWeight);
      percentage = (weighted / total) * 100;
    }

    return {
      enrollment,
      percentage: total > 0 ? Math.round(percentage * 10) / 10 : 100.0,
      stats: { present, absent, late, halfDay, excused, leave, total },
      recentRecords: records.map(r => ({
        id: r.id,
        date: r.session.attendanceDate,
        status: r.status,
        remarks: r.remarks,
        className: r.session.class.name,
        sectionName: r.session.section.name
      }))
    };
  },

  getGuardianChildSummary: async (tenantId: string, guardianUserId: string, studentId: string) => {
    // 1. Resolve guardian profile
    const guardian = await prisma.guardian.findFirst({
      where: { tenantId, userId: guardianUserId }
    });
    if (!guardian) {
      throw new AppError(403, 'Permission denied: no active guardian profile mapped to this user');
    }

    // 2. Verify approved link relation to target student
    const link = await prisma.studentGuardian.findUnique({
      where: {
        tenantId_schoolId_studentId_guardianId: {
          tenantId,
          schoolId: guardian.schoolId,
          studentId,
          guardianId: guardian.id
        }
      }
    });

    if (!link) {
      throw new AppError(403, 'Permission denied: student is not linked to your guardian credentials');
    }

    return attendanceService.getStudentSummary(tenantId, studentId);
  }
};
