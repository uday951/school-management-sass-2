import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { 
  BellPeriodType, 
  TimetableStatus, 
  TimetableEntryType, 
  AvailabilityType, 
  OverrideType, 
  SubstitutionStatus, 
  RoomType,
  Status,
  UserType
} from '@prisma/client';

export interface WorkingDayInput {
  dayOfWeek: string;
  isWorkingDay: boolean;
}

export interface BellPeriodInput {
  name: string;
  periodNumber?: number;
  periodType: BellPeriodType;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  sortOrder: number;
}

export interface TimetableEntryInput {
  dayOfWeek: string;
  bellPeriodId: string;
  subjectId?: string;
  employeeId?: string;
  roomId?: string;
  entryType: TimetableEntryType;
  notes?: string;
}

// Helper to check if two time ranges overlap (formats: "HH:MM")
function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const aStart = parseTime(startA);
  const aEnd = parseTime(endA);
  const bStart = parseTime(startB);
  const bEnd = parseTime(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export const timetableService = {
  // ==========================================
  // 1. WORKING DAYS SETTINGS
  // ==========================================
  getWorkingDays: async (tenantId: string, schoolId: string) => {
    let days = await prisma.schoolWorkingDay.findMany({
      where: { tenantId, schoolId }
    });

    if (days.length === 0) {
      // Seed default Mon-Fri working days, Sat-Sun closed
      const defaults = [
        { dayOfWeek: 'MONDAY', isWorkingDay: true },
        { dayOfWeek: 'TUESDAY', isWorkingDay: true },
        { dayOfWeek: 'WEDNESDAY', isWorkingDay: true },
        { dayOfWeek: 'THURSDAY', isWorkingDay: true },
        { dayOfWeek: 'FRIDAY', isWorkingDay: true },
        { dayOfWeek: 'SATURDAY', isWorkingDay: false },
        { dayOfWeek: 'SUNDAY', isWorkingDay: false }
      ];

      await prisma.schoolWorkingDay.createMany({
        data: defaults.map(d => ({ ...d, tenantId, schoolId }))
      });

      days = await prisma.schoolWorkingDay.findMany({
        where: { tenantId, schoolId }
      });
    }

    return days;
  },

  updateWorkingDays: async (
    tenantId: string, 
    schoolId: string, 
    inputs: WorkingDayInput[],
    actorUserId: string,
    actorEmail: string
  ) => {
    const results = [];
    for (const input of inputs) {
      const updated = await prisma.schoolWorkingDay.upsert({
        where: {
          tenantId_schoolId_dayOfWeek: {
            tenantId,
            schoolId,
            dayOfWeek: input.dayOfWeek
          }
        },
        create: {
          tenantId,
          schoolId,
          dayOfWeek: input.dayOfWeek,
          isWorkingDay: input.isWorkingDay
        },
        update: {
          isWorkingDay: input.isWorkingDay
        }
      });
      results.push(updated);
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'WORKING_DAYS_CHANGED',
      entityType: 'SchoolWorkingDay',
      newValues: { workingDays: inputs }
    });

    return results;
  },

  // ==========================================
  // 2. BELL SCHEDULES & PERIODS
  // ==========================================
  listBellSchedules: async (tenantId: string, schoolId: string) => {
    return prisma.bellSchedule.findMany({
      where: { tenantId, schoolId },
      include: {
        bellPeriods: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  },

  getBellSchedule: async (tenantId: string, schoolId: string, id: string) => {
    const schedule = await prisma.bellSchedule.findFirst({
      where: { id, tenantId, schoolId },
      include: {
        bellPeriods: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    if (!schedule) throw new AppError(404, 'Bell Schedule not found');
    return schedule;
  },

  createBellSchedule: async (
    tenantId: string,
    schoolId: string,
    data: { name: string; description?: string; isDefault?: boolean },
    actorUserId: string,
    actorEmail: string
  ) => {
    // If isDefault is true, unset default on other schedules first
    if (data.isDefault) {
      await prisma.bellSchedule.updateMany({
        where: { tenantId, schoolId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const schedule = await prisma.bellSchedule.create({
      data: {
        tenantId,
        schoolId,
        name: data.name,
        description: data.description || null,
        isDefault: data.isDefault || false
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'BELL_SCHEDULE_CREATED',
      entityType: 'BellSchedule',
      entityId: schedule.id,
      newValues: schedule
    });

    return schedule;
  },

  updateBellSchedule: async (
    tenantId: string,
    schoolId: string,
    id: string,
    data: { name?: string; description?: string; isDefault?: boolean; status?: Status },
    actorUserId: string,
    actorEmail: string
  ) => {
    const existing = await prisma.bellSchedule.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!existing) throw new AppError(404, 'Bell schedule not found');

    if (data.isDefault) {
      await prisma.bellSchedule.updateMany({
        where: { tenantId, schoolId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.bellSchedule.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        description: data.description !== undefined ? data.description : existing.description,
        isDefault: data.isDefault ?? existing.isDefault,
        status: data.status ?? existing.status
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'BELL_SCHEDULE_UPDATED',
      entityType: 'BellSchedule',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  // Bell periods within a schedule
  setBellPeriods: async (
    tenantId: string,
    schoolId: string,
    bellScheduleId: string,
    periods: BellPeriodInput[],
    actorUserId: string,
    actorEmail: string
  ) => {
    const schedule = await prisma.bellSchedule.findFirst({
      where: { id: bellScheduleId, tenantId, schoolId }
    });
    if (!schedule) throw new AppError(404, 'Bell schedule not found');

    // Overlap validation
    for (let i = 0; i < periods.length; i++) {
      const pA = periods[i];
      if (pA.startTime >= pA.endTime) {
        throw new AppError(400, `Period ${pA.name} startTime must be less than endTime`);
      }

      for (let j = i + 1; j < periods.length; j++) {
        const pB = periods[j];
        if (isTimeOverlapping(pA.startTime, pA.endTime, pB.startTime, pB.endTime)) {
          throw new AppError(400, `Periods ${pA.name} and ${pB.name} have overlapping time intervals`);
        }
      }
    }

    // Replace all periods in a single transaction
    const results = await prisma.$transaction(async (tx) => {
      await tx.bellPeriod.deleteMany({
        where: { tenantId, bellScheduleId }
      });

      return tx.bellPeriod.createMany({
        data: periods.map(p => ({
          tenantId,
          bellScheduleId,
          name: p.name,
          periodNumber: p.periodNumber || null,
          periodType: p.periodType,
          startTime: p.startTime,
          endTime: p.endTime,
          sortOrder: p.sortOrder
        }))
      });
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'BELL_PERIODS_RECONFIGURED',
      entityType: 'BellSchedule',
      entityId: bellScheduleId,
      newValues: { periods }
    });

    return results;
  },

  // Map working days to specific bell schedules
  getDaySchedules: async (tenantId: string, schoolId: string) => {
    return prisma.workingDaySchedule.findMany({
      where: { tenantId, schoolId },
      include: {
        bellSchedule: {
          select: { name: true }
        }
      }
    });
  },

  setDaySchedules: async (
    tenantId: string,
    schoolId: string,
    mappings: Array<{ dayOfWeek: string; bellScheduleId: string }>,
    actorUserId: string,
    actorEmail: string
  ) => {
    const results = [];
    for (const mapping of mappings) {
      const updated = await prisma.workingDaySchedule.upsert({
        where: {
          tenantId_schoolId_dayOfWeek: {
            tenantId,
            schoolId,
            dayOfWeek: mapping.dayOfWeek
          }
        },
        create: {
          tenantId,
          schoolId,
          dayOfWeek: mapping.dayOfWeek,
          bellScheduleId: mapping.bellScheduleId
        },
        update: {
          bellScheduleId: mapping.bellScheduleId
        }
      });
      results.push(updated);
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'DAY_SCHEDULE_MAPPINGS_CHANGED',
      entityType: 'WorkingDaySchedule',
      newValues: { mappings }
    });

    return results;
  },

  // ==========================================
  // 3. ROOM MANAGEMENT
  // ==========================================
  listRooms: async (tenantId: string, schoolId: string) => {
    return prisma.room.findMany({
      where: { tenantId, schoolId }
    });
  },

  createRoom: async (
    tenantId: string,
    schoolId: string,
    data: { name: string; code?: string; roomType?: RoomType; capacity?: number },
    actorUserId: string,
    actorEmail: string
  ) => {
    const existing = await prisma.room.findFirst({
      where: { tenantId, schoolId, name: data.name }
    });
    if (existing) throw new AppError(400, `Room with name '${data.name}' already exists`);

    const room = await prisma.room.create({
      data: {
        tenantId,
        schoolId,
        name: data.name,
        code: data.code || null,
        roomType: data.roomType || RoomType.CLASSROOM,
        capacity: data.capacity || null
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ROOM_CREATED',
      entityType: 'Room',
      entityId: room.id,
      newValues: room
    });

    return room;
  },

  updateRoom: async (
    tenantId: string,
    schoolId: string,
    id: string,
    data: { name?: string; code?: string; roomType?: RoomType; capacity?: number; status?: Status },
    actorUserId: string,
    actorEmail: string
  ) => {
    const room = await prisma.room.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!room) throw new AppError(404, 'Room not found');

    const updated = await prisma.room.update({
      where: { id },
      data: {
        name: data.name ?? room.name,
        code: data.code ?? room.code,
        roomType: data.roomType ?? room.roomType,
        capacity: data.capacity ?? room.capacity,
        status: data.status ?? room.status
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ROOM_UPDATED',
      entityType: 'Room',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  // ==========================================
  // 4. TIMETABLE BUILDER
  // ==========================================
  listTimetables: async (tenantId: string, schoolId: string, academicYearId?: string) => {
    const where: any = { tenantId, schoolId };
    if (academicYearId) where.academicYearId = academicYearId;

    return prisma.timetable.findMany({
      where,
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
        academicYear: { select: { name: true } }
      },
      orderBy: [
        { classId: 'asc' },
        { sectionId: 'asc' },
        { versionNumber: 'desc' }
      ]
    });
  },

  getTimetable: async (tenantId: string, schoolId: string, id: string) => {
    const timetable = await prisma.timetable.findFirst({
      where: { id, tenantId, schoolId },
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
        academicYear: { select: { name: true } },
        entries: {
          include: {
            bellPeriod: true,
            subject: { select: { name: true, code: true } },
            teacher: { select: { firstName: true, lastName: true, employeeNumber: true } },
            room: { select: { name: true } }
          }
        }
      }
    });
    if (!timetable) throw new AppError(404, 'Timetable not found');
    return timetable;
  },

  createTimetableDraft: async (
    tenantId: string,
    schoolId: string,
    academicYearId: string,
    classId: string,
    sectionId: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    // Check if there is already an active draft
    const existingDraft = await prisma.timetable.findFirst({
      where: { tenantId, schoolId, academicYearId, classId, sectionId, status: TimetableStatus.DRAFT }
    });
    if (existingDraft) return existingDraft;

    // Resolve version number
    const lastVersion = await prisma.timetable.findFirst({
      where: { tenantId, schoolId, academicYearId, classId, sectionId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVer = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const timetable = await prisma.timetable.create({
      data: {
        tenantId,
        schoolId,
        academicYearId,
        classId,
        sectionId,
        versionNumber: nextVer,
        status: TimetableStatus.DRAFT,
        createdByUserId: actorUserId
      }
    });

    // If there was a previous published timetable, copy its entries to the new draft for fast iterations
    const prevPublished = await prisma.timetable.findFirst({
      where: { tenantId, schoolId, academicYearId, classId, sectionId, status: TimetableStatus.PUBLISHED }
    });
    if (prevPublished) {
      const prevEntries = await prisma.timetableEntry.findMany({
        where: { timetableId: prevPublished.id }
      });
      if (prevEntries.length > 0) {
        await prisma.timetableEntry.createMany({
          data: prevEntries.map(e => ({
            tenantId,
            timetableId: timetable.id,
            dayOfWeek: e.dayOfWeek,
            bellPeriodId: e.bellPeriodId,
            subjectId: e.subjectId,
            employeeId: e.employeeId,
            teacherAssignmentId: e.teacherAssignmentId,
            roomId: e.roomId,
            entryType: e.entryType,
            notes: e.notes
          }))
        });
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TIMETABLE_DRAFT_CREATED',
      entityType: 'Timetable',
      entityId: timetable.id,
      newValues: timetable
    });

    return timetable;
  },

  // Conflict Validation rules (backend double booking logic)
  validateSlotConflicts: async (
    tenantId: string,
    schoolId: string,
    timetableId: string,
    entry: TimetableEntryInput,
    skipEntryId?: string
  ) => {
    const conflicts: string[] = [];

    // 1. Fetch academic year details
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
      include: { academicYear: true }
    });
    if (!timetable) throw new AppError(404, 'Timetable context not found');

    // 2. Fetch target bell period
    const bellPeriod = await prisma.bellPeriod.findUnique({
      where: { id: entry.bellPeriodId }
    });
    if (!bellPeriod) throw new AppError(404, 'Bell Period not found');

    // Skip verification for non-teaching periods
    if (entry.entryType !== TimetableEntryType.SUBJECT) {
      return { isValid: true, conflicts };
    }

    if (!entry.subjectId || !entry.employeeId) {
      throw new AppError(400, 'Subject and Teacher details are required for teaching slots');
    }

    // A. Validate Subject-Class Mapping (Subject must be mapped to Class level in this year)
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        tenantId,
        schoolId,
        gradeLevelId: timetable.classId,
        subjectId: entry.subjectId,
        academicYearId: timetable.academicYearId,
        status: Status.ACTIVE
      }
    });
    if (!classSubject) {
      const subj = await prisma.subject.findUnique({ where: { id: entry.subjectId } });
      conflicts.push(`Subject '${subj?.name || entry.subjectId}' is not mapped to Grade/Class standard.`);
    }

    // B. Validate Teacher Assignment Compatibility (Teacher should be mapped to the Subject & Class & Section)
    const teacherAssignment = await prisma.teacherAssignment.findFirst({
      where: {
        tenantId,
        schoolId,
        academicYearId: timetable.academicYearId,
        employeeId: entry.employeeId,
        subjectId: entry.subjectId,
        gradeLevelId: timetable.classId,
        sectionId: timetable.sectionId,
        status: Status.ACTIVE
      }
    });
    if (!teacherAssignment) {
      const emp = await prisma.employee.findUnique({ where: { id: entry.employeeId } });
      conflicts.push(`Teacher '${emp?.firstName} ${emp?.lastName}' has no active Teacher Assignment for this class, section, and subject.`);
    }

    // C. Check Section Slot Overlap (Class cannot have multiple subjects scheduled at overlapping clock intervals on the same day)
    const existingSectionEntries = await prisma.timetableEntry.findMany({
      where: {
        timetableId,
        dayOfWeek: entry.dayOfWeek,
        id: skipEntryId ? { not: skipEntryId } : undefined
      },
      include: { bellPeriod: true }
    });

    for (const secEntry of existingSectionEntries) {
      if (isTimeOverlapping(bellPeriod.startTime, bellPeriod.endTime, secEntry.bellPeriod.startTime, secEntry.bellPeriod.endTime)) {
        conflicts.push(`This Class/Section already has a slot scheduled between ${secEntry.bellPeriod.startTime} and ${secEntry.bellPeriod.endTime}.`);
        break;
      }
    }

    // D. Check Teacher Double Booking (Teacher cannot be scheduled elsewhere at overlapping clock intervals)
    const teacherEntries = await prisma.timetableEntry.findMany({
      where: {
        employeeId: entry.employeeId,
        dayOfWeek: entry.dayOfWeek,
        id: skipEntryId ? { not: skipEntryId } : undefined,
        timetable: {
          academicYearId: timetable.academicYearId,
          status: { in: [TimetableStatus.DRAFT, TimetableStatus.PUBLISHED] }
        }
      },
      include: {
        bellPeriod: true,
        timetable: {
          include: {
            class: { select: { name: true } },
            section: { select: { name: true } }
          }
        }
      }
    });

    for (const teachEntry of teacherEntries) {
      if (isTimeOverlapping(bellPeriod.startTime, bellPeriod.endTime, teachEntry.bellPeriod.startTime, teachEntry.bellPeriod.endTime)) {
        conflicts.push(`Teacher is already booked for Class ${teachEntry.timetable.class.name}-${teachEntry.timetable.section.name} between ${teachEntry.bellPeriod.startTime} and ${teachEntry.bellPeriod.endTime}.`);
        break;
      }
    }

    // E. Check Room Double Booking (Room cannot be occupied elsewhere at overlapping clock intervals)
    if (entry.roomId) {
      const roomEntries = await prisma.timetableEntry.findMany({
        where: {
          roomId: entry.roomId,
          dayOfWeek: entry.dayOfWeek,
          id: skipEntryId ? { not: skipEntryId } : undefined,
          timetable: {
            academicYearId: timetable.academicYearId,
            status: { in: [TimetableStatus.DRAFT, TimetableStatus.PUBLISHED] }
          }
        },
        include: {
          bellPeriod: true,
          timetable: {
            include: {
              class: { select: { name: true } },
              section: { select: { name: true } }
            }
          }
        }
      });

      for (const rmEntry of roomEntries) {
        if (isTimeOverlapping(bellPeriod.startTime, bellPeriod.endTime, rmEntry.bellPeriod.startTime, rmEntry.bellPeriod.endTime)) {
          conflicts.push(`Room is already booked for Class ${rmEntry.timetable.class.name}-${rmEntry.timetable.section.name} between ${rmEntry.bellPeriod.startTime} and ${rmEntry.bellPeriod.endTime}.`);
          break;
        }
      }
    }

    // F. Check Teacher Unavailability Window (Teacher availability checks)
    const unavailability = await prisma.teacherAvailability.findMany({
      where: {
        tenantId,
        schoolId,
        employeeId: entry.employeeId,
        dayOfWeek: entry.dayOfWeek,
        availabilityType: AvailabilityType.UNAVAILABLE
      }
    });

    for (const unav of unavailability) {
      if (isTimeOverlapping(bellPeriod.startTime, bellPeriod.endTime, unav.startTime, unav.endTime)) {
        conflicts.push(`Teacher is marked as UNAVAILABLE on ${entry.dayOfWeek} between ${unav.startTime} and ${unav.endTime}.`);
        break;
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts
    };
  },

  // Timetable Entries CRUD
  addTimetableEntry: async (
    tenantId: string,
    schoolId: string,
    timetableId: string,
    input: TimetableEntryInput,
    actorUserId: string,
    actorEmail: string
  ) => {
    // Validate conflicts first
    const validation = await timetableService.validateSlotConflicts(tenantId, schoolId, timetableId, input);
    if (!validation.isValid) {
      throw new AppError(400, `Conflict detected: ${validation.conflicts.join(' ')}`);
    }

    // Resolve teacher assignment ID if applicable
    let taId = null;
    if (input.employeeId && input.subjectId) {
      const timetable = await prisma.timetable.findUnique({ where: { id: timetableId } });
      const ta = await prisma.teacherAssignment.findFirst({
        where: {
          tenantId,
          schoolId,
          academicYearId: timetable?.academicYearId,
          employeeId: input.employeeId,
          subjectId: input.subjectId,
          gradeLevelId: timetable?.classId,
          sectionId: timetable?.sectionId,
          status: Status.ACTIVE
        }
      });
      taId = ta?.id || null;
    }

    // Clean existing slot at identical period/day first to prevent duplication
    const currentOverlapping = await prisma.timetableEntry.findFirst({
      where: { timetableId, dayOfWeek: input.dayOfWeek, bellPeriodId: input.bellPeriodId }
    });
    if (currentOverlapping) {
      await prisma.timetableEntry.delete({ where: { id: currentOverlapping.id } });
    }

    const entry = await prisma.timetableEntry.create({
      data: {
        tenantId,
        timetableId,
        dayOfWeek: input.dayOfWeek,
        bellPeriodId: input.bellPeriodId,
        subjectId: input.subjectId || null,
        employeeId: input.employeeId || null,
        teacherAssignmentId: taId,
        roomId: input.roomId || null,
        entryType: input.entryType,
        notes: input.notes || null
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TIMETABLE_ENTRY_CREATED',
      entityType: 'TimetableEntry',
      entityId: entry.id,
      newValues: entry
    });

    return entry;
  },

  deleteTimetableEntry: async (
    tenantId: string,
    schoolId: string,
    entryId: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const entry = await prisma.timetableEntry.findFirst({
      where: { id: entryId, tenantId }
    });
    if (!entry) throw new AppError(404, 'Timetable entry not found');

    await prisma.timetableEntry.delete({
      where: { id: entryId }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TIMETABLE_ENTRY_REMOVED',
      entityType: 'TimetableEntry',
      entityId: entryId
    });

    return entry;
  },

  // Publish workflow
  publishTimetable: async (
    tenantId: string,
    schoolId: string,
    timetableId: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const timetable = await prisma.timetable.findFirst({
      where: { id: timetableId, tenantId, schoolId }
    });
    if (!timetable) throw new AppError(404, 'Timetable not found');
    if (timetable.status !== TimetableStatus.DRAFT) {
      throw new AppError(400, 'Only draft timetables can be published');
    }

    // Run complete validation check on all entries
    const entries = await prisma.timetableEntry.findMany({
      where: { timetableId: timetable.id }
    });

    for (const entry of entries) {
      const val = await timetableService.validateSlotConflicts(
        tenantId,
        schoolId,
        timetableId,
        {
          dayOfWeek: entry.dayOfWeek,
          bellPeriodId: entry.bellPeriodId,
          subjectId: entry.subjectId || undefined,
          employeeId: entry.employeeId || undefined,
          roomId: entry.roomId || undefined,
          entryType: entry.entryType,
          notes: entry.notes || undefined
        },
        entry.id
      );

      if (!val.isValid) {
        throw new AppError(400, `Timetable has unresolved conflicts on ${entry.dayOfWeek}: ${val.conflicts.join(' ')}`);
      }
    }

    // Transaction to update active/superseded statuses
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark previous published timetable for this section as SUPERSEDED
      await tx.timetable.updateMany({
        where: {
          tenantId,
          schoolId,
          academicYearId: timetable.academicYearId,
          classId: timetable.classId,
          sectionId: timetable.sectionId,
          status: TimetableStatus.PUBLISHED
        },
        data: {
          status: TimetableStatus.SUPERSEDED,
          effectiveTo: new Date()
        }
      });

      // 2. Publish current draft
      return tx.timetable.update({
        where: { id: timetableId },
        data: {
          status: TimetableStatus.PUBLISHED,
          publishedAt: new Date(),
          publishedByUserId: actorUserId,
          effectiveFrom: new Date()
        }
      });
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TIMETABLE_PUBLISHED',
      entityType: 'Timetable',
      entityId: timetableId,
      newValues: { status: TimetableStatus.PUBLISHED, version: timetable.versionNumber }
    });

    return result;
  },

  // ==========================================
  // 5. TEACHER AVAILABILITY
  // ==========================================
  listTeacherAvailabilities: async (tenantId: string, schoolId: string, employeeId?: string) => {
    const where: any = { tenantId, schoolId };
    if (employeeId) where.employeeId = employeeId;

    return prisma.teacherAvailability.findMany({
      where,
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeNumber: true }
        }
      },
      orderBy: { dayOfWeek: 'asc' }
    });
  },

  createTeacherAvailability: async (
    tenantId: string,
    schoolId: string,
    data: { employeeId: string; dayOfWeek: string; startTime: string; endTime: string; availabilityType: AvailabilityType; reason?: string },
    actorUserId: string,
    actorEmail: string
  ) => {
    if (data.startTime >= data.endTime) {
      throw new AppError(400, 'startTime must be less than endTime');
    }

    const avail = await prisma.teacherAvailability.create({
      data: {
        tenantId,
        schoolId,
        employeeId: data.employeeId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        availabilityType: data.availabilityType,
        reason: data.reason || null
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TEACHER_AVAILABILITY_CHANGED',
      entityType: 'TeacherAvailability',
      entityId: avail.id,
      newValues: avail
    });

    return avail;
  },

  deleteTeacherAvailability: async (
    tenantId: string,
    schoolId: string,
    id: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const existing = await prisma.teacherAvailability.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!existing) throw new AppError(404, 'Availability entry not found');

    await prisma.teacherAvailability.delete({ where: { id } });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TEACHER_AVAILABILITY_CHANGED',
      entityType: 'TeacherAvailability',
      entityId: id,
      newValues: { status: 'DELETED' }
    });

    return existing;
  },

  // ==========================================
  // 6. SCHEDULE OVERRIDES (SINGLE-DAY EVENTS)
  // ==========================================
  listOverrides: async (tenantId: string, schoolId: string, dateStr?: string) => {
    const where: any = { tenantId, schoolId, status: Status.ACTIVE };
    if (dateStr) {
      const date = new Date(dateStr);
      date.setUTCHours(0, 0, 0, 0);
      where.date = date;
    }

    return prisma.scheduleOverride.findMany({
      where,
      include: {
        bellPeriod: true,
        subject: { select: { name: true, code: true } },
        teacher: { select: { firstName: true, lastName: true } },
        room: { select: { name: true } }
      }
    });
  },

  createOverride: async (
    tenantId: string,
    schoolId: string,
    data: { date: string; bellPeriodId: string; overrideType: OverrideType; originalTimetableEntryId?: string; classId?: string; sectionId?: string; subjectId?: string; employeeId?: string; roomId?: string; reason: string },
    actorUserId: string,
    actorEmail: string
  ) => {
    const dateObj = new Date(data.date);
    dateObj.setUTCHours(0, 0, 0, 0);

    const override = await prisma.scheduleOverride.create({
      data: {
        tenantId,
        schoolId,
        date: dateObj,
        bellPeriodId: data.bellPeriodId,
        overrideType: data.overrideType,
        originalTimetableEntryId: data.originalTimetableEntryId || null,
        classId: data.classId || null,
        sectionId: data.sectionId || null,
        subjectId: data.subjectId || null,
        employeeId: data.employeeId || null,
        roomId: data.roomId || null,
        reason: data.reason,
        createdByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SCHEDULE_OVERRIDE_CREATED',
      entityType: 'ScheduleOverride',
      entityId: override.id,
      newValues: override
    });

    return override;
  },

  cancelOverride: async (
    tenantId: string,
    schoolId: string,
    id: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const override = await prisma.scheduleOverride.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!override) throw new AppError(404, 'Override entry not found');

    const updated = await prisma.scheduleOverride.update({
      where: { id },
      data: { status: Status.INACTIVE }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SCHEDULE_OVERRIDE_UPDATED',
      entityType: 'ScheduleOverride',
      entityId: id,
      newValues: { status: Status.INACTIVE }
    });

    return updated;
  },

  // ==========================================
  // 7. SUBSTITUTION MANAGEMENT
  // ==========================================
  listSubstitutions: async (tenantId: string, schoolId: string, dateStr?: string) => {
    const where: any = { tenantId, schoolId };
    if (dateStr) {
      const date = new Date(dateStr);
      date.setUTCHours(0, 0, 0, 0);
      where.date = date;
    }

    return prisma.substitution.findMany({
      where,
      include: {
        originalTeacher: { select: { firstName: true, lastName: true } },
        substituteTeacher: { select: { firstName: true, lastName: true } },
        timetableEntry: {
          include: {
            bellPeriod: true,
            subject: { select: { name: true } },
            timetable: {
              include: {
                class: { select: { name: true } },
                section: { select: { name: true } }
              }
            }
          }
        }
      }
    });
  },

  assignSubstitute: async (
    tenantId: string,
    schoolId: string,
    data: { date: string; timetableEntryId: string; substituteEmployeeId: string; reason?: string },
    actorUserId: string,
    actorEmail: string
  ) => {
    const dateObj = new Date(data.date);
    dateObj.setUTCHours(0, 0, 0, 0);

    // Resolve original timetable entry details
    const entry = await prisma.timetableEntry.findFirst({
      where: { id: data.timetableEntryId, tenantId },
      include: { bellPeriod: true }
    });
    if (!entry || !entry.employeeId) {
      throw new AppError(400, 'Original scheduled teacher slot not resolved');
    }

    if (entry.employeeId === data.substituteEmployeeId) {
      throw new AppError(400, 'Substitute teacher cannot be the same as the original scheduled teacher');
    }

    // Verify substitute availability & overlap conflicts on this specific day
    const bellPeriod = entry.bellPeriod;

    // Check if substitute teacher is already booked on this day at overlapping times
    const substituteOverlap = await prisma.timetableEntry.findMany({
      where: {
        employeeId: data.substituteEmployeeId,
        dayOfWeek: entry.dayOfWeek,
        timetable: {
          status: TimetableStatus.PUBLISHED,
          archivedAt: null
        }
      },
      include: { bellPeriod: true }
    });

    for (const overlap of substituteOverlap) {
      // Check if they are scheduled but also check if they are substituted out themselves!
      const isSubbedOut = await prisma.substitution.findFirst({
        where: {
          tenantId,
          schoolId,
          date: dateObj,
          timetableEntryId: overlap.id,
          status: { in: [SubstitutionStatus.ASSIGNED, SubstitutionStatus.COMPLETED] }
        }
      });

      if (!isSubbedOut && isTimeOverlapping(bellPeriod.startTime, bellPeriod.endTime, overlap.bellPeriod.startTime, overlap.bellPeriod.endTime)) {
        throw new AppError(400, `Substitute teacher is already scheduled for Class on this day between ${overlap.bellPeriod.startTime} and ${overlap.bellPeriod.endTime}`);
      }
    }

    // Check substitute availability
    const unavailability = await prisma.teacherAvailability.findMany({
      where: {
        tenantId,
        schoolId,
        employeeId: data.substituteEmployeeId,
        dayOfWeek: entry.dayOfWeek,
        availabilityType: AvailabilityType.UNAVAILABLE
      }
    });

    for (const unav of unavailability) {
      if (isTimeOverlapping(bellPeriod.startTime, bellPeriod.endTime, unav.startTime, unav.endTime)) {
        throw new AppError(400, `Substitute teacher is marked as UNAVAILABLE on this day between ${unav.startTime} and ${unav.endTime}`);
      }
    }

    const substitution = await prisma.substitution.upsert({
      where: {
        tenantId_schoolId_date_timetableEntryId: {
          tenantId,
          schoolId,
          date: dateObj,
          timetableEntryId: data.timetableEntryId
        }
      },
      create: {
        tenantId,
        schoolId,
        date: dateObj,
        timetableEntryId: data.timetableEntryId,
        originalEmployeeId: entry.employeeId,
        substituteEmployeeId: data.substituteEmployeeId,
        reason: data.reason || null,
        assignedByUserId: actorUserId
      },
      update: {
        substituteEmployeeId: data.substituteEmployeeId,
        reason: data.reason || null,
        status: SubstitutionStatus.ASSIGNED
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SUBSTITUTE_ASSIGNED',
      entityType: 'Substitution',
      entityId: substitution.id,
      newValues: substitution
    });

    return substitution;
  },

  cancelSubstitution: async (
    tenantId: string,
    schoolId: string,
    id: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const sub = await prisma.substitution.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!sub) throw new AppError(404, 'Substitution entry not found');

    const updated = await prisma.substitution.update({
      where: { id },
      data: { status: SubstitutionStatus.CANCELLED }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SUBSTITUTION_CANCELLED',
      entityType: 'Substitution',
      entityId: id,
      newValues: { status: SubstitutionStatus.CANCELLED }
    });

    return updated;
  },

  // ==========================================
  // 8. MY SCHEDULE PORTALS (TEACHER, STUDENT, PARENT)
  // ==========================================
  
  // A. Teacher's own schedule
  getTeacherSchedule: async (tenantId: string, userId: string, dateStr: string) => {
    const employee = await prisma.employee.findFirst({
      where: { tenantId, userId, status: 'ACTIVE' }
    });
    if (!employee) throw new AppError(404, 'Teacher profile not resolved');

    const date = new Date(dateStr);
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = daysOfWeek[date.getDay()];

    // Find all published base timetable entries where this teacher is assigned on this day of week
    const baseEntries = await prisma.timetableEntry.findMany({
      where: {
        employeeId: employee.id,
        dayOfWeek: dayName,
        timetable: {
          status: TimetableStatus.PUBLISHED
        }
      },
      include: {
        bellPeriod: true,
        subject: { select: { name: true, code: true } },
        room: { select: { name: true } },
        timetable: {
          include: {
            class: { select: { name: true } },
            section: { select: { name: true } }
          }
        }
      }
    });

    // Resolve active substitutions where this teacher is scheduled on this date
    // Note: If they are substituted OUT of a base entry, we drop that entry. If they are substituted IN as a substitute, we add it!
    const subbedOutIds = new Set<string>();
    const subbedInEntries: any[] = [];

    // Substitutions OUT (Original teacher is this employee)
    const outs = await prisma.substitution.findMany({
      where: {
        tenantId,
        date,
        originalEmployeeId: employee.id,
        status: { in: [SubstitutionStatus.ASSIGNED, SubstitutionStatus.COMPLETED] }
      }
    });
    outs.forEach(o => subbedOutIds.add(o.timetableEntryId));

    // Substitutions IN (Substitute teacher is this employee)
    const ins = await prisma.substitution.findMany({
      where: {
        tenantId,
        date,
        substituteEmployeeId: employee.id,
        status: { in: [SubstitutionStatus.ASSIGNED, SubstitutionStatus.COMPLETED] }
      },
      include: {
        timetableEntry: {
          include: {
            bellPeriod: true,
            subject: { select: { name: true, code: true } },
            room: { select: { name: true } },
            timetable: {
              include: {
                class: { select: { name: true } },
                section: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    ins.forEach(sub => {
      subbedInEntries.push({
        id: `sub-${sub.id}`,
        dayOfWeek: dayName,
        bellPeriod: sub.timetableEntry.bellPeriod,
        subject: sub.timetableEntry.subject,
        room: sub.timetableEntry.room,
        timetable: sub.timetableEntry.timetable,
        isSubstitution: true
      });
    });

    const activeBase = baseEntries
      .filter(e => !subbedOutIds.has(e.id))
      .map(e => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        bellPeriod: e.bellPeriod,
        subject: e.subject,
        room: e.room,
        timetable: e.timetable,
        isSubstitution: false
      }));

    const totalSchedule = [...activeBase, ...subbedInEntries];
    totalSchedule.sort((a, b) => a.bellPeriod.sortOrder - b.bellPeriod.sortOrder);

    return totalSchedule;
  },

  // B. Student's own timetable
  getStudentTimetable: async (tenantId: string, userId: string) => {
    // Resolve student active enrollment
    const student = await prisma.student.findFirst({
      where: { tenantId, userId, status: 'ACTIVE' }
    });
    if (!student) throw new AppError(404, 'Student profile not resolved');

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId: student.id, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) throw new AppError(400, 'Student has no active academic placement enrollment');

    const timetable = await prisma.timetable.findFirst({
      where: {
        tenantId,
        academicYearId: enrollment.academicYearId,
        classId: enrollment.gradeLevelId,
        sectionId: enrollment.sectionId,
        status: TimetableStatus.PUBLISHED
      },
      include: {
        entries: {
          include: {
            bellPeriod: true,
            subject: { select: { name: true, code: true } },
            teacher: { select: { firstName: true, lastName: true } },
            room: { select: { name: true } }
          }
        }
      }
    });

    if (!timetable) return { entries: [] };
    return timetable;
  },

  // C. Guardian child timetable
  getGuardianChildTimetable: async (tenantId: string, guardianUserId: string, studentId: string) => {
    // Verify guardian relationship checks
    const relation = await prisma.studentGuardian.findFirst({
      where: {
        tenantId,
        studentId,
        guardian: { userId: guardianUserId }
      }
    });
    if (!relation) {
      throw new AppError(403, 'Permission denied: this student child is not mapped to your account');
    }

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) throw new AppError(400, 'Child student has no active academic placement enrollment');

    const timetable = await prisma.timetable.findFirst({
      where: {
        tenantId,
        academicYearId: enrollment.academicYearId,
        classId: enrollment.gradeLevelId,
        sectionId: enrollment.sectionId,
        status: TimetableStatus.PUBLISHED
      },
      include: {
        entries: {
          include: {
            bellPeriod: true,
            subject: { select: { name: true, code: true } },
            teacher: { select: { firstName: true, lastName: true } },
            room: { select: { name: true } }
          }
        }
      }
    });

    if (!timetable) return { entries: [] };
    return timetable;
  }
};
