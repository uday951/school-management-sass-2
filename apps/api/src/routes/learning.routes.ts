import { Router } from 'express';
import { z } from 'zod';
import { learningService } from '../services/learning.service';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { HomeworkStatus, AssignmentStatus, StudyMaterialType, EmployeeStatus } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';
import { prisma } from '../prisma';

const router = Router();

// ==========================================
// TEACHER OPERATION ROUTES
// ==========================================

// Helper middleware to resolve the active employee profile for teachers
const resolveTeacher = async (req: any, res: any, next: any) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: { userId: req.user!.id, tenantId: req.tenantId!, status: EmployeeStatus.ACTIVE }
    });
    if (!employee) {
      return next(new AppError(403, 'Active employee profile not found for this user'));
    }
    req.teacherEmployeeId = employee.id;
    next();
  } catch (error) {
    next(error);
  }
};

const createHomeworkSchema = z.object({
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  attachmentUrl: z.string().optional(),
  assignedDate: z.string().min(1),
  dueDate: z.string().optional()
});

router.post('/teacher/homework', authenticateToken, resolveTeacher, validateBody(createHomeworkSchema), async (req: any, res, next) => {
  try {
    const hw = await learningService.createHomework(
      req.tenantId!,
      req.teacherEmployeeId,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.status(201).json({
      statusCode: 201,
      message: 'Homework draft created successfully',
      data: hw
    });
  } catch (error) {
    next(error);
  }
});

router.post('/teacher/homework/:id/publish', authenticateToken, async (req, res, next) => {
  try {
    const hw = await learningService.publishHomework(
      req.tenantId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Homework published successfully to student feeds',
      data: hw
    });
  } catch (error) {
    next(error);
  }
});

