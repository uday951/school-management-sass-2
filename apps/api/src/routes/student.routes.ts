import { Router } from 'express';
import { z } from 'zod';
import { studentService } from '../services/student.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { StudentStatus, EnrollmentStatus } from '@prisma/client';

const router = Router();

// Apply global school admin protection
router.use(authenticateToken, requireSchoolAdmin);

// 1. STUDENTS DIRECTORY & CRUD
const queryStudentsSchema = z.object({
  search: z.string().optional(),
  academicYearId: z.string().optional(),
  gradeLevelId: z.string().optional(),
  sectionId: z.string().optional(),
  status: z.nativeEnum(StudentStatus).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/students', validateQuery(queryStudentsSchema), async (req, res, next) => {
  try {
    const params: any = req.query;
    const result = await studentService.listStudents(req.tenantId!, req.schoolId!, {
      ...params,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    });
    res.json({ statusCode: 200, message: 'Students directory retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

const createStudentSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string(),
  gender: z.string().min(1),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  motherTongue: z.string().optional(),
  personalEmail: z.string().email().or(z.literal('')).optional(),
  personalPhone: z.string().optional(),
  admissionNumber: z.string().min(1),
  admissionDate: z.string(),
  joiningType: z.string().optional(),
  previousSchoolName: z.string().optional(),
  previousClassName: z.string().optional(),

  // Addresses
  currentAddressLine1: z.string().min(1),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().min(1),
  currentState: z.string().min(1),
  currentCountry: z.string().min(1),
  currentPostalCode: z.string().min(1),

  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCountry: z.string().optional(),
  permanentPostalCode: z.string().optional(),
  sameAsCurrentAddress: z.boolean(),

  // Emergency / Sensitive Info
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
  specialAssistanceNotes: z.string().optional(),

  // Initial Enrollment
  enrollment: z.object({
    academicYearId: z.string(),
    gradeLevelId: z.string(),
    sectionId: z.string(),
    rollNumber: z.string().optional(),
  }),

  // Guardians
  guardians: z.array(
    z.object({
      guardianId: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      alternatePhone: z.string().optional(),
      email: z.string().email().or(z.literal('')).optional(),
      occupation: z.string().optional(),
      employer: z.string().optional(),
      relationship: z.string().min(1),
      isPrimary: z.boolean(),
      isEmergencyContact: z.boolean(),
      isAuthorizedPickup: z.boolean(),
      receivesAcademicUpdates: z.boolean(),
      receivesAttendanceUpdates: z.boolean(),
      receivesFeeUpdates: z.boolean(),
      hasPortalAccess: z.boolean(),
    }),
  ).min(1, 'At least one guardian profile must be provided'),

  // Documents
  documents: z.array(
    z.object({
      documentType: z.string(),
      title: z.string(),
      fileUrl: z.string().optional(),
      storageKey: z.string().optional(),
      mimeType: z.string().optional(),
      fileSize: z.number().optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
    }),
  ).optional(),
});

router.post('/students', validateBody(createStudentSchema), async (req, res, next) => {
  try {
    const result = await studentService.createStudent(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Student created and enrolled successfully', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:id', async (req, res, next) => {
  try {
    const profile = await studentService.getStudentProfile(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Student details profile retrieved', data: profile });
  } catch (error) {
    next(error);
  }
});

const updateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(1).optional(),
  preferredName: z.string().optional(),
  photoUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().min(1).optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  motherTongue: z.string().optional(),
  personalEmail: z.string().email().or(z.literal('')).optional(),
  personalPhone: z.string().optional(),
  joiningType: z.string().optional(),
  previousSchoolName: z.string().optional(),
  previousClassName: z.string().optional(),

  // Addresses
  currentAddressLine1: z.string().min(1).optional(),
  currentAddressLine2: z.string().optional(),
  currentCity: z.string().min(1).optional(),
  currentState: z.string().min(1).optional(),
  currentCountry: z.string().min(1).optional(),
  currentPostalCode: z.string().min(1).optional(),

  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  permanentCountry: z.string().optional(),
  permanentPostalCode: z.string().optional(),
  sameAsCurrentAddress: z.boolean().optional(),

  // Emergency / Sensitive Info
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
  specialAssistanceNotes: z.string().optional(),
});

router.patch('/students/:id', validateBody(updateStudentSchema), async (req, res, next) => {
  try {
    const updated = await studentService.updateStudent(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Student profile updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
});

const statusSchema = z.object({
  status: z.nativeEnum(StudentStatus),
  reason: z.string().optional(),
});

router.patch('/students/:id/status', validateBody(statusSchema), async (req, res, next) => {
  try {
    const updated = await studentService.updateStudentStatus(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Student lifecycle status changed successfully', data: updated });
  } catch (error) {
    next(error);
  }
});

// 2. ENROLLMENTS & TRANSFERS
const transferSchema = z.object({
  targetSectionId: z.string().min(1),
  reason: z.string().optional(),
});

router.post('/enrollments/:id/transfer-section', validateBody(transferSchema), async (req, res, next) => {
  try {
    const updated = await studentService.transferSection(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Student section transfer completed successfully', data: updated });
  } catch (error) {
    next(error);
  }
});

const changeClassSchema = z.object({
  studentId: z.string(),
  academicYearId: z.string(),
  gradeLevelId: z.string(),
  sectionId: z.string(),
  rollNumber: z.string().optional(),
});

router.post('/students/:studentId/change-class', validateBody(changeClassSchema), async (req, res, next) => {
  try {
    const result = await studentService.changeClass(
      req.tenantId!,
      req.schoolId!,
      {
        ...req.body,
        studentId: req.params.studentId,
      },
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Student enrollment promotion updated successfully', data: result });
  } catch (error) {
    next(error);
  }
});

// 3. GUARDIANS DIRECTORY & CRUD
const queryGuardiansSchema = z.object({
  search: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/guardians', validateQuery(queryGuardiansSchema), async (req, res, next) => {
  try {
    const params: any = req.query;
    const result = await studentService.listGuardians(req.tenantId!, req.schoolId!, {
      ...params,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    });
    res.json({ statusCode: 200, message: 'Guardians directory retrieved', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/guardians/:id', async (req, res, next) => {
  try {
    const profile = await studentService.getGuardianProfile(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Guardian profile details retrieved', data: profile });
  } catch (error) {
    next(error);
  }
});

const createGuardianSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  alternatePhone: z.string().optional(),
  email: z.string().email().or(z.literal('')).optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
});

router.post('/guardians', validateBody(createGuardianSchema), async (req, res, next) => {
  try {
    const guardian = await studentService.createGuardian(
      req.tenantId!,
      req.schoolId!,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Guardian profile created successfully', data: guardian });
  } catch (error) {
    next(error);
  }
});

router.patch('/guardians/:id', validateBody(createGuardianSchema.partial()), async (req, res, next) => {
  try {
    const updated = await studentService.updateGuardian(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Guardian profile updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
});

// 4. STUDENT GUARDIAN LINKS
const linkGuardianSchema = z.object({
  guardianId: z.string(),
  relationship: z.string().min(1),
  isPrimary: z.boolean().optional(),
  isEmergencyContact: z.boolean().optional(),
  isAuthorizedPickup: z.boolean().optional(),
  receivesAcademicUpdates: z.boolean().optional(),
  receivesAttendanceUpdates: z.boolean().optional(),
  receivesFeeUpdates: z.boolean().optional(),
  hasPortalAccess: z.boolean().optional(),
});

router.post('/students/:id/guardians', validateBody(linkGuardianSchema), async (req, res, next) => {
  try {
    const result = await studentService.linkGuardian(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Guardian successfully linked to student profile', data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/student-guardians/:id', async (req, res, next) => {
  try {
    await studentService.unlinkGuardian(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Guardian link removed successfully' });
  } catch (error) {
    next(error);
  }
});

// 5. DOCUMENTS
const addDocSchema = z.object({
  documentType: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().optional(),
  storageKey: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

router.get('/students/:id/documents', async (req, res, next) => {
  try {
    const docs = await studentService.listDocuments(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Student documents list retrieved', data: docs });
  } catch (error) {
    next(error);
  }
});

router.post('/students/:id/documents', validateBody(addDocSchema), async (req, res, next) => {
  try {
    const doc = await studentService.addDocument(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email,
    );
    res.status(201).json({ statusCode: 201, message: 'Document metadata added successfully', data: doc });
  } catch (error) {
    next(error);
  }
});

router.delete('/student-documents/:id', async (req, res, next) => {
  try {
    const doc = await studentService.archiveDocument(
      req.tenantId!,
      req.schoolId!,
      req.params.id,
      req.user!.id,
      req.user!.email,
    );
    res.json({ statusCode: 200, message: 'Document reference archived successfully', data: doc });
  } catch (error) {
    next(error);
  }
});

export default router;
