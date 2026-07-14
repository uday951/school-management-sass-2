import { Router } from 'express';
import { z } from 'zod';
import { communicationService } from '../services/communication.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { AnnouncementType, AnnouncementPriority, AnnouncementAudienceType } from '@prisma/client';

const router = Router();

// ==========================================
// MY INBOX / NOTICE BOARD ROUTES
// ==========================================

router.get('/announcements', authenticateToken, async (req, res, next) => {
  try {
    const list = await communicationService.listAnnouncementsForUser(
      req.tenantId!,
      req.user!.id,
      req.user!.userType
    );
    res.json({
      statusCode: 200,
      message: 'Notice board announcements retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements/:id/read', authenticateToken, async (req, res, next) => {
  try {
    const result = await communicationService.markAsRead(req.tenantId!, req.params.id, req.user!.id);
    res.json({
      statusCode: 200,
      message: 'Notice marked as read',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements/:id/acknowledge', authenticateToken, async (req, res, next) => {
  try {
    const result = await communicationService.acknowledge(req.tenantId!, req.params.id, req.user!.id);
    res.json({
      statusCode: 200,
      message: 'Notice acknowledged successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// PERSONAL NOTIFICATION ROUTES
// ==========================================

router.get('/notifications', authenticateToken, async (req, res, next) => {
  try {
    const list = await communicationService.listNotifications(req.tenantId!, req.user!.id);
    res.json({
      statusCode: 200,
      message: 'Personal in-app notifications retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

router.post('/notifications/:id/read', authenticateToken, async (req, res, next) => {
  try {
    const result = await communicationService.markNotificationRead(req.tenantId!, req.params.id, req.user!.id);
    res.json({
      statusCode: 200,
      message: 'Notification marked as read',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post('/notifications/read-all', authenticateToken, async (req, res, next) => {
  try {
    const result = await communicationService.markAllNotificationsRead(req.tenantId!, req.user!.id);
    res.json({
      statusCode: 200,
      message: 'All notifications marked as read',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ADMIN WORKSPACE ROUTES
// ==========================================

router.get('/announcements/admin', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await communicationService.listAllAnnouncementsAdmin(req.tenantId!);
    res.json({
      statusCode: 200,
      message: 'All administrative announcements retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  announcementType: z.nativeEnum(AnnouncementType).default(AnnouncementType.GENERAL),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
  requiresAcknowledgement: z.boolean().default(false),
  audiences: z.array(z.object({
    audienceType: z.nativeEnum(AnnouncementAudienceType),
    targetId: z.string().optional().nullable()
  }))
});

router.post('/announcements', authenticateToken, requireSchoolAdmin, validateBody(createAnnouncementSchema), async (req, res, next) => {
  try {
    const ann = await communicationService.createAnnouncement(
      req.tenantId!,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.status(201).json({
      statusCode: 201,
      message: 'Announcement notice draft created successfully',
      data: ann
    });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements/:id/publish', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ann = await communicationService.publishAnnouncement(
      req.tenantId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Announcement notice published successfully to targeted audience list',
      data: ann
    });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements/:id/archive', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await communicationService.archiveAnnouncement(
      req.tenantId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Announcement notice archived successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/announcements/:id/analytics', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const analytics = await communicationService.getAnnouncementAnalytics(req.tenantId!, req.params.id);
    res.json({
      statusCode: 200,
      message: 'Announcement readership analytics retrieved',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

export default router;
