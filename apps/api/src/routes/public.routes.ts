import { Router } from 'express';
import { z } from 'zod';
import { inviteService } from '../services/invite.service';
import { onboardingService } from '../services/onboarding.service';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';

const router = Router();

// ==========================================
// PUBLIC UNPROTECTED ENDPOINTS
// ==========================================

// 1. RESOLVE INVITE LINK CODE
router.get('/invites/resolve/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const resolved = await inviteService.resolveInvite(code);
    res.json({
      statusCode: 200,
      message: 'Invite code resolved successfully',
      data: resolved
    });
  } catch (error) {
    next(error);
  }
});

// 2. STUDENT SELF-REGISTRATION REQUEST SUBMIT
const studentRequestSchema = z.object({
  publicCode: z.string().min(1),
  personalData: z.object({
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
    dateOfBirth: z.string(),
    gender: z.string().min(1),
    personalEmail: z.string().email().or(z.literal('')).optional(),
    personalPhone: z.string().optional(),
  }),
  admissionData: z.object({
    admissionNumber: z.string().min(1),
    admissionDate: z.string(),
    rollNumber: z.string().optional(),
  }),
  addressData: z.object({
    currentAddressLine1: z.string().min(1),
    currentAddressLine2: z.string().optional(),
    currentCity: z.string().min(1),
    currentState: z.string().min(1),
    currentCountry: z.string().min(1),
    currentPostalCode: z.string().min(1),
  }).optional(),
  guardianData: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    relationship: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().or(z.literal('')).optional(),
  }).optional()
});

router.post('/onboarding/student', validateBody(studentRequestSchema), async (req, res, next) => {
  try {
    const { publicCode, personalData, admissionData, addressData, guardianData } = req.body;
    const request = await onboardingService.submitStudentRequest(publicCode, {
      personalData,
      admissionData,
      addressData,
      guardianData
    });

    res.status(201).json({
      statusCode: 201,
      message: 'Student self-registration request submitted successfully. Awaiting administrator approval.',
      data: request
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// PROTECTED PARENT / STUDENT CLAIM ENDPOINTS
// ==========================================

// 3. SUBMIT CHILD CLAIM REQUEST (PARENT)
const childClaimSchema = z.object({
  tenantId: z.string().min(1),
  studentAdmissionNumber: z.string().min(1),
  studentDateOfBirth: z.string(),
  relationship: z.string().min(1),
  guardianData: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }).optional()
});

router.post('/claims/child', authenticateToken, validateBody(childClaimSchema), async (req, res, next) => {
  try {
    const { tenantId, studentAdmissionNumber, studentDateOfBirth, relationship, guardianData } = req.body;
    const claim = await onboardingService.submitChildClaimRequest(tenantId, req.user!.id, {
      studentAdmissionNumber,
      studentDateOfBirth,
      relationship,
      guardianData
    });

    res.status(201).json({
      statusCode: 201,
      message: 'Child claim request submitted successfully. Awaiting school approval.',
      data: claim
    });
  } catch (error) {
    next(error);
  }
});

// 4. GET LINKED CHILDREN PROFILE DETAILS
router.get('/parent/children', authenticateToken, async (req, res, next) => {
  try {
    // Find guardian associated with user
    const guardian = await prisma.guardian.findFirst({
      where: { userId: req.user!.id }
    });

    if (!guardian) {
      return res.json({
        statusCode: 200,
        message: 'No guardian profile mapped yet',
        data: []
      });
    }

    // Find linked children
    const links = await prisma.studentGuardian.findMany({
      where: { guardianId: guardian.id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            status: true,
            enrollments: {
              where: { isCurrent: true },
              include: {
                gradeLevel: { select: { name: true } },
                section: { select: { name: true } },
                academicYear: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    res.json({
      statusCode: 200,
      message: 'Linked children profiles retrieved',
      data: links.map(l => ({
        relationship: l.relationship,
        isPrimary: l.isPrimary,
        student: l.student
      }))
    });
  } catch (error) {
    next(error);
  }
});

// 5. GET MINIMAL STUDENT SUMMARY
router.get('/student/summary', authenticateToken, async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user!.id },
      include: {
        enrollments: {
          where: { isCurrent: true },
          include: {
            gradeLevel: { select: { name: true } },
            section: { select: { name: true } },
            academicYear: { select: { name: true } }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ statusCode: 404, message: 'Student profile not mapped to your login credentials' });
    }

    res.json({
      statusCode: 200,
      message: 'Student profile summary retrieved',
      data: student
    });
  } catch (error) {
    next(error);
  }
});

export default router;
