import { Router } from 'express';
import { z } from 'zod';
import { platformService } from '../services/platform.service';
import { authenticateToken, requirePlatformAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { SchoolType, BoardType, SchoolStatus } from '@prisma/client';

const router = Router();

// Apply global platform admin protection
router.use(authenticateToken, requirePlatformAdmin);

router.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await platformService.getDashboardStats();
    res.json({
      statusCode: 200,
      message: 'Platform statistics retrieved',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

const onboardSchoolSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  schoolType: z.nativeEnum(SchoolType),
  board: z.nativeEnum(BoardType),
  establishedYear: z.number().optional(),
  officialEmail: z.string().email(),
  officialPhone: z.string().min(10),
  website: z.string().url().or(z.literal('')).optional(),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(4),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  firstAdmin: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
});

router.post('/schools', validateBody(onboardSchoolSchema), async (req, res, next) => {
  try {
    const result = await platformService.createSchool(
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({
      statusCode: 210, // Matching Phase 1 response
      message: 'School onboarded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

const querySchoolsSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(SchoolStatus).optional(),
  schoolType: z.nativeEnum(SchoolType).optional(),
  board: z.nativeEnum(BoardType).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/schools', validateQuery(querySchoolsSchema), async (req, res, next) => {
  try {
    const queryParams: any = req.query;
    const result = await platformService.listSchools({
      ...queryParams,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    });
    res.json({
      statusCode: 200,
      message: 'Schools directory list retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/schools/:id', async (req, res, next) => {
  try {
    const school = await platformService.getSchool(req.params.id);
    res.json({
      statusCode: 200,
      message: 'School details retrieved',
      data: school,
    });
  } catch (error) {
    next(error);
  }
});

const updateSchoolSchema = z.object({
  name: z.string().min(2).optional(),
  schoolType: z.nativeEnum(SchoolType).optional(),
  board: z.nativeEnum(BoardType).optional(),
  establishedYear: z.number().optional(),
  officialEmail: z.string().email().optional(),
  officialPhone: z.string().min(10).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  addressLine1: z.string().min(5).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  postalCode: z.string().min(4).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
});

router.patch('/schools/:id', validateBody(updateSchoolSchema), async (req, res, next) => {
  try {
    const updated = await platformService.updateSchool(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({
      statusCode: 200,
      message: 'School details updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

const statusSchema = z.object({
  status: z.nativeEnum(SchoolStatus),
  reason: z.string().optional(),
});

router.patch('/schools/:id/status', validateBody(statusSchema), async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const result = await platformService.updateSchoolStatus(
      req.params.id,
      status,
      reason,
      req.user!.id,
      req.user!.email,
    );
    res.json({
      statusCode: 200,
      message: 'School status updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

const auditSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

router.get('/audit-logs', validateQuery(auditSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const logs = await platformService.listAuditLogs(page, limit);
    res.json({
      statusCode: 200,
      message: 'Global audit trail logs retrieved',
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
