import { Router } from 'express';
import { feesService } from '../services/fees.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { z } from 'zod';
import { 
  FeeCategoryStatus, 
  FeeComponentType, 
  FeeStructureStatus, 
  ConcessionType, 
  PaymentMethod,
  Status
} from '@prisma/client';

const router = Router();

// ==========================================
// A. FEE CATEGORIES
// ==========================================
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional()
});

router.get('/fees/categories', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.listFeeCategories(req.tenantId!);
    res.json({ statusCode: 200, message: 'Fee categories resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/categories', authenticateToken, requireSchoolAdmin, validateBody(categorySchema), async (req, res, next) => {
  try {
    const data = await feesService.createFeeCategory(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Fee category created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/fees/categories/:id', authenticateToken, requireSchoolAdmin, validateBody(categorySchema.partial().extend({ status: z.nativeEnum(FeeCategoryStatus).optional() })), async (req, res, next) => {
  try {
    const data = await feesService.updateFeeCategory(req.tenantId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Fee category updated', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/fees/categories/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await feesService.deleteFeeCategory(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Fee category deleted' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// B. FEE COMPONENTS
// ==========================================
const componentSchema = z.object({
  feeCategoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  componentType: z.nativeEnum(FeeComponentType),
  isMandatoryDefault: z.boolean().optional()
});

router.get('/fees/components', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.listFeeComponents(req.tenantId!);
    res.json({ statusCode: 200, message: 'Fee components resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/components', authenticateToken, requireSchoolAdmin, validateBody(componentSchema), async (req, res, next) => {
  try {
    const data = await feesService.createFeeComponent(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Fee component created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/fees/components/:id', authenticateToken, requireSchoolAdmin, validateBody(componentSchema.partial().extend({ status: z.nativeEnum(Status).optional() })), async (req, res, next) => {
  try {
    const data = await feesService.updateFeeComponent(req.tenantId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Fee component updated', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/fees/components/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await feesService.deleteFeeComponent(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Fee component deleted' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// C. FEE STRUCTURES
// ==========================================
const structureSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  currency: z.string().optional(),
  items: z.array(z.object({
    feeComponentId: z.string().min(1),
    amountMinor: z.number().int().nonnegative(),
    isMandatory: z.boolean().optional()
  })).min(1, 'At least one item is required'),
  installments: z.array(z.object({
    name: z.string().min(1),
    dueDate: z.string().transform(val => new Date(val)),
    items: z.array(z.object({
      feeComponentId: z.string().min(1),
      amountMinor: z.number().int().nonnegative()
    }))
  })).optional(),
  targets: z.array(z.object({
    classId: z.string().min(1),
    sectionId: z.string().nullable().optional()
  })).optional()
});

router.get('/fees/structures', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.listFeeStructures(req.tenantId!, ayId);
    res.json({ statusCode: 200, message: 'Fee structures resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/fees/structures/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.getFeeStructure(req.tenantId!, req.params.id);
    res.json({ statusCode: 200, message: 'Fee structure details resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/structures', authenticateToken, requireSchoolAdmin, validateBody(structureSchema), async (req, res, next) => {
  try {
    const data = await feesService.createFeeStructure(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Fee structure created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/fees/structures/:id/status', authenticateToken, requireSchoolAdmin, validateBody(z.object({ status: z.nativeEnum(FeeStructureStatus) })), async (req, res, next) => {
  try {
    const data = await feesService.updateFeeStructureStatus(req.tenantId!, req.params.id, req.body.status, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Fee structure status updated', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/fees/structures/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await feesService.deleteFeeStructure(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Fee structure deleted' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// D. ASSIGNMENTS
// ==========================================
router.get('/fees/assignments', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.listAssignments(req.tenantId!, ayId);
    res.json({ statusCode: 200, message: 'Assignments resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/fees/assignments/preview-students', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const classId = req.query.classId as string;
    const sectionId = req.query.sectionId as string;
    const data = await feesService.previewBulkAssignmentStudents(req.tenantId!, classId, sectionId);
    res.json({ statusCode: 200, message: 'Bulk assignment preview resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/assignments/bulk', authenticateToken, requireSchoolAdmin, validateBody(z.object({
  academicYearId: z.string().min(1),
  feeStructureId: z.string().min(1),
  studentIds: z.array(z.string().min(1))
})), async (req, res, next) => {
  try {
    const data = await feesService.assignFeeStructure(req.tenantId!, req.body.academicYearId, req.body.feeStructureId, req.body.studentIds, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Bulk fee assignment completed', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// E. CHARGES & REVERSALS
// ==========================================
const manualChargeSchema = z.object({
  studentId: z.string().min(1),
  feeComponentId: z.string().min(1),
  amountMinor: z.number().int().nonnegative(),
  description: z.string().min(1),
  dueDate: z.string().transform(val => new Date(val)).optional()
});

router.post('/fees/charges/manual', authenticateToken, requireSchoolAdmin, validateBody(manualChargeSchema), async (req, res, next) => {
  try {
    const ayId = req.body.academicYearId || req.query.academicYearId as string || 'default'; // let's pass it in body
    const data = await feesService.createManualCharge(req.tenantId!, req.body.academicYearId, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Manual charge generated', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/charges/:id/reverse', authenticateToken, requireSchoolAdmin, validateBody(z.object({ reason: z.string().min(1) })), async (req, res, next) => {
  try {
    const data = await feesService.reverseCharge(req.tenantId!, req.params.id, req.body.reason, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Charge reversed successfully', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// F. CONCESSIONS
// ==========================================
const concessionSchemeSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional(),
  concessionType: z.nativeEnum(ConcessionType),
  value: z.number().int().nonnegative(),
  maximumAmountMinor: z.number().int().optional()
});

router.get('/fees/concessions/schemes', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.listConcessionSchemes(req.tenantId!);
    res.json({ statusCode: 200, message: 'Concession schemes resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/concessions/schemes', authenticateToken, requireSchoolAdmin, validateBody(concessionSchemeSchema), async (req, res, next) => {
  try {
    const data = await feesService.createConcessionScheme(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Concession scheme created', data });
  } catch (error) {
    next(error);
  }
});

router.get('/fees/concessions/students', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.listStudentConcessions(req.tenantId!, ayId);
    res.json({ statusCode: 200, message: 'Student concessions resolved', data });
  } catch (error) {
    next(error);
  }
});

const applyConcessionSchema = z.object({
  studentId: z.string().min(1),
  concessionSchemeId: z.string().min(1),
  applicableFeeComponentId: z.string().optional(),
  approvedAmountMinor: z.number().int().optional(),
  percentageBasisPoints: z.number().int().optional(),
  reason: z.string().optional()
});

router.post('/fees/concessions/students', authenticateToken, requireSchoolAdmin, validateBody(applyConcessionSchema), async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string || req.body.academicYearId;
    const data = await feesService.applyStudentConcession(req.tenantId!, ayId, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Student concession applied (pending approval)', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/concessions/students/:id/approve', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.approveConcession(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Student concession approved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/fees/concessions/students/:id/reject', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.rejectConcession(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Student concession rejected', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// G. PAYMENTS
// ==========================================
const recordPaymentSchema = z.object({
  studentId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  paymentDate: z.string().transform(val => new Date(val)),
  paymentMethod: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().optional(),
  bankName: z.string().optional(),
  chequeNumber: z.string().optional(),
  chequeDate: z.string().transform(val => new Date(val)).optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
  manualAllocations: z.array(z.object({
    feeChargeId: z.string().min(1),
    amountMinor: z.number().int().positive()
  })).optional()
});

router.get('/payments', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.listPayments(req.tenantId!, ayId);
    res.json({ statusCode: 200, message: 'Payments resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/payments', authenticateToken, requireSchoolAdmin, validateBody(recordPaymentSchema), async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string || req.body.academicYearId;
    const data = await feesService.recordPayment(req.tenantId!, ayId, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Payment recorded and receipt generated', data });
  } catch (error) {
    next(error);
  }
});

router.post('/payments/:id/reverse', authenticateToken, requireSchoolAdmin, validateBody(z.object({ reason: z.string().min(1) })), async (req, res, next) => {
  try {
    const data = await feesService.reversePayment(req.tenantId!, req.params.id, req.body.reason, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Payment reversed and allocations restored', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// H. REFUNDS
// ==========================================
const refundSchema = z.object({
  studentId: z.string().min(1),
  paymentId: z.string().optional(),
  amountMinor: z.number().int().positive(),
  refundDate: z.string().transform(val => new Date(val)),
  refundMethod: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().optional(),
  reason: z.string().min(1)
});

router.get('/refunds', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.listRefunds(req.tenantId!);
    res.json({ statusCode: 200, message: 'Refunds resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/refunds', authenticateToken, requireSchoolAdmin, validateBody(refundSchema), async (req, res, next) => {
  try {
    const data = await feesService.recordRefund(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.status(201).json({ statusCode: 201, message: 'Refund recorded successfully', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// I. STUDENT LEDGER & BALANCES
// ==========================================
router.get('/students/:id/fee-account', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.getStudentFeeAccount(req.tenantId!, req.params.id, ayId);
    res.json({ statusCode: 200, message: 'Student fee account details resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:id/fee-ledger', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.getStudentLedger(req.tenantId!, req.params.id, ayId);
    res.json({ statusCode: 200, message: 'Student fee ledger resolved', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// J. REPORTS & DASHBOARD
// ==========================================
router.get('/finance/dashboard', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.getFinanceDashboard(req.tenantId!, ayId);
    res.json({ statusCode: 200, message: 'Finance dashboard metrics resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/finance/reports/daily-collection', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const dateStr = req.query.date as string || new Date().toISOString();
    const data = await feesService.getDailyCollectionReport(req.tenantId!, new Date(dateStr));
    res.json({ statusCode: 200, message: 'Daily collection report resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/finance/reports/outstanding', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const ayId = req.query.academicYearId as string;
    const data = await feesService.getOutstandingReport(req.tenantId!, ayId);
    res.json({ statusCode: 200, message: 'Outstanding report resolved', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// K. FINANCE SETTINGS
// ==========================================
router.get('/finance/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.getSettings(req.tenantId!);
    res.json({ statusCode: 200, message: 'Finance settings resolved', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/finance/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await feesService.updateSettings(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Finance settings updated', data });
  } catch (error) {
    next(error);
  }
});

export default router;
