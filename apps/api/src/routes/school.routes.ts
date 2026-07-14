import { Router } from 'express';
import { z } from 'zod';
import { schoolService } from '../services/school.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { AcademicYearStatus, Status, DepartmentType, SubjectType } from '@prisma/client';

const router = Router();

// Apply global school admin protection
router.use(authenticateToken, requireSchoolAdmin);

// 1. DASHBOARD & SETUP STATUS
router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await schoolService.getDashboardData(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'School dashboard metrics retrieved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/setup-status', async (req, res, next) => {
  try {
    const data = await schoolService.getSetupStatus(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Setup checklist progress retrieved', data });
  } catch (error) {
    next(error);
  }
});

// 2. PROFILE
router.get('/profile', async (req, res, next) => {
  try {
    const profile = await schoolService.getProfile(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'School profile details retrieved', data: profile });
  } catch (error) {
    next(error);
  }
});

const updateProfileSchema = z.object({
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

router.patch('/profile', validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const profile = await schoolService.updateProfile(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'School profile updated successfully', data: profile });
  } catch (error) {
    next(error);
  }
});

// 3. ACADEMIC YEARS
const createAcademicYearSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.nativeEnum(AcademicYearStatus).optional(),
});

router.post('/academic-years', validateBody(createAcademicYearSchema), async (req, res, next) => {
  try {
    const year = await schoolService.createAcademicYear(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Academic year created', data: year });
  } catch (error) {
    next(error);
  }
});

router.get('/academic-years', async (req, res, next) => {
  try {
    const years = await schoolService.listAcademicYears(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Academic sessions list retrieved', data: years });
  } catch (error) {
    next(error);
  }
});

router.get('/academic-years/:id', async (req, res, next) => {
  try {
    const year = await schoolService.getAcademicYear(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Academic session details retrieved', data: year });
  } catch (error) {
    next(error);
  }
});

const updateAcademicYearSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.nativeEnum(AcademicYearStatus).optional(),
});

router.patch('/academic-years/:id', validateBody(updateAcademicYearSchema), async (req, res, next) => {
  try {
    const year = await schoolService.updateAcademicYear(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Academic session updated', data: year });
  } catch (error) {
    next(error);
  }
});

router.patch('/academic-years/:id/set-current', async (req, res, next) => {
  try {
    const year = await schoolService.setCurrentAcademicYear(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Current academic session updated', data: year });
  } catch (error) {
    next(error);
  }
});

// 4. DEPARTMENTS
const createDeptSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.nativeEnum(DepartmentType).optional(),
  description: z.string().optional(),
});

router.post('/departments', validateBody(createDeptSchema), async (req, res, next) => {
  try {
    const dept = await schoolService.createDepartment(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Department division created', data: dept });
  } catch (error) {
    next(error);
  }
});

router.get('/departments', async (req, res, next) => {
  try {
    const depts = await schoolService.listDepartments(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Departments list retrieved', data: depts });
  } catch (error) {
    next(error);
  }
});

router.get('/departments/:id', async (req, res, next) => {
  try {
    const dept = await schoolService.getDepartment(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Department details retrieved', data: dept });
  } catch (error) {
    next(error);
  }
});

const updateDeptSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  type: z.nativeEnum(DepartmentType).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

router.patch('/departments/:id', validateBody(updateDeptSchema), async (req, res, next) => {
  try {
    const dept = await schoolService.updateDepartment(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Department updated successfully', data: dept });
  } catch (error) {
    next(error);
  }
});

// 5. CLASSES (GradeLevels)
const createClassSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  displayOrder: z.number().min(0).optional(),
  description: z.string().optional(),
});

router.post('/classes', validateBody(createClassSchema), async (req, res, next) => {
  try {
    const classRecord = await schoolService.createClass(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Class grade level created', data: classRecord });
  } catch (error) {
    next(error);
  }
});

router.get('/classes', async (req, res, next) => {
  try {
    const classes = await schoolService.listClasses(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Classes list retrieved', data: classes });
  } catch (error) {
    next(error);
  }
});

router.get('/classes/:id', async (req, res, next) => {
  try {
    const classRecord = await schoolService.getClass(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Class details retrieved', data: classRecord });
  } catch (error) {
    next(error);
  }
});

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  displayOrder: z.number().min(0).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

router.patch('/classes/:id', validateBody(updateClassSchema), async (req, res, next) => {
  try {
    const classRecord = await schoolService.updateClass(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Class updated successfully', data: classRecord });
  } catch (error) {
    next(error);
  }
});

// 6. SECTIONS
const createSecSchema = z.object({
  gradeLevelId: z.string(),
  name: z.string().min(1),
  code: z.string().optional(),
  capacity: z.number().min(1).optional(),
  displayOrder: z.number().min(0).optional(),
});

router.post('/sections', validateBody(createSecSchema), async (req, res, next) => {
  try {
    const section = await schoolService.createSection(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Class section created', data: section });
  } catch (error) {
    next(error);
  }
});

router.get('/sections', async (req, res, next) => {
  try {
    const gradeLevelId = req.query.gradeLevelId as string | undefined;
    const sections = await schoolService.listSections(req.tenantId!, req.schoolId!, gradeLevelId);
    res.json({ statusCode: 200, message: 'Sections list retrieved', data: sections });
  } catch (error) {
    next(error);
  }
});

router.get('/sections/:id', async (req, res, next) => {
  try {
    const section = await schoolService.getSection(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Section details retrieved', data: section });
  } catch (error) {
    next(error);
  }
});

const updateSecSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  capacity: z.number().min(1).optional(),
  displayOrder: z.number().min(0).optional(),
  status: z.nativeEnum(Status).optional(),
});

router.patch('/sections/:id', validateBody(updateSecSchema), async (req, res, next) => {
  try {
    const section = await schoolService.updateSection(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Section updated successfully', data: section });
  } catch (error) {
    next(error);
  }
});

// 7. SUBJECTS
const createSubSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1),
  description: z.string().optional(),
  subjectType: z.nativeEnum(SubjectType).optional(),
  departmentId: z.string().optional(),
});

router.post('/subjects', validateBody(createSubSchema), async (req, res, next) => {
  try {
    const subject = await schoolService.createSubject(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Subject created', data: subject });
  } catch (error) {
    next(error);
  }
});

router.get('/subjects', async (req, res, next) => {
  try {
    const departmentId = req.query.departmentId as string | undefined;
    const subjects = await schoolService.listSubjects(req.tenantId!, req.schoolId!, departmentId);
    res.json({ statusCode: 200, message: 'Subjects list retrieved', data: subjects });
  } catch (error) {
    next(error);
  }
});

router.get('/subjects/:id', async (req, res, next) => {
  try {
    const subject = await schoolService.getSubject(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Subject details retrieved', data: subject });
  } catch (error) {
    next(error);
  }
});

const updateSubSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  subjectType: z.nativeEnum(SubjectType).optional(),
  departmentId: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

router.patch('/subjects/:id', validateBody(updateSubSchema), async (req, res, next) => {
  try {
    const subject = await schoolService.updateSubject(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Subject updated successfully', data: subject });
  } catch (error) {
    next(error);
  }
});

// 8. SUBJECT MAPPINGS
const createMapSchema = z.object({
  gradeLevelId: z.string(),
  subjectId: z.string(),
  academicYearId: z.string(),
  sectionId: z.string().optional(),
  isMandatory: z.boolean().optional(),
});

router.post('/class-subjects', validateBody(createMapSchema), async (req, res, next) => {
  try {
    const mapping = await schoolService.mapSubject(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Subject mapped to class standard', data: mapping });
  } catch (error) {
    next(error);
  }
});

const bulkMapSchema = z.object({
  gradeLevelId: z.string(),
  subjectIds: z.array(z.string()).min(1),
  academicYearId: z.string(),
  sectionId: z.string().optional(),
  isMandatory: z.boolean().optional(),
});

router.post('/class-subjects/bulk', validateBody(bulkMapSchema), async (req, res, next) => {
  try {
    const result = await schoolService.bulkMapSubjects(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Subjects bulk mapped successfully', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/class-subjects', async (req, res, next) => {
  try {
    const { academicYearId, gradeLevelId, sectionId } = req.query as any;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query parameter required' });
    }
    const mappings = await schoolService.listMappings(
      req.tenantId!,
      req.schoolId!,
      academicYearId,
      gradeLevelId,
      sectionId,
    );
    res.json({ statusCode: 200, message: 'Curriculum mappings retrieved', data: mappings });
  } catch (error) {
    next(error);
  }
});

router.delete('/class-subjects/:id', async (req, res, next) => {
  try {
    const updated = await schoolService.unmapSubject(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Subject unmapped successfully', data: updated });
  } catch (error) {
    next(error);
  }
});

// 9. ROLES
const createRoleSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

router.post('/roles', validateBody(createRoleSchema), async (req, res, next) => {
  try {
    const role = await schoolService.createRole(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Staff Custom role created', data: role });
  } catch (error) {
    next(error);
  }
});

router.get('/roles', async (req, res, next) => {
  try {
    const roles = await schoolService.listRoles(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Roles list retrieved', data: roles });
  } catch (error) {
    next(error);
  }
});

router.get('/roles/:id', async (req, res, next) => {
  try {
    const role = await schoolService.getRole(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Role details retrieved', data: role });
  } catch (error) {
    next(error);
  }
});

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

router.patch('/roles/:id', validateBody(updateRoleSchema), async (req, res, next) => {
  try {
    const role = await schoolService.updateRole(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Role updated successfully', data: role });
  } catch (error) {
    next(error);
  }
});

const updatePermsSchema = z.object({
  permissions: z.array(z.string()),
});

router.put('/roles/:id/permissions', validateBody(updatePermsSchema), async (req, res, next) => {
  try {
    const role = await schoolService.updateRolePermissions(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body.permissions,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Permissions updated successfully', data: role });
  } catch (error) {
    next(error);
  }
});

// 10. AUDIT LOGS
const queryAuditSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

router.get('/audit-logs', validateQuery(queryAuditSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const logs = await schoolService.listAuditLogs(req.tenantId!, req.schoolId!, page, limit);
    res.json({ statusCode: 200, message: 'Audit logs retrieved successfully', data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
