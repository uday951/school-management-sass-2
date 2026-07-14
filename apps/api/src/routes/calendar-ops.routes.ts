import { Router } from 'express';
import { z } from 'zod';
import { calendarOpsService } from '../services/calendar-ops.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { CalendarEventType, CalendarEventStatus, WorkingDayExceptionType, AnnouncementAudienceType } from '@prisma/client';

const router = Router();

// Public timelines list
router.get('/timeline', authenticateToken, async (req, res, next) => {
  try {
    const list = await calendarOpsService.listEvents(req.tenantId!, {
      type: req.query.type as CalendarEventType,
      start: req.query.start as string,
      end: req.query.end as string
    });
    res.json({ statusCode: 200, message: 'Calendar events timeline', data: list });
  } catch (error) {
    next(error);
  }
});

router.get('/upcoming', authenticateToken, async (req, res, next) => {
  try {
    const stats = await calendarOpsService.getDashboardStats(req.tenantId!);
    res.json({ statusCode: 200, message: 'Upcoming timeline events', data: stats });
  } catch (error) {
    next(error);
  }
});

// Admin endpoints
router.get('/exceptions', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await calendarOpsService.listExceptions(req.tenantId!);
    res.json({ statusCode: 200, message: 'Working day exceptions list', data: list });
  } catch (error) {
    next(error);
  }
});

const exceptionSchema = z.object({
  academicYearId: z.string().min(1),
  date: z.string(),
  exceptionType: z.nativeEnum(WorkingDayExceptionType),
  reason: z.string().min(1),
  calendarEventId: z.string().optional()
});

router.post('/exceptions', authenticateToken, requireSchoolAdmin, validateBody(exceptionSchema), async (req, res, next) => {
  try {
    const exception = await calendarOpsService.createException(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Working day exception updated successfully', data: exception });
  } catch (error) {
    next(error);
  }
});

const eventSchema = z.object({
  academicYearId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  eventType: z.nativeEnum(CalendarEventType),
  startAt: z.string(),
  endAt: z.string(),
  allDay: z.boolean().optional(),
  locationText: z.string().optional(),
  visibility: z.string().optional(),
  audiences: z.array(z.object({
    audienceType: z.nativeEnum(AnnouncementAudienceType),
    targetId: z.string().nullable().optional()
  })).optional()
});

router.post('/events', authenticateToken, requireSchoolAdmin, validateBody(eventSchema), async (req, res, next) => {
  try {
    const event = await calendarOpsService.createEvent(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Calendar event created successfully', data: event });
  } catch (error) {
    next(error);
  }
});

router.post('/events/:id/cancel', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const event = await calendarOpsService.cancelEvent(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Calendar event cancelled successfully', data: event });
  } catch (error) {
    next(error);
  }
});

import { prisma } from '../prisma';
export default router;
