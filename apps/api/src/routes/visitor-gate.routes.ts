import { Router } from 'express';
import { z } from 'zod';
import { visitorGateService } from '../services/visitor-gate.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { VisitRecordStatus, GatePassRequestType, GatePassStatus } from '@prisma/client';

const router = Router();

// Dashboard stats
router.get('/dashboard', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const stats = await visitorGateService.getGateDashboard(req.tenantId!);
    res.json({ statusCode: 200, message: 'Gate dashboard metrics retrieved', data: stats });
  } catch (error) {
    next(error);
  }
});

// Visitors
router.get('/visitors', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await visitorGateService.listVisitors(req.tenantId!, req.query.search as string);
    res.json({ statusCode: 200, message: 'Visitors list', data: list });
  } catch (error) {
    next(error);
  }
});

// Visits Checkin / Checkout
router.get('/visits', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await visitorGateService.listVisitRecords(req.tenantId!, {
      date: req.query.date as string,
      status: req.query.status as VisitRecordStatus
    });
    res.json({ statusCode: 200, message: 'Visit records register', data: list });
  } catch (error) {
    next(error);
  }
});

const checkInSchema = z.object({
  visitorId: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  identificationType: z.string().optional(),
  identificationLast4: z.string().optional(),
  organization: z.string().optional(),
  purpose: z.string().min(1),
  personToMeetUserId: z.string().optional(),
  personToMeetEmployeeId: z.string().optional(),
  badgeNumber: z.string().optional(),
  notes: z.string().optional()
});

router.post('/visitors/check-in', authenticateToken, requireSchoolAdmin, validateBody(checkInSchema), async (req, res, next) => {
  try {
    const record = await visitorGateService.checkInVisitor(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Visitor checked in successfully', data: record });
  } catch (error) {
    next(error);
  }
});

router.post('/visits/:id/check-out', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const record = await visitorGateService.checkOutVisitor(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Visitor checked out successfully', data: record });
  } catch (error) {
    next(error);
  }
});

// Student Gate Passes
router.get('/gate-passes', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await visitorGateService.listGatePasses(req.tenantId!, {
      studentId: req.query.studentId as string,
      status: req.query.status as GatePassStatus
    });
    res.json({ statusCode: 200, message: 'Student gate passes list', data: list });
  } catch (error) {
    next(error);
  }
});

const gatePassSchema = z.object({
  studentId: z.string().min(1),
  studentEnrollmentId: z.string().min(1),
  requestType: z.nativeEnum(GatePassRequestType),
  reason: z.string().min(1),
  requestedExitAt: z.string(),
  expectedReturnAt: z.string().optional(),
  pickupGuardianId: z.string().optional(),
  pickupVisitorId: z.string().optional()
});

router.post('/gate-passes', authenticateToken, validateBody(gatePassSchema), async (req, res, next) => {
  try {
    const pass = await visitorGateService.createGatePass(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Gate pass requested successfully', data: pass });
  } catch (error) {
    next(error);
  }
});

const reviewSchema = z.object({
  comment: z.string().optional()
});

router.post('/gate-passes/:id/approve', authenticateToken, requireSchoolAdmin, validateBody(reviewSchema), async (req, res, next) => {
  try {
    const pass = await visitorGateService.approveGatePass(req.tenantId!, req.params.id, req.user!.id, req.user!.email, req.body.comment);
    res.json({ statusCode: 200, message: 'Gate pass approved successfully', data: pass });
  } catch (error) {
    next(error);
  }
});

router.post('/gate-passes/:id/reject', authenticateToken, requireSchoolAdmin, validateBody(reviewSchema), async (req, res, next) => {
  try {
    const pass = await visitorGateService.rejectGatePass(req.tenantId!, req.params.id, req.user!.id, req.user!.email, req.body.comment);
    res.json({ statusCode: 200, message: 'Gate pass rejected successfully', data: pass });
  } catch (error) {
    next(error);
  }
});

router.post('/gate-passes/:id/exit', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const pass = await visitorGateService.recordExit(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Student exit recorded successfully', data: pass });
  } catch (error) {
    next(error);
  }
});

router.post('/gate-passes/:id/return', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const pass = await visitorGateService.recordReturn(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Student return recorded successfully', data: pass });
  } catch (error) {
    next(error);
  }
});

import { prisma } from '../prisma';
export default router;
