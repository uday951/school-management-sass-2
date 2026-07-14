import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { CalendarEventType, CalendarEventStatus, WorkingDayExceptionType, AnnouncementAudienceType } from '@prisma/client';

export const calendarOpsService = {
  // Calendar Events
  async listEvents(tenantId: string, params: { type?: CalendarEventType; start?: string; end?: string; userId?: string }) {
    const where: any = { tenantId, archivedAt: null };
    if (params.type) where.eventType = params.type;
    if (params.start && params.end) {
      where.startAt = { gte: new Date(params.start) };
      where.endAt = { lte: new Date(params.end) };
    }
    return prisma.calendarEvent.findMany({
      where,
      include: { audiences: true },
      orderBy: { startAt: 'asc' }
    });
  },

  async createEvent(
    tenantId: string,
    data: {
      academicYearId?: string;
      title: string;
      description?: string;
      eventType: CalendarEventType;
      startAt: string;
      endAt: string;
      allDay?: boolean;
      locationText?: string;
      visibility?: string;
      audiences?: { audienceType: AnnouncementAudienceType; targetId?: string | null }[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const event = await prisma.calendarEvent.create({
      data: {
        tenantId,
        academicYearId: data.academicYearId || null,
        title: data.title,
        description: data.description || null,
        eventType: data.eventType,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        allDay: data.allDay || false,
        locationText: data.locationText || null,
        visibility: data.visibility || 'ALL',
        status: CalendarEventStatus.PUBLISHED,
        createdByUserId: actorUserId
      }
    });

    if (data.audiences && data.audiences.length > 0) {
      for (const aud of data.audiences) {
        await prisma.calendarEventAudience.create({
          data: {
            tenantId,
            calendarEventId: event.id,
            audienceType: aud.audienceType,
            targetId: aud.targetId || null
          }
        });
      }
    }

    if (data.eventType === CalendarEventType.HOLIDAY) {
      const start = new Date(data.startAt);
      const end = new Date(data.endAt);
      const temp = new Date(start);
      while (temp <= end) {
        await prisma.workingDayException.upsert({
          where: {
            tenantId_date: { tenantId, date: new Date(temp.setHours(0,0,0,0)) }
          },
          update: {
            exceptionType: WorkingDayExceptionType.NON_WORKING_DAY,
            reason: `Holiday: ${data.title}`,
            calendarEventId: event.id
          },
          create: {
            tenantId,
            academicYearId: data.academicYearId || '',
            date: new Date(temp.setHours(0,0,0,0)),
            exceptionType: WorkingDayExceptionType.NON_WORKING_DAY,
            reason: `Holiday: ${data.title}`,
            calendarEventId: event.id
          }
        });
        temp.setDate(temp.getDate() + 1);
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'CALENDAR_EVENT_CREATE',
      entityType: 'CalendarEvent',
      entityId: event.id,
      newValues: event
    });

    return event;
  },

  async cancelEvent(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const event = await prisma.calendarEvent.findFirst({ where: { id, tenantId } });
    if (!event) throw new AppError(404, 'Calendar event not found');

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: { status: CalendarEventStatus.CANCELLED }
    });

    await prisma.workingDayException.deleteMany({
      where: { tenantId, calendarEventId: id }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'CALENDAR_EVENT_CANCEL',
      entityType: 'CalendarEvent',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  // Working Day Exceptions
  async listExceptions(tenantId: string) {
    return prisma.workingDayException.findMany({
      where: { tenantId },
      orderBy: { date: 'asc' }
    });
  },

  async createException(
    tenantId: string,
    data: {
      academicYearId: string;
      date: string;
      exceptionType: WorkingDayExceptionType;
      reason: string;
      calendarEventId?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const exception = await prisma.workingDayException.upsert({
      where: {
        tenantId_date: { tenantId, date }
      },
      update: {
        exceptionType: data.exceptionType,
        reason: data.reason,
        calendarEventId: data.calendarEventId || null
      },
      create: {
        tenantId,
        academicYearId: data.academicYearId,
        date,
        exceptionType: data.exceptionType,
        reason: data.reason,
        calendarEventId: data.calendarEventId || null
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'WORKING_DAY_EXCEPTION_UPDATE',
      entityType: 'WorkingDayException',
      entityId: exception.id,
      newValues: exception
    });

    return exception;
  },

  async isWorkingDay(tenantId: string, dateInput: Date | string): Promise<boolean> {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);

    const exception = await prisma.workingDayException.findUnique({
      where: { tenantId_date: { tenantId, date } }
    });
    if (exception) {
      return exception.exceptionType === WorkingDayExceptionType.WORKING_DAY;
    }

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return false;
    return true;
  },

  async getDashboardStats(tenantId: string) {
    const now = new Date();
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: { tenantId, startAt: { gte: now }, status: CalendarEventStatus.PUBLISHED },
      take: 5,
      orderBy: { startAt: 'asc' }
    });

    const totalEvents = await prisma.calendarEvent.count({
      where: { tenantId, archivedAt: null }
    });

    const totalHolidays = await prisma.calendarEvent.count({
      where: { tenantId, eventType: CalendarEventType.HOLIDAY, archivedAt: null }
    });

    return {
      upcomingEvents,
      totalEvents,
      totalHolidays
    };
  }
};
