import { Router } from 'express';
import { z } from 'zod';
import { employeeService } from '../services/employee.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { EmployeeType, EmploymentType, EmployeeStatus, Status } from '@prisma/client';
import { prisma } from '../prisma';

const router = Router();

// Apply global school admin protection
router.use(authenticateToken, requireSchoolAdmin);

// 1. EMPLOYEES DIRECTORY & CRUD
const queryEmployeesSchema = z.object({
  search: z.string().optional(),
  employeeType: z.nativeEnum(EmployeeType).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  departmentId: z.string().optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/employees', validateQuery(queryEmployeesSchema), async (req, res, next) => {
  try {
    const params: any = req.query;
    const result = await employeeService.listEmployees(req.tenantId!, req.schoolId!, {
      ...params,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    });
    res.json({ statusCode: 200, message: 'Employees directory retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  personalEmail: z.string().email().or(z.literal('')).optional(),
  workEmail: z.string().email().or(z.literal('')).optional(),
  personalPhone: z.string().optional(),
  workPhone: z.string().optional(),
  employeeType: z.nativeEnum(EmployeeType),
  employmentType: z.nativeEnum(EmploymentType),
  designation: z.string().min(1),
  primaryDepartmentId: z.string().optional(),
  joiningDate: z.string(),
  confirmationDate: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  reportingManagerEmployeeId: z.string().optional(),
  
  // Addresses
  currentAddressLine1: z.string().optional(),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().optional(),
  currentState: z.string().optional(),
  currentCountry: z.string().optional(),
  currentPostalCode: z.string().optional(),

  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCountry: z.string().optional(),
  permanentPostalCode: z.string().optional(),
  sameAsCurrentAddress: z.boolean().default(true),

  // Emergency
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),

  // Optional Login credentials creation
  createLoginAccount: z.boolean().optional(),
  loginEmail: z.string().email().or(z.literal('')).optional(),
  schoolRoleId: z.string().optional(),
  temporaryPassword: z.string().optional(),
});

router.post('/employees', validateBody(createEmployeeSchema), async (req, res, next) => {
  try {
    const result = await employeeService.createEmployee(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Employee onboarding successful', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/employees/:id', async (req, res, next) => {
  try {
    const profile = await employeeService.getEmployeeProfile(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Employee profile retrieved', data: profile });
  } catch (error) {
    next(error);
  }
});

router.patch('/employees/:id', validateBody(createEmployeeSchema.partial()), async (req, res, next) => {
  try {
    const result = await employeeService.updateEmployee(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Employee profile updated successfully', data: result });
  } catch (error) {
    next(error);
  }
});

const statusSchema = z.object({
  status: z.nativeEnum(EmployeeStatus),
  reason: z.string().optional(),
});

router.patch('/employees/:id/status', validateBody(statusSchema), async (req, res, next) => {
  try {
    const result = await employeeService.updateStatus(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Employee status changed successfully', data: result });
  } catch (error) {
    next(error);
  }
});

// 2. ACCOUNT ACCESS
const createAccountSchema = z.object({
  loginEmail: z.string().email(),
  schoolRoleId: z.string(),
  temporaryPassword: z.string().optional(),
});

router.post('/employees/:id/account', validateBody(createAccountSchema), async (req, res, next) => {
  try {
    const result = await employeeService.createAccount(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Employee user account created', data: result });
  } catch (error) {
    next(error);
  }
});

const accountStatusSchema = z.object({
  active: z.boolean(),
});

router.patch('/employees/:id/account/status', validateBody(accountStatusSchema), async (req, res, next) => {
  try {
    const result = await employeeService.updateAccountStatus(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Employee user login access modified', data: result });
  } catch (error) {
    next(error);
  }
});

const updateRolesSchema = z.object({
  schoolRoleId: z.string(),
});

router.put('/employees/:id/roles', validateBody(updateRolesSchema), async (req, res, next) => {
  try {
    const result = await employeeService.updateRoles(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Employee workspace roles updated', data: result });
  } catch (error) {
    next(error);
  }
});

// 3. QUALIFICATIONS & EXPERIENCE
const qualificationSchema = z.object({
  qualificationName: z.string().min(1),
  specialization: z.string().optional(),
  institution: z.string().min(1),
  universityOrBoard: z.string().optional(),
  startYear: z.number().optional(),
  completionYear: z.number().optional(),
  gradeOrPercentage: z.string().optional(),
});

router.post('/employees/:id/qualifications', validateBody(qualificationSchema), async (req, res, next) => {
  try {
    const result = await employeeService.addQualification(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
    );
    res.status(201).json({ statusCode: 201, message: 'Qualification added successfully', data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/employee-qualifications/:id', async (req, res, next) => {
  try {
    await employeeService.deleteQualification(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Qualification removed successfully' });
  } catch (error) {
    next(error);
  }
});

const experienceSchema = z.object({
  organizationName: z.string().min(1),
  designation: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
});

router.post('/employees/:id/experience', validateBody(experienceSchema), async (req, res, next) => {
  try {
    const result = await employeeService.addExperience(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
    );
    res.status(201).json({ statusCode: 201, message: 'Experience record added successfully', data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/employee-experience/:id', async (req, res, next) => {
  try {
    await employeeService.deleteExperience(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Experience record removed successfully' });
  } catch (error) {
    next(error);
  }
});

// 4. TEACHER ACADEMIC ASSIGNMENTS
const teacherAssignmentSchema = z.object({
  academicYearId: z.string(),
  employeeId: z.string(),
  subjectId: z.string(),
  gradeLevelId: z.string(),
  sectionId: z.string(),
  assignmentType: z.string().optional(),
});

const queryAssignmentsSchema = z.object({
  academicYearId: z.string().optional(),
  gradeLevelId: z.string().optional(),
  sectionId: z.string().optional(),
  employeeId: z.string().optional(),
});

router.post('/teacher-assignments', validateBody(teacherAssignmentSchema), async (req, res, next) => {
  try {
    const result = await employeeService.createTeacherAssignment(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Teacher assignment created', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/teacher-assignments', validateQuery(queryAssignmentsSchema), async (req, res, next) => {
  try {
    const result = await employeeService.listTeacherAssignments(req.tenantId!, req.schoolId!, req.query);
    res.json({ statusCode: 200, message: 'Teacher assignments list retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/teacher-assignments/:id', async (req, res, next) => {
  try {
    await employeeService.deleteTeacherAssignment(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Teacher assignment removed successfully' });
  } catch (error) {
    next(error);
  }
});

// 5. CLASS TEACHERS
const classTeacherSchema = z.object({
  academicYearId: z.string(),
  gradeLevelId: z.string(),
  sectionId: z.string(),
  employeeId: z.string(),
  isPrimary: z.boolean().optional(),
});

router.post('/class-teacher-assignments', validateBody(classTeacherSchema), async (req, res, next) => {
  try {
    const result = await employeeService.assignClassTeacher(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Class homeroom teacher assigned', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/class-teacher-assignments', async (req, res, next) => {
  try {
    const result = await employeeService.listClassTeachers(req.tenantId!, req.schoolId!, req.query.academicYearId as string);
    res.json({ statusCode: 200, message: 'Class teachers list retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/class-teacher-assignments/:id', async (req, res, next) => {
  try {
    await employeeService.deleteClassTeacher(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Class teacher unassigned successfully' });
  } catch (error) {
    next(error);
  }
});

// 6. DEPARTMENT HEADS
const deptHeadSchema = z.object({
  departmentId: z.string(),
  employeeId: z.string(),
  startDate: z.string(),
});

router.post('/department-heads', validateBody(deptHeadSchema), async (req, res, next) => {
  try {
    const result = await employeeService.assignDepartmentHead(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Department head assigned successfully', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/department-heads', async (req, res, next) => {
  try {
    const result = await employeeService.listDepartmentHeads(req.tenantId!, req.schoolId!);
    res.json({ statusCode: 200, message: 'Department heads list retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/employees/:id/assignments', async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const [assignments, classTeacherAssignments] = await Promise.all([
      prisma.teacherAssignment.findMany({
        where: { tenantId: req.tenantId!, employeeId, status: Status.ACTIVE },
        include: {
          gradeLevel: { select: { name: true } },
          section: { select: { name: true } },
          subject: { select: { name: true } }
        }
      }),
      prisma.classTeacherAssignment.findMany({
        where: { tenantId: req.tenantId!, employeeId, status: Status.ACTIVE },
        include: {
          gradeLevel: { select: { name: true } },
          section: { select: { name: true } }
        }
      })
    ]);

    res.json({
      statusCode: 200,
      message: 'Teacher assignments retrieved',
      data: {
        subjects: assignments.map(a => ({
          id: a.id,
          classId: a.gradeLevelId,
          className: a.gradeLevel.name,
          sectionId: a.sectionId,
          sectionName: a.section.name,
          subjectId: a.subjectId,
          subjectName: a.subject.name,
          type: a.assignmentType
        })),
        classes: classTeacherAssignments.map(a => ({
          id: a.id,
          classId: a.gradeLevelId,
          className: a.gradeLevel.name,
          sectionId: a.sectionId,
          sectionName: a.section.name,
          isPrimary: a.isPrimary
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
