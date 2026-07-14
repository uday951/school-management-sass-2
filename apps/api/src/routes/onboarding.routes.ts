import { Router } from 'express';
import { z } from 'zod';
import { onboardingService } from '../services/onboarding.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { OnboardingRequestStatus, ChildClaimStatus } from '@prisma/client';

const router = Router();

// Apply auth middleware for all routes in this file (mounted on /api/school/onboarding)
router.use(authenticateToken, requireSchoolAdmin);

// 1. GET STUDENT REGISTRATION QUEUE
const studentQueueQuerySchema = z.object({
  status: z.nativeEnum(OnboardingRequestStatus).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/students', validateQuery(studentQueueQuerySchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const result = await onboardingService.getStudentQueue(req.tenantId!, req.schoolId!, {
      status: req.query.status as OnboardingRequestStatus,
      page,
      limit
    });

    res.json({
      statusCode: 200,
      message: 'Student onboarding queue retrieved',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 2. REVIEW STUDENT REGISTRATION (APPROVE / REJECT / CORRECT)
const reviewStudentSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'CORRECT']),
  message: z.string().optional(),
  createLoginAccount: z.boolean().default(false),
  loginEmail: z.string().email().optional(),
  temporaryPassword: z.string().optional(),
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
});

router.post('/students/:id/review', validateBody(reviewStudentSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, message, createLoginAccount, loginEmail, temporaryPassword, academicYearId, classId, sectionId } = req.body;

    const result = await onboardingService.reviewStudentRequest(
      req.tenantId!,
      req.schoolId!,
      id,
      action,
      { message, createLoginAccount, loginEmail, temporaryPassword, academicYearId, classId, sectionId },
      req.user!.id,
      req.user!.email
    );

    res.json({
      statusCode: 200,
      message: `Student onboarding request successfully processed with action ${action}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 3. GET GUARDIAN CLAIMS QUEUE
const guardianQueueQuerySchema = z.object({
  status: z.nativeEnum(ChildClaimStatus).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/guardians', validateQuery(guardianQueueQuerySchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const result = await onboardingService.getGuardianClaimsQueue(req.tenantId!, req.schoolId!, {
      status: req.query.status as ChildClaimStatus,
      page,
      limit
    });

    res.json({
      statusCode: 200,
      message: 'Guardian claims queue retrieved',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 4. REVIEW GUARDIAN CLAIM (APPROVE / REJECT)
const reviewClaimSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
});

router.post('/guardians/:id/review', validateBody(reviewClaimSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    const result = await onboardingService.reviewChildClaim(
      req.tenantId!,
      req.schoolId!,
      id,
      action,
      rejectionReason,
      req.user!.id,
      req.user!.email
    );

    res.json({
      statusCode: 200,
      message: `Guardian child claim request successfully processed with action ${action}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
