import { Router } from 'express';
import { z } from 'zod';
import { inviteService } from '../services/invite.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { InviteType, InviteStatus } from '@prisma/client';

const router = Router();

// Apply auth middleware for all routes in this file (they are mounted on /api/school/invites)
router.use(authenticateToken, requireSchoolAdmin);

// 1. LIST INVITES
const listQuerySchema = z.object({
  inviteType: z.nativeEnum(InviteType).optional(),
  status: z.nativeEnum(InviteStatus).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const result = await inviteService.listInvites(req.tenantId!, req.schoolId!, {
      inviteType: req.query.inviteType as InviteType,
      status: req.query.status as InviteStatus,
      page,
      limit
    });

    res.json({
      statusCode: 200,
      message: 'School invites list retrieved',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 2. CREATE INVITE
const createInviteSchema = z.object({
  inviteType: z.nativeEnum(InviteType),
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  expiresInDays: z.number().optional(),
  maxUses: z.number().optional(),
  requireApproval: z.boolean().default(true)
});

router.post('/', validateBody(createInviteSchema), async (req, res, next) => {
  try {
    const invite = await inviteService.createInvite(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email
    );

    res.status(201).json({
      statusCode: 201,
      message: 'Invite link created successfully',
      data: invite
    });
  } catch (error) {
    next(error);
  }
});

// 3. REVOKE INVITE
router.post('/:id/revoke', async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await inviteService.revokeInvite(
      req.tenantId!,
      req.schoolId!,
      id,
      req.user!.id,
      req.user!.email
    );

    res.json({
      statusCode: 200,
      message: 'Invite link revoked successfully',
      data: invite
    });
  } catch (error) {
    next(error);
  }
});

export default router;
