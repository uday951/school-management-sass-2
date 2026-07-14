import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { examsService } from '../services/exams.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { 
  AcademicTermType, 
  ExamCycleStatus, 
  ExamType, 
  ExamStatus, 
  ResultStatus, 
  GradingMode, 
  AssessmentComponentType, 
  GradeScaleBasis, 
  SpecialStatus, 
  Status 
} from '@prisma/client';

const router = Router();

// ==========================================
// A. ACADEMIC TERMS
// ==========================================
const academicTermSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  termType: z.nativeEnum(AcademicTermType),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  sortOrder: z.number().optional()
});

const updateAcademicTermSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  termType: z.nativeEnum(AcademicTermType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.number().optional(),
  status: z.nativeEnum(Status).optional()
});

router.get('/exams/academic-terms', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const yearId = req.query.academicYearId as string;
    if (!yearId) throw new Error('academicYearId query param is required');
    const data = await examsService.listAcademicTerms(req.tenantId!, req.schoolId!, yearId);
    res.json({ statusCode: 200, message: 'Academic terms resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/academic-terms', authenticateToken, requireSchoolAdmin, validateBody(academicTermSchema), async (req, res, next) => {
  try {
    const data = await examsService.createAcademicTerm(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Academic term created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/exams/academic-terms/:id', authenticateToken, requireSchoolAdmin, validateBody(updateAcademicTermSchema), async (req, res, next) => {
  try {
    const data = await examsService.updateAcademicTerm(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Academic term updated', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// B. EXAM CYCLES
// ==========================================
const examCycleSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  academicTermId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const updateExamCycleSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ExamCycleStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

router.get('/exams/exam-cycles', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const yearId = req.query.academicYearId as string;
    if (!yearId) throw new Error('academicYearId query param is required');
    const data = await examsService.listExamCycles(req.tenantId!, req.schoolId!, yearId);
    res.json({ statusCode: 200, message: 'Exam cycles resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/exam-cycles', authenticateToken, requireSchoolAdmin, validateBody(examCycleSchema), async (req, res, next) => {
  try {
    const data = await examsService.createExamCycle(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Exam cycle created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/exams/exam-cycles/:id', authenticateToken, requireSchoolAdmin, validateBody(updateExamCycleSchema), async (req, res, next) => {
  try {
    const data = await examsService.updateExamCycle(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Exam cycle updated', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// C. EXAMS
// ==========================================
const examSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year is required'),
  academicTermId: z.string().optional(),
  examCycleId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  examType: z.nativeEnum(ExamType),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const updateExamSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  examType: z.nativeEnum(ExamType).optional(),
  status: z.nativeEnum(ExamStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  resultStatus: z.nativeEnum(ResultStatus).optional()
});

router.get('/exams', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const yearId = req.query.academicYearId as string;
    if (!yearId) throw new Error('academicYearId query param is required');
    const data = await examsService.listExams(req.tenantId!, req.schoolId!, yearId);
    res.json({ statusCode: 200, message: 'Exams resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/exams/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await examsService.getExamDetails(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Exam details resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams', authenticateToken, requireSchoolAdmin, validateBody(examSchema), async (req, res, next) => {
  try {
    const data = await examsService.createExam(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Exam created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/exams/:id', authenticateToken, requireSchoolAdmin, validateBody(updateExamSchema), async (req, res, next) => {
  try {
    const data = await examsService.updateExam(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Exam updated', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/exams/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.archiveExam(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Exam archived' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// D. EXAM TARGETS
// ==========================================
const examTargetsSchema = z.object({
  targets: z.array(z.object({
    classId: z.string().min(1, 'Class is required'),
    sectionId: z.string().nullable().optional()
  }))
});

router.post('/exams/:id/targets', authenticateToken, requireSchoolAdmin, validateBody(examTargetsSchema), async (req, res, next) => {
  try {
    const data = await examsService.setExamTargets(req.tenantId!, req.schoolId!, req.params.id, req.body.targets, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Exam targets updated', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// E. EXAM SUBJECTS & COMPONENTS
// ==========================================
const examSubjectSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  maximumMarks: z.number().positive(),
  passMarks: z.number().nonnegative(),
  weightage: z.number().optional(),
  gradingMode: z.nativeEnum(GradingMode),
  isOptional: z.boolean().optional(),
  sortOrder: z.number().optional()
});

const updateExamSubjectSchema = z.object({
  maximumMarks: z.number().positive().optional(),
  passMarks: z.number().nonnegative().optional(),
  weightage: z.number().optional(),
  gradingMode: z.nativeEnum(GradingMode).optional(),
  isOptional: z.boolean().optional(),
  sortOrder: z.number().optional()
});

const setComponentsSchema = z.object({
  components: z.array(z.object({
    name: z.string().min(1),
    code: z.string().optional(),
    componentType: z.nativeEnum(AssessmentComponentType),
    maximumMarks: z.number().positive(),
    passMarks: z.number().nonnegative().optional(),
    weightage: z.number().optional(),
    sortOrder: z.number().optional(),
    isRequired: z.boolean().optional()
  }))
});

router.get('/exams/:id/subjects', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await examsService.listExamSubjects(req.tenantId!, req.params.id);
    res.json({ statusCode: 200, message: 'Exam subjects resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/subjects', authenticateToken, requireSchoolAdmin, validateBody(examSubjectSchema), async (req, res, next) => {
  try {
    const data = await examsService.addExamSubject(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Exam subject added', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/exams/subjects/:id', authenticateToken, requireSchoolAdmin, validateBody(updateExamSubjectSchema), async (req, res, next) => {
  try {
    const data = await examsService.updateExamSubject(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Exam subject updated', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/exams/subjects/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.deleteExamSubject(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Exam subject deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/subjects/:id/components', authenticateToken, requireSchoolAdmin, validateBody(setComponentsSchema), async (req, res, next) => {
  try {
    const data = await examsService.setAssessmentComponents(req.tenantId!, req.schoolId!, req.params.id, req.body.components, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Assessment components configured', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// F. GRADE SCALES
// ==========================================
const gradeScaleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  calculationBasis: z.nativeEnum(GradeScaleBasis),
  isDefault: z.boolean().optional()
});

const setBoundariesSchema = z.object({
  boundaries: z.array(z.object({
    grade: z.string().min(1),
    minimumValue: z.number().nonnegative(),
    maximumValue: z.number().nonnegative(),
    gradePoint: z.number().optional(),
    description: z.string().optional(),
    sortOrder: z.number().optional()
  }))
});

router.get('/exams/grade-scales', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await examsService.listGradeScales(req.tenantId!);
    res.json({ statusCode: 200, message: 'Grade scales resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/grade-scales', authenticateToken, requireSchoolAdmin, validateBody(gradeScaleSchema), async (req, res, next) => {
  try {
    const data = await examsService.createGradeScale(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Grade scale created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/exams/grade-scales/:id', authenticateToken, requireSchoolAdmin, validateBody(gradeScaleSchema.partial()), async (req, res, next) => {
  try {
    const data = await examsService.updateGradeScale(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Grade scale updated', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/exams/grade-scales/:id', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.deleteGradeScale(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Grade scale deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/grade-scales/:id/boundaries', authenticateToken, requireSchoolAdmin, validateBody(setBoundariesSchema), async (req, res, next) => {
  try {
    const data = await examsService.setGradeBoundaries(req.tenantId!, req.schoolId!, req.params.id, req.body.boundaries, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Grade boundaries updated', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// G. TEACHER MARKS PORTAL
// ==========================================
router.get('/teacher/exams/marks-contexts', authenticateToken, async (req, res, next) => {
  try {
    const data = await examsService.getTeacherMarksContexts(req.tenantId!, req.schoolId!, req.user!.id);
    res.json({ statusCode: 200, message: 'Teacher contexts resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/exams/marks-roster', authenticateToken, async (req, res, next) => {
  try {
    const examSubjectId = req.query.examSubjectId as string;
    const sectionId = req.query.sectionId as string;
    if (!examSubjectId || !sectionId) throw new Error('examSubjectId and sectionId are required queries');

    // Admin can access all rosters; Teachers get verified inside service
    const employeeUserId = req.user!.userType === 'SCHOOL_ADMIN' ? undefined : req.user!.id;

    const data = await examsService.getMarksRoster(req.tenantId!, req.schoolId!, examSubjectId, sectionId, employeeUserId);
    res.json({ statusCode: 200, message: 'Marks roster resolved', data });
  } catch (error) {
    next(error);
  }
});

const saveMarksSchema = z.object({
  examSubjectId: z.string().min(1),
  sectionId: z.string().min(1),
  entries: z.array(z.object({
    studentId: z.string().min(1),
    enrollmentId: z.string().min(1),
    componentId: z.string().nullable().optional(),
    marksObtained: z.number().nullable().optional(),
    specialStatus: z.nativeEnum(SpecialStatus).nullable().optional(),
    remarks: z.string().nullable().optional()
  }))
});

router.post('/exams/marks-draft', authenticateToken, validateBody(saveMarksSchema), async (req, res, next) => {
  try {
    await examsService.saveMarksDraft(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Draft marks saved successfully' });
  } catch (error) {
    next(error);
  }
});

const submitMarksSchema = z.object({
  examSubjectId: z.string().min(1),
  sectionId: z.string().min(1)
});

router.post('/exams/marks-submit', authenticateToken, validateBody(submitMarksSchema), async (req, res, next) => {
  try {
    await examsService.submitMarks(req.tenantId!, req.schoolId!, req.body.examSubjectId, req.body.sectionId, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Marks submitted successfully' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// H. ADMIN MARKS LOCK / REOPEN
// ==========================================
router.get('/exams/:id/marks-status', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await examsService.getMarksSubmissionsStatus(req.tenantId!, req.schoolId!, req.params.id);
    res.json({ statusCode: 200, message: 'Submissions status resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/marks-submissions/:id/lock', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.lockMarks(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Marks locked successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/marks-submissions/:id/reopen', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.reopenMarks(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Marks unlocked successfully' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// I. CORRECTIONS WORKFLOW
// ==========================================
const correctionRequestSchema = z.object({
  examId: z.string().min(1),
  marksEntryId: z.string().min(1),
  requestedValue: z.number().nullable().optional(),
  reason: z.string().min(1, 'Reason is required')
});

router.post('/exams/marks-corrections', authenticateToken, validateBody(correctionRequestSchema), async (req, res, next) => {
  try {
    const data = await examsService.requestMarksCorrection(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Correction requested', data });
  } catch (error) {
    next(error);
  }
});

router.get('/exams/marks-corrections/queue', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const examId = req.query.examId as string;
    const data = await examsService.listCorrectionRequests(req.tenantId!, req.schoolId!, examId);
    res.json({ statusCode: 200, message: 'Corrections list resolved', data });
  } catch (error) {
    next(error);
  }
});

const reviewCorrectionSchema = z.object({
  reviewComment: z.string().min(1, 'Review comment is required')
});

router.post('/exams/marks-corrections/:id/approve', authenticateToken, requireSchoolAdmin, validateBody(reviewCorrectionSchema), async (req, res, next) => {
  try {
    const data = await examsService.approveCorrectionRequest(req.tenantId!, req.schoolId!, req.params.id, req.body.reviewComment, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Correction request approved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/marks-corrections/:id/reject', authenticateToken, requireSchoolAdmin, validateBody(reviewCorrectionSchema), async (req, res, next) => {
  try {
    const data = await examsService.rejectCorrectionRequest(req.tenantId!, req.schoolId!, req.params.id, req.body.reviewComment, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Correction request rejected', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// J. RESULTS ENGINE & PUBLISHING (Admin Only)
// ==========================================
const calculateResultsSchema = z.object({
  classId: z.string().min(1),
  sectionId: z.string().min(1)
});

router.post('/exams/:id/calculate', authenticateToken, requireSchoolAdmin, validateBody(calculateResultsSchema), async (req, res, next) => {
  try {
    const data = await examsService.calculateResults(req.tenantId!, req.schoolId!, req.params.id, req.body.classId, req.body.sectionId, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Results calculated successfully', data });
  } catch (error) {
    next(error);
  }
});

router.get('/exams/:id/results', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const classId = req.query.classId as string;
    const sectionId = req.query.sectionId as string;
    const data = await examsService.listResults(req.tenantId!, req.params.id, classId, sectionId);
    res.json({ statusCode: 200, message: 'Calculated results list resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/:id/approve-results', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.approveResults(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Results approved successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/:id/publish-results', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.publishResults(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Results published to student and guardian portals' });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/:id/unpublish-results', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    await examsService.unpublishResults(req.tenantId!, req.schoolId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Results unpublished' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// K. STUDENT & GUARDIAN PORTAL RESULTS
// ==========================================
router.get('/student/exams/results', authenticateToken, async (req, res, next) => {
  try {
    const data = await examsService.getStudentPortalResults(req.tenantId!, req.user!.id);
    res.json({ statusCode: 200, message: 'Published results resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/student/exams/results/:examId', authenticateToken, async (req, res, next) => {
  try {
    const data = await examsService.getStudentPortalExamDetail(req.tenantId!, req.user!.id, req.params.examId);
    res.json({ statusCode: 200, message: 'Exam result details resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/guardian/children/:studentId/results', authenticateToken, async (req, res, next) => {
  try {
    const data = await examsService.getGuardianPortalResults(req.tenantId!, req.user!.id, req.params.studentId);
    res.json({ statusCode: 200, message: 'Child published results resolved', data });
  } catch (error) {
    next(error);
  }
});

router.get('/guardian/children/:studentId/results/:examId', authenticateToken, async (req, res, next) => {
  try {
    const data = await examsService.getGuardianPortalExamDetail(req.tenantId!, req.user!.id, req.params.studentId, req.params.examId);
    res.json({ statusCode: 200, message: 'Child exam result details resolved', data });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// L. REMARKS & CO-SCHOLASTIC
// ==========================================
const saveRemarksSchema = z.object({
  examId: z.string().min(1),
  studentId: z.string().min(1),
  studentEnrollmentId: z.string().min(1),
  classTeacherRemark: z.string().optional(),
  principalRemark: z.string().optional()
});

router.post('/exams/remarks', authenticateToken, validateBody(saveRemarksSchema), async (req, res, next) => {
  try {
    const data = await examsService.saveStudentRemarks(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Remarks saved successfully', data });
  } catch (error) {
    next(error);
  }
});

const coScholasticAreaSchema = z.object({
  academicYearId: z.string().min(1),
  name: z.string().min(1),
  code: z.string().optional(),
  sortOrder: z.number().optional()
});

router.get('/exams/co-scholastic/areas', authenticateToken, async (req, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) throw new Error('academicYearId query is required');
    const data = await examsService.listCoScholasticAreas(req.tenantId!, academicYearId);
    res.json({ statusCode: 200, message: 'Scholastic areas resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/co-scholastic/areas', authenticateToken, requireSchoolAdmin, validateBody(coScholasticAreaSchema), async (req, res, next) => {
  try {
    const data = await examsService.createCoScholasticArea(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Co-scholastic area created', data });
  } catch (error) {
    next(error);
  }
});

const saveCoScholasticEntriesSchema = z.object({
  examId: z.string().min(1),
  studentId: z.string().min(1),
  entries: z.array(z.object({
    areaId: z.string().min(1),
    grade: z.string().min(1),
    remarks: z.string().nullable().optional()
  }))
});

router.post('/exams/co-scholastic/entries', authenticateToken, validateBody(saveCoScholasticEntriesSchema), async (req, res, next) => {
  try {
    await examsService.saveCoScholasticEntries(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Co-scholastic grades saved' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// M. REPORT CARD TEMPLATES & GENERATION
// ==========================================
const reportCardTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  paperSize: z.string().default('A4'),
  orientation: z.string().default('PORTRAIT'),
  showLogo: z.boolean().default(true),
  showAddress: z.boolean().default(true),
  showStudentPhoto: z.boolean().default(false),
  showRollNumber: z.boolean().default(true),
  showDateOfBirth: z.boolean().default(true),
  showComponents: z.boolean().default(true),
  showGrades: z.boolean().default(true),
  showGradePoints: z.boolean().default(true),
  showPercentage: z.boolean().default(true),
  showRank: z.boolean().default(false),
  showAttendance: z.boolean().default(true),
  showTeacherRemarks: z.boolean().default(true),
  showPrincipalRemarks: z.boolean().default(true),
  showSignatureAreas: z.boolean().default(true),
  footerText: z.string().optional()
});

router.get('/exams/report-card-templates', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const data = await examsService.listReportCardTemplates(req.tenantId!);
    res.json({ statusCode: 200, message: 'Report card templates resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/report-card-templates', authenticateToken, requireSchoolAdmin, validateBody(reportCardTemplateSchema), async (req, res, next) => {
  try {
    const data = await examsService.createReportCardTemplate(req.tenantId!, req.schoolId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Template created', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/exams/report-card-templates/:id', authenticateToken, requireSchoolAdmin, validateBody(reportCardTemplateSchema.partial()), async (req, res, next) => {
  try {
    const data = await examsService.updateReportCardTemplate(req.tenantId!, req.schoolId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Template updated', data });
  } catch (error) {
    next(error);
  }
});

const generateReportCardSchema = z.object({
  examId: z.string().min(1),
  studentId: z.string().min(1),
  templateId: z.string().min(1)
});

router.post('/exams/report-cards/preview', authenticateToken, requireSchoolAdmin, validateBody(generateReportCardSchema), async (req, res, next) => {
  try {
    const data = await examsService.previewReportCard(req.tenantId!, req.schoolId!, req.body.examId, req.body.studentId, req.body.templateId);
    res.json({ statusCode: 200, message: 'Report card preview resolved', data });
  } catch (error) {
    next(error);
  }
});

router.post('/exams/report-cards/generate', authenticateToken, requireSchoolAdmin, validateBody(generateReportCardSchema), async (req, res, next) => {
  try {
    const data = await examsService.generateReportCard(req.tenantId!, req.schoolId!, req.body.examId, req.body.studentId, req.body.templateId, req.user!.id, req.user!.email);
    res.json({ statusCode: 201, message: 'Report card snapshot generated', data });
  } catch (error) {
    next(error);
  }
});

router.get('/exams/report-cards/snapshot', authenticateToken, async (req, res, next) => {
  try {
    const examId = req.query.examId as string;
    const studentId = req.query.studentId as string;
    if (!examId || !studentId) throw new Error('examId and studentId query params are required');

    // Enforce student portal own check
    if (req.user!.userType === 'STUDENT') {
      const student = await prisma.student.findFirst({ where: { userId: req.user!.id } });
      if (student && student.id !== studentId) throw new AppError(403, 'Unauthorized access to other student profile');
    }

    const data = await examsService.getReportCardSnapshot(req.tenantId!, examId, studentId);
    res.json({ statusCode: 200, message: 'Report card snapshot resolved', data });
  } catch (error) {
    next(error);
  }
});

export default router;
