import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { 
  StaffAttendanceStatus,
  StaffAttendanceSource,
  LeavePartialDayType,
  LeaveRequestStatus,
  EmployeeStatus,
  TimetableStatus,
  Prisma
} from '@prisma/client';

export const staffOpsService = {
  // ==========================================
  // A1. STAFF ATTENDANCE SETTINGS
  // ==========================================
  async getSettings(tenantId: string) {
    let settings = await prisma.staffAttendanceSettings.findUnique({ where: { tenantId } });
    if (!settings) {
      settings = await prisma.staffAttendanceSettings.create({
        data: {
          tenantId,
          selfCheckInEnabled: false,
          selfCheckOutEnabled: false,
          lateAfterTime: '09:15',
          halfDayAfterTime: '13:00',
          workingHoursTargetMinutes: 480
        }
      });
    }
    return settings;
  },

  async updateSettings(tenantId: string, data: any, actorUserId: string, actorEmail: string) {
    const settings = await this.getSettings(tenantId);
    const updated = await prisma.staffAttendanceSettings.update({
      where: { id: settings.id },
      data
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'STAFF_SETTINGS_UPDATE',
      entityType: 'StaffAttendanceSettings',
      entityId: settings.id,
      newValues: updated
    });

    return updated;
  },

  // ==========================================
  // A2. STAFF ATTENDANCE RECORDS
  // ==========================================
  async markAttendance(
    tenantId: string,
    data: {
      employeeId: string;
      date: string;
      status: StaffAttendanceStatus;
      checkInTime?: string;
      checkOutTime?: string;
      source?: StaffAttendanceSource;
      remarks?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const parsedDate = new Date(data.date);
    parsedDate.setUTCHours(0, 0, 0, 0);

    // Enforce employee active status
    const employee = await prisma.employee.findFirst({
      where: { id: data.employeeId, tenantId, status: EmployeeStatus.ACTIVE }
    });
    if (!employee) throw new AppError(400, 'Employee not active or not found');

    // Parse checkIn and checkOut
    const checkIn = data.checkInTime ? new Date(data.checkInTime) : null;
    const checkOut = data.checkOutTime ? new Date(data.checkOutTime) : null;

    if (checkIn && checkOut && checkOut <= checkIn) {
      throw new AppError(400, 'Check-out time must be after check-in time');
    }

    const existing = await prisma.staffAttendanceRecord.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: data.employeeId,
          date: parsedDate
        }
      }
    });

    let record;
    if (existing) {
      record = await prisma.staffAttendanceRecord.update({
        where: { id: existing.id },
        data: {
          status: data.status,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          source: data.source || StaffAttendanceSource.MANUAL,
          remarks: data.remarks,
          markedByUserId: actorUserId
        }
      });

      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId: employee.schoolId,
        action: 'STAFF_ATTENDANCE_UPDATE',
        entityType: 'StaffAttendanceRecord',
        entityId: record.id,
        oldValues: existing,
        newValues: record
      });
    } else {
      record = await prisma.staffAttendanceRecord.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          date: parsedDate,
          status: data.status,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          source: data.source || StaffAttendanceSource.MANUAL,
          remarks: data.remarks,
          markedByUserId: actorUserId
        }
      });

      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId: employee.schoolId,
        action: 'STAFF_ATTENDANCE_CREATE',
        entityType: 'StaffAttendanceRecord',
        entityId: record.id,
        newValues: record
      });
    }

    return record;
  },

  async selfCheckIn(tenantId: string, userId: string, remarks?: string) {
    const settings = await this.getSettings(tenantId);
    if (!settings.selfCheckInEnabled) {
      throw new AppError(400, 'Self check-in is not enabled for this school');
    }

    const employee = await prisma.employee.findFirst({
      where: { userId, tenantId, status: EmployeeStatus.ACTIVE }
    });
    if (!employee) throw new AppError(400, 'Active employee profile not found');

    const today = new Date();
    const dateOnly = new Date(today);
    dateOnly.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.staffAttendanceRecord.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: dateOnly
        }
      }
    });

    if (existing && existing.checkInTime) {
      throw new AppError(400, 'You have already checked in for today');
    }

    // Determine if late
    let status: StaffAttendanceStatus = StaffAttendanceStatus.PRESENT;
    if (settings.lateAfterTime) {
      const [lateH, lateM] = settings.lateAfterTime.split(':').map(Number);
      const lateLimit = new Date(today);
      lateLimit.setHours(lateH, lateM, 0, 0);
      if (today > lateLimit) {
        status = StaffAttendanceStatus.LATE;
      }
    }

    let record;
    if (existing) {
      record = await prisma.staffAttendanceRecord.update({
        where: { id: existing.id },
        data: {
          status,
          checkInTime: today,
          source: StaffAttendanceSource.SELF,
          remarks: remarks || existing.remarks
        }
      });
    } else {
      record = await prisma.staffAttendanceRecord.create({
        data: {
          tenantId,
          employeeId: employee.id,
          date: dateOnly,
          status,
          checkInTime: today,
          source: StaffAttendanceSource.SELF,
          remarks
        }
      });
    }

    return record;
  },

  async selfCheckOut(tenantId: string, userId: string, remarks?: string) {
    const settings = await this.getSettings(tenantId);
    if (!settings.selfCheckOutEnabled) {
      throw new AppError(400, 'Self check-out is not enabled for this school');
    }

    const employee = await prisma.employee.findFirst({
      where: { userId, tenantId, status: EmployeeStatus.ACTIVE }
    });
    if (!employee) throw new AppError(400, 'Active employee profile not found');

    const today = new Date();
    const dateOnly = new Date(today);
    dateOnly.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.staffAttendanceRecord.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: dateOnly
        }
      }
    });

    if (!existing || !existing.checkInTime) {
      throw new AppError(400, 'You must check-in first before checking out');
    }

    if (existing.checkOutTime) {
      throw new AppError(400, 'You have already checked out for today');
    }

    // Determine status (check if half day)
    let status = existing.status;
    if (settings.halfDayAfterTime) {
      const [halfH, halfM] = settings.halfDayAfterTime.split(':').map(Number);
      const halfLimit = new Date(today);
      halfLimit.setHours(halfH, halfM, 0, 0);
      if (today < halfLimit && status !== StaffAttendanceStatus.LATE) {
        status = StaffAttendanceStatus.HALF_DAY;
      }
    }

    const record = await prisma.staffAttendanceRecord.update({
      where: { id: existing.id },
      data: {
        status,
        checkOutTime: today,
        remarks: remarks || existing.remarks
      }
    });

    return record;
  },

  async getMyTodayStatus(tenantId: string, userId: string) {
    const employee = await prisma.employee.findFirst({
      where: { userId, tenantId }
    });
    if (!employee) return null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return prisma.staffAttendanceRecord.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId: employee.id,
          date: today
        }
      }
    });
  },

  async listAttendance(
    tenantId: string,
    filters: {
      date?: string;
      departmentId?: string;
      employeeType?: string;
    }
  ) {
    const date = filters.date ? new Date(filters.date) : new Date();
    date.setUTCHours(0, 0, 0, 0);

    const whereClause: any = { tenantId, status: EmployeeStatus.ACTIVE };
    if (filters.departmentId) whereClause.primaryDepartmentId = filters.departmentId;
    if (filters.employeeType) whereClause.employeeType = filters.employeeType;

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: { primaryDepartment: true }
    });

    const records = await prisma.staffAttendanceRecord.findMany({
      where: { tenantId, date }
    });

    return employees.map((emp) => {
      const rec = records.find(r => r.employeeId === emp.id);
      return {
        employeeId: emp.id,
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        lastName: emp.lastName,
        designation: emp.designation,
        employeeType: emp.employeeType,
        departmentName: emp.primaryDepartment?.name || 'N/A',
        attendance: rec || null
      };
    });
  },

  // ==========================================
  // A6. LEAVE TYPES
  // ==========================================
  async listLeaveTypes(tenantId: string) {
    return prisma.leaveType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  },

  async createLeaveType(
    tenantId: string,
    data: { name: string; code?: string; description?: string; isPaid?: boolean; requiresApproval?: boolean },
    actorUserId: string,
    actorEmail: string
  ) {
    if (data.code) {
      const existing = await prisma.leaveType.findFirst({
        where: { tenantId, code: data.code }
      });
      if (existing) throw new AppError(400, 'Leave type code already exists');
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        description: data.description,
        isPaid: data.isPaid !== undefined ? data.isPaid : true,
        requiresApproval: data.requiresApproval !== undefined ? data.requiresApproval : true,
        status: 'ACTIVE'
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'LEAVE_TYPE_CREATE',
      entityType: 'LeaveType',
      entityId: leaveType.id,
      newValues: leaveType
    });

    return leaveType;
  },

  // ==========================================
  // A7. LEAVE POLICIES & RULES
  // ==========================================
  async listLeavePolicies(tenantId: string) {
    return prisma.leavePolicy.findMany({
      where: { tenantId },
      include: { rules: { include: { leaveType: true } } }
    });
  },

  async createLeavePolicy(
    tenantId: string,
    data: {
      name: string;
      academicYearId?: string;
      employeeType?: any;
      rules: { leaveTypeId: string; annualAllowance: number; carryForwardAllowed?: boolean; maxCarryForward?: number }[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const policy = await prisma.leavePolicy.create({
      data: {
        tenantId,
        name: data.name,
        academicYearId: data.academicYearId || null,
        employeeType: data.employeeType || null,
        status: 'ACTIVE'
      }
    });

    for (const rule of data.rules) {
      await prisma.leavePolicyRule.create({
        data: {
          tenantId,
          leavePolicyId: policy.id,
          leaveTypeId: rule.leaveTypeId,
          annualAllowance: rule.annualAllowance,
          carryForwardAllowed: rule.carryForwardAllowed || false,
          maxCarryForward: rule.maxCarryForward || null
        }
      });
    }

    return prisma.leavePolicy.findUnique({
      where: { id: policy.id },
      include: { rules: { include: { leaveType: true } } }
    }) as any;
  },

  // ==========================================
  // A8. LEAVE BALANCES
  // ==========================================
  async getEmployeeLeaveBalances(tenantId: string, employeeId: string, academicYearId: string) {
    return prisma.employeeLeaveBalance.findMany({
      where: { tenantId, employeeId, academicYearId },
      include: { leaveType: true }
    });
  },

  async initEmployeeBalances(
    tenantId: string,
    employeeId: string,
    academicYearId: string,
    policyId: string
  ) {
    const policy = await prisma.leavePolicy.findUnique({
      where: { id: policyId },
      include: { rules: true }
    });
    if (!policy) throw new AppError(404, 'Leave policy not found');

    const created: any[] = [];
    for (const rule of policy.rules) {
      const existing = await prisma.employeeLeaveBalance.findUnique({
        where: {
          tenantId_employeeId_academicYearId_leaveTypeId: {
            tenantId,
            employeeId,
            academicYearId,
            leaveTypeId: rule.leaveTypeId
          }
        }
      });

      if (!existing) {
        const bal = await prisma.employeeLeaveBalance.create({
          data: {
            tenantId,
            employeeId,
            academicYearId,
            leaveTypeId: rule.leaveTypeId,
            openingBalance: rule.annualAllowance,
            accrued: 0,
            used: 0,
            adjusted: 0,
            remaining: rule.annualAllowance
          }
        });
        created.push(bal);
      }
    }
    return created;
  },

  // ==========================================
  // A9. LEAVE REQUESTS
  // ==========================================
  async getLeaveRequests(tenantId: string, employeeId?: string) {
    const whereClause: any = { tenantId };
    if (employeeId) whereClause.employeeId = employeeId;

    return prisma.leaveRequest.findMany({
      where: whereClause,
      include: { employee: true, leaveType: true },
      orderBy: { submittedAt: 'desc' }
    });
  },

  async submitLeaveRequest(
    tenantId: string,
    userId: string,
    data: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      partialDayType: LeavePartialDayType;
      reason: string;
      attachmentUrl?: string;
    },
    academicYearId: string
  ) {
    const employee = await prisma.employee.findFirst({
      where: { userId, tenantId, status: EmployeeStatus.ACTIVE }
    });
    if (!employee) throw new AppError(400, 'Employee profile not active or not found');

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) throw new AppError(400, 'End date cannot be before start date');

    // Calculate days requested
    let diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (data.partialDayType !== LeavePartialDayType.FULL_DAY && diffDays === 1) {
      diffDays = 0.5;
    }

    // Check balance
    const balance = await prisma.employeeLeaveBalance.findUnique({
      where: {
        tenantId_employeeId_academicYearId_leaveTypeId: {
          tenantId,
          employeeId: employee.id,
          academicYearId,
          leaveTypeId: data.leaveTypeId
        }
      }
    });

    if (balance && balance.remaining < diffDays) {
      throw new AppError(400, `Insufficient leave balance. Requested: ${diffDays}, Remaining: ${balance.remaining}`);
    }

    const request = await prisma.leaveRequest.create({
      data: {
        tenantId,
        employeeId: employee.id,
        leaveTypeId: data.leaveTypeId,
        startDate: start,
        endDate: end,
        partialDayType: data.partialDayType,
        reason: data.reason,
        attachmentUrl: data.attachmentUrl,
        status: LeaveRequestStatus.PENDING,
        submittedAt: new Date()
      }
    });

    return request;
  },

  async reviewLeaveRequest(
    tenantId: string,
    requestId: string,
    status: LeaveRequestStatus,
    comment: string,
    actorUserId: string,
    actorEmail: string,
    academicYearId: string
  ) {
    const request = await prisma.leaveRequest.findFirst({
      where: { id: requestId, tenantId },
      include: { employee: true }
    });
    if (!request) throw new AppError(404, 'Leave request not found');
    if (request.status !== LeaveRequestStatus.PENDING) {
      throw new AppError(400, 'Leave request is already reviewed');
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date(),
        reviewComment: comment
      }
    });

    // If approved, deduct leave balance and mark ON_LEAVE in attendance records
    if (status === LeaveRequestStatus.APPROVED) {
      let diffTime = Math.abs(request.endDate.getTime() - request.startDate.getTime());
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (request.partialDayType !== LeavePartialDayType.FULL_DAY && diffDays === 1) {
        diffDays = 0.5;
      }

      const balance = await prisma.employeeLeaveBalance.findUnique({
        where: {
          tenantId_employeeId_academicYearId_leaveTypeId: {
            tenantId,
            employeeId: request.employeeId,
            academicYearId,
            leaveTypeId: request.leaveTypeId
          }
        }
      });

      if (balance) {
        await prisma.employeeLeaveBalance.update({
          where: { id: balance.id },
          data: {
            used: balance.used + diffDays,
            remaining: balance.remaining - diffDays
          }
        });
      }

      // Automatically populate ON_LEAVE attendance records for dates range
      let curr = new Date(request.startDate);
      while (curr <= request.endDate) {
        const dateOnly = new Date(curr);
        dateOnly.setUTCHours(0, 0, 0, 0);

        const existing = await prisma.staffAttendanceRecord.findUnique({
          where: {
            tenantId_employeeId_date: {
              tenantId,
              employeeId: request.employeeId,
              date: dateOnly
            }
          }
        });

        if (!existing) {
          await prisma.staffAttendanceRecord.create({
            data: {
              tenantId,
              employeeId: request.employeeId,
              date: dateOnly,
              status: StaffAttendanceStatus.ON_LEAVE,
              source: StaffAttendanceSource.ADMIN,
              remarks: `Approved leave: ${request.reason}`
            }
          });
        } else if (existing.status !== StaffAttendanceStatus.ON_LEAVE) {
          await prisma.staffAttendanceRecord.update({
            where: { id: existing.id },
            data: {
              status: StaffAttendanceStatus.ON_LEAVE,
              remarks: `Approved leave: ${request.reason}`
            }
          });
        }

        curr.setDate(curr.getDate() + 1);
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: request.employee.schoolId,
      action: `LEAVE_REQUEST_${status}`,
      entityType: 'LeaveRequest',
      entityId: requestId,
      newValues: updated
    });

    return updated;
  },

  // ==========================================
  // A11. TIMETABLE INTEGRATION IMPACT
  // ==========================================
  async getTeacherLeaveImpact(tenantId: string, requestId: string) {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: requestId, tenantId },
      include: { employee: true }
    });
    if (!request) throw new AppError(404, 'Leave request not found');

    const teacherEmployeeId = request.employeeId;

    // Get timetable entries where this teacher is assigned
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: {
        tenantId,
        timetable: { status: TimetableStatus.PUBLISHED },
        employeeId: teacherEmployeeId
      },
      include: {
        timetable: {
          include: {
            class: true,
            section: true
          }
        },
        subject: true,
        bellPeriod: true
      }
    });

    // Affected dates in the leave request
    const dates: string[] = [];
    let curr = new Date(request.startDate);
    while (curr <= request.endDate) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }

    // Resolve which days of week are affected, mapping JavaScript getDay() to DayOfWeek
    // Map of JS day index: 0 = SUNDAY, 1 = MONDAY, etc.
    const dayMap: Record<number, string> = {
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
      0: 'SUNDAY'
    };

    const impactList: any[] = [];
    for (const dtStr of dates) {
      const dt = new Date(dtStr);
      const dayOfWeek = dayMap[dt.getDay()];

      const dayEntries = timetableEntries.filter(e => e.dayOfWeek === dayOfWeek);
      for (const entry of dayEntries) {
        impactList.push({
          date: dtStr,
          dayOfWeek,
          className: entry.timetable?.class?.name || 'N/A',
          sectionName: entry.timetable?.section?.name || 'N/A',
          subjectName: entry.subject?.name || 'N/A',
          periodName: entry.bellPeriod?.name || 'Period',
          startTime: entry.bellPeriod?.startTime || '',
          endTime: entry.bellPeriod?.endTime || '',
          timetableEntryId: entry.id
        });
      }
    }

    return impactList;
  }
};