router.get('/teacher/homework', authenticateToken, resolveTeacher, async (req: any, res, next) => {
  try {
    const list = await prisma.homework.findMany({
      where: { tenantId: req.tenantId!, teacherEmployeeId: req.teacherEmployeeId, archivedAt: null },
      include: { class: true, section: true, subject: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      statusCode: 200,
      message: 'Teacher homework list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

const createAssignmentSchema = z.object({
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  attachmentUrl: z.string().optional(),
  assignedAt: z.string().min(1),
  dueAt: z.string().min(1),
  maximumMarks: z.number().optional(),
  allowLateSubmission: z.boolean().default(false)
});

router.post('/teacher/assignments', authenticateToken, resolveTeacher, validateBody(createAssignmentSchema), async (req: any, res, next) => {
  try {
    const assign = await learningService.createAssignment(
      req.tenantId!,
      req.teacherEmployeeId,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.status(201).json({
      statusCode: 201,
      message: 'Assignment draft created successfully',
      data: assign
    });
  } catch (error) {
    next(error);
  }
});

router.post('/teacher/assignments/:id/publish', authenticateToken, async (req, res, next) => {
  try {
    const assign = await learningService.publishAssignment(
      req.tenantId!,
      req.params.id,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Assignment published successfully',
      data: assign
    });
  } catch (error) {
    next(error);
  }
});

router.get('/teacher/assignments', authenticateToken, resolveTeacher, async (req: any, res, next) => {
  try {
    const list = await prisma.assignment.findMany({
      where: { tenantId: req.tenantId!, teacherEmployeeId: req.teacherEmployeeId },
      include: { class: true, section: true, subject: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      statusCode: 200,
      message: 'Teacher assignments list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

router.get('/teacher/assignments/:id/submissions', authenticateToken, async (req, res, next) => {
  try {
    const list = await learningService.listSubmissionsForAssignment(req.tenantId!, req.params.id);
    res.json({
      statusCode: 200,
      message: 'Assignment submissions list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

const gradeSubmissionSchema = z.object({
  marksAwarded: z.number().optional(),
  feedback: z.string().optional()
});

router.post('/teacher/submissions/:id/grade', authenticateToken, validateBody(gradeSubmissionSchema), async (req, res, next) => {
  try {
    const result = await learningService.gradeSubmission(
      req.tenantId!,
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.json({
      statusCode: 200,
      message: 'Submission graded and reviewed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

const createStudyMaterialSchema = z.object({
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  materialType: z.nativeEnum(StudyMaterialType).default(StudyMaterialType.NOTES),
  fileAttachmentUrl: z.string().optional(),
  url: z.string().optional()
});

router.post('/teacher/study-materials', authenticateToken, resolveTeacher, validateBody(createStudyMaterialSchema), async (req: any, res, next) => {
  try {
    const mat = await learningService.createStudyMaterial(
      req.tenantId!,
      req.teacherEmployeeId,
      req.body,
      req.user!.id,
      req.user!.email
    );
    res.status(201).json({
      statusCode: 201,
      message: 'Study material created and published successfully',
      data: mat
    });
  } catch (error) {
    next(error);
  }
});

router.get('/teacher/study-materials', authenticateToken, resolveTeacher, async (req: any, res, next) => {
  try {
    const list = await prisma.studyMaterial.findMany({
      where: { tenantId: req.tenantId!, teacherEmployeeId: req.teacherEmployeeId },
      include: { class: true, section: true, subject: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      statusCode: 200,
      message: 'Teacher study materials list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// STUDENT OPERATION ROUTES
// ==========================================

const resolveStudent = async (req: any, res: any, next: any) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user!.id, tenantId: req.tenantId! }
    });
    if (!student) {
      return next(new AppError(403, 'Student profile not found for this user'));
    }
    req.studentId = student.id;
    next();
  } catch (error) {
    next(error);
  }
};

router.get('/student/homework', authenticateToken, resolveStudent, async (req: any, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query param is required' });
    }
    const list = await learningService.listHomeworkForStudent(req.tenantId!, req.studentId, academicYearId);
    res.json({
      statusCode: 200,
      message: 'Student homework tasks retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

router.get('/student/assignments', authenticateToken, resolveStudent, async (req: any, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query param is required' });
    }
    const list = await learningService.listAssignmentsForStudent(req.tenantId!, req.studentId, academicYearId);
    res.json({
      statusCode: 200,
      message: 'Student assignments list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

router.get('/student/assignments/:id', authenticateToken, resolveStudent, async (req: any, res, next) => {
  try {
    const assign = await learningService.getAssignment(req.tenantId!, req.params.id);
    const existing = await prisma.assignmentSubmission.findUnique({
      where: {
        tenantId_assignmentId_studentId: {
          tenantId: req.tenantId!,
          assignmentId: req.params.id,
          studentId: req.studentId
        }
      },
      include: { grade: true }
    });
    res.json({
      statusCode: 200,
      message: 'Assignment detail retrieved',
      data: { assignment: assign, submission: existing || null }
    });
  } catch (error) {
    next(error);
  }
});

const submitAssignmentSchema = z.object({
  textResponse: z.string().optional(),
  attachmentUrl: z.string().optional(),
  academicYearId: z.string().min(1)
});

router.post('/student/assignments/:id/submission', authenticateToken, resolveStudent, validateBody(submitAssignmentSchema), async (req: any, res, next) => {
  try {
    const submission = await learningService.submitAssignment(
      req.tenantId!,
      req.studentId,
      req.params.id,
      req.body,
      req.body.academicYearId
    );
    res.json({
      statusCode: 200,
      message: 'Assignment submission uploaded successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
});

router.get('/student/study-materials', authenticateToken, resolveStudent, async (req: any, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query param is required' });
    }
    const list = await learningService.listStudyMaterialsForStudent(req.tenantId!, req.studentId, academicYearId);
    res.json({
      statusCode: 200,
      message: 'Student study materials list retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// GUARDIAN OPERATION ROUTES
// ==========================================

const checkGuardianChildLink = async (req: any, res: any, next: any) => {
  try {
    const studentId = req.params.studentId;
    const guardian = await prisma.guardian.findFirst({
      where: { userId: req.user!.id, tenantId: req.tenantId! }
    });
    if (!guardian) {
      return next(new AppError(403, 'Guardian profile not found'));
    }

    // Verify relation exists in StudentGuardian model
    const link = await prisma.studentGuardian.findFirst({
      where: { tenantId: req.tenantId!, guardianId: guardian.id, studentId }
    });

    if (!link) {
      return next(new AppError(403, 'Unauthorized. Student profile is not linked to your guardian account.'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

router.get('/guardian/children/:studentId/homework', authenticateToken, checkGuardianChildLink, async (req: any, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query param is required' });
    }
    const list = await learningService.listHomeworkForStudent(req.tenantId!, req.params.studentId, academicYearId);
    res.json({
      statusCode: 200,
      message: 'Child homework details retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

router.get('/guardian/children/:studentId/assignments', authenticateToken, checkGuardianChildLink, async (req: any, res, next) => {
  try {
    const academicYearId = req.query.academicYearId as string;
    if (!academicYearId) {
      return res.status(400).json({ statusCode: 400, message: 'academicYearId query param is required' });
    }
    const list = await learningService.listAssignmentsForStudent(req.tenantId!, req.params.studentId, academicYearId);
    res.json({
      statusCode: 200,
      message: 'Child assignments details retrieved',
      data: list
    });
  } catch (error) {
    next(error);
  }
});

export default router;
