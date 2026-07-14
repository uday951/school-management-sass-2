import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { 
  AcademicTermType,
  ExamCycleStatus,
  ExamType,
  ExamStatus,
  ResultStatus,
  GradingMode,
  AssessmentComponentType,
  GradeScaleBasis,
  EntryStatus,
  SpecialStatus,
  CorrectionStatus,
  SubjectResultStatus,
  OverallResultStatus,
  ReportCardTemplateStatus,
  Status,
  Prisma
} from '@prisma/client';

export const examsService = {
  // ==========================================
  // A. ACADEMIC TERMS
  // ==========================================
  async listAcademicTerms(tenantId: string, schoolId: string, academicYearId: string) {
    return prisma.academicTerm.findMany({
      where: { tenantId, schoolId, academicYearId, archivedAt: null },
      orderBy: { sortOrder: 'asc' }
    });
  },

  async createAcademicTerm(
    tenantId: string,
    schoolId: string,
    data: {
      academicYearId: string;
      name: string;
      code?: string;
      termType: AcademicTermType;
      startDate: string;
      endDate: string;
      sortOrder?: number;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    // Validate Academic Year
    const ay = await prisma.academicYear.findFirst({
      where: { id: data.academicYearId, tenantId, schoolId }
    });
    if (!ay) throw new AppError(404, 'Academic year not found');

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) throw new AppError(400, 'Start date must be before or equal to end date');

    const term = await prisma.academicTerm.create({
      data: {
        tenantId,
        schoolId,
        academicYearId: data.academicYearId,
        name: data.name,
        code: data.code,
        termType: data.termType,
        startDate: start,
        endDate: end,
        sortOrder: data.sortOrder || 0,
        status: Status.ACTIVE
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ACADEMIC_TERM_CREATE',
      entityType: 'AcademicTerm',
      entityId: term.id,
      newValues: term
    });

    return term;
  },

  async updateAcademicTerm(
    tenantId: string,
    schoolId: string,
    id: string,
    data: {
      name?: string;
      code?: string;
      termType?: AcademicTermType;
      startDate?: string;
      endDate?: string;
      sortOrder?: number;
      status?: Status;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.academicTerm.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!existing) throw new AppError(404, 'Academic term not found');

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    if (updateData.startDate && updateData.endDate && updateData.startDate > updateData.endDate) {
      throw new AppError(400, 'Start date must be before or equal to end date');
    }

    const term = await prisma.academicTerm.update({
      where: { id },
      data: updateData
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ACADEMIC_TERM_UPDATE',
      entityType: 'AcademicTerm',
      entityId: term.id,
      oldValues: existing,
      newValues: term
    });

    return term;
  },

  // ==========================================
  // B. EXAM CYCLES
  // ==========================================
  async listExamCycles(tenantId: string, schoolId: string, academicYearId: string) {
    return prisma.examCycle.findMany({
      where: { tenantId, schoolId, academicYearId },
      include: { academicTerm: true }
    });
  },

  async createExamCycle(
    tenantId: string,
    schoolId: string,
    data: {
      academicYearId: string;
      academicTermId?: string;
      name: string;
      code?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    // Validate Academic Year
    const ay = await prisma.academicYear.findFirst({
      where: { id: data.academicYearId, tenantId, schoolId }
    });
    if (!ay) throw new AppError(404, 'Academic year not found');

    if (data.academicTermId) {
      const term = await prisma.academicTerm.findFirst({
        where: { id: data.academicTermId, tenantId, schoolId }
      });
      if (!term) throw new AppError(404, 'Academic term not found');
    }

    const start = data.startDate ? new Date(data.startDate) : null;
    const end = data.endDate ? new Date(data.endDate) : null;
    if (start && end && start > end) {
      throw new AppError(400, 'Start date must be before or equal to end date');
    }

    const cycle = await prisma.examCycle.create({
      data: {
        tenantId,
        schoolId,
        academicYearId: data.academicYearId,
        academicTermId: data.academicTermId || null,
        name: data.name,
        code: data.code,
        description: data.description,
        startDate: start,
        endDate: end,
        status: ExamCycleStatus.DRAFT
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_CYCLE_CREATE',
      entityType: 'ExamCycle',
      entityId: cycle.id,
      newValues: cycle
    });

    return cycle;
  },

  async updateExamCycle(
    tenantId: string,
    schoolId: string,
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      status?: ExamCycleStatus;
      startDate?: string;
      endDate?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.examCycle.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!existing) throw new AppError(404, 'Exam cycle not found');

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    if (updateData.startDate && updateData.endDate && updateData.startDate > updateData.endDate) {
      throw new AppError(400, 'Start date must be before or equal to end date');
    }

    const cycle = await prisma.examCycle.update({
      where: { id },
      data: updateData
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_CYCLE_UPDATE',
      entityType: 'ExamCycle',
      entityId: cycle.id,
      oldValues: existing,
      newValues: cycle
    });

    return cycle;
  },

  // ==========================================
  // C. EXAMS
  // ==========================================
  async listExams(tenantId: string, schoolId: string, academicYearId: string) {
    return prisma.exam.findMany({
      where: { tenantId, schoolId, academicYearId, archivedAt: null },
      include: {
        academicTerm: true,
        examCycle: true,
        targets: {
          include: {
            class: true,
            section: true
          }
        },
        subjects: {
          include: {
            subject: true,
            components: true
          }
        }
      }
    });
  },

  async getExamDetails(tenantId: string, schoolId: string, id: string) {
    const exam = await prisma.exam.findFirst({
      where: { id, tenantId, schoolId, archivedAt: null },
      include: {
        academicTerm: true,
        examCycle: true,
        targets: {
          include: {
            class: true,
            section: true
          }
        },
        subjects: {
          include: {
            subject: true,
            components: true
          }
        }
      }
    });
    if (!exam) throw new AppError(404, 'Exam not found');
    return exam;
  },

  async createExam(
    tenantId: string,
    schoolId: string,
    data: {
      academicYearId: string;
      academicTermId?: string;
      examCycleId?: string;
      name: string;
      code?: string;
      description?: string;
      examType: ExamType;
      startDate?: string;
      endDate?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const ay = await prisma.academicYear.findFirst({
      where: { id: data.academicYearId, tenantId, schoolId }
    });
    if (!ay) throw new AppError(404, 'Academic year not found');

    if (data.academicTermId) {
      const term = await prisma.academicTerm.findFirst({
        where: { id: data.academicTermId, tenantId, schoolId }
      });
      if (!term) throw new AppError(404, 'Academic term not found');
    }

    if (data.examCycleId) {
      const cycle = await prisma.examCycle.findFirst({
        where: { id: data.examCycleId, tenantId, schoolId }
      });
      if (!cycle) throw new AppError(404, 'Exam cycle not found');
    }

    const start = data.startDate ? new Date(data.startDate) : null;
    const end = data.endDate ? new Date(data.endDate) : null;
    if (start && end && start > end) {
      throw new AppError(400, 'Start date must be before or equal to end date');
    }

    const exam = await prisma.exam.create({
      data: {
        tenantId,
        schoolId,
        academicYearId: data.academicYearId,
        academicTermId: data.academicTermId || null,
        examCycleId: data.examCycleId || null,
        name: data.name,
        code: data.code,
        description: data.description,
        examType: data.examType,
        status: ExamStatus.DRAFT,
        startDate: start,
        endDate: end,
        resultStatus: ResultStatus.NOT_CALCULATED,
        archivedAt: null,
        createdByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_CREATE',
      entityType: 'Exam',
      entityId: exam.id,
      newValues: exam
    });

    return exam;
  },

  async updateExam(
    tenantId: string,
    schoolId: string,
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      examType?: ExamType;
      status?: ExamStatus;
      startDate?: string;
      endDate?: string;
      resultStatus?: ResultStatus;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.exam.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!existing) throw new AppError(404, 'Exam not found');

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    if (updateData.startDate && updateData.endDate && updateData.startDate > updateData.endDate) {
      throw new AppError(400, 'Start date must be before or equal to end date');
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_UPDATE',
      entityType: 'Exam',
      entityId: exam.id,
      oldValues: existing,
      newValues: exam
    });

    return exam;
  },

  async archiveExam(tenantId: string, schoolId: string, id: string, actorUserId: string, actorEmail: string) {
    const existing = await prisma.exam.findFirst({
      where: { id, tenantId, schoolId }
    });
    if (!existing) throw new AppError(404, 'Exam not found');

    await prisma.exam.update({
      where: { id },
      data: { archivedAt: new Date(), status: ExamStatus.ARCHIVED }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_ARCHIVE',
      entityType: 'Exam',
      entityId: id
    });
  },

  // ==========================================
  // D. EXAM TARGETS
  // ==========================================
  async setExamTargets(
    tenantId: string,
    schoolId: string,
    examId: string,
    targets: { classId: string; sectionId?: string | null }[],
    actorUserId: string,
    actorEmail: string
  ) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, tenantId, schoolId }
    });
    if (!exam) throw new AppError(404, 'Exam not found');

    // Validate classes and sections belong to tenant/school
    for (const target of targets) {
      const cls = await prisma.gradeLevel.findFirst({
        where: { id: target.classId, tenantId, schoolId }
      });
      if (!cls) throw new AppError(400, `Class ID ${target.classId} not found under tenant/school`);

      if (target.sectionId) {
        const sec = await prisma.section.findFirst({
          where: { id: target.sectionId, gradeLevelId: target.classId, tenantId, schoolId }
        });
        if (!sec) throw new AppError(400, `Section ID ${target.sectionId} does not belong to Class ${target.classId}`);
      }
    }

    // Transaction to replace targets
    const oldTargets = await prisma.examTarget.findMany({ where: { tenantId, examId } });

    await prisma.$transaction([
      prisma.examTarget.deleteMany({ where: { tenantId, examId } }),
      prisma.examTarget.createMany({
        data: targets.map(t => ({
          tenantId,
          examId,
          classId: t.classId,
          sectionId: t.sectionId || null
        }))
      })
    ]);

    const newTargets = await prisma.examTarget.findMany({ where: { tenantId, examId } });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_TARGETS_SET',
      entityType: 'Exam',
      entityId: examId,
      oldValues: oldTargets,
      newValues: newTargets
    });

    return newTargets;
  },

  // ==========================================
  // E. EXAM SUBJECTS & COMPONENTS
  // ==========================================
  async listExamSubjects(tenantId: string, examId: string) {
    return prisma.examSubject.findMany({
      where: { tenantId, examId },
      include: {
        class: true,
        subject: true,
        components: true
      }
    });
  },

  async addExamSubject(
    tenantId: string,
    schoolId: string,
    data: {
      examId: string;
      classId: string;
      subjectId: string;
      maximumMarks: number;
      passMarks: number;
      weightage?: number;
      gradingMode: GradingMode;
      isOptional?: boolean;
      sortOrder?: number;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const exam = await prisma.exam.findFirst({
      where: { id: data.examId, tenantId, schoolId }
    });
    if (!exam) throw new AppError(404, 'Exam not found');

    const cls = await prisma.gradeLevel.findFirst({
      where: { id: data.classId, tenantId, schoolId }
    });
    if (!cls) throw new AppError(404, 'Class not found');

    const sub = await prisma.subject.findFirst({
      where: { id: data.subjectId, tenantId, schoolId }
    });
    if (!sub) throw new AppError(404, 'Subject not found');

    if (data.maximumMarks <= 0) throw new AppError(400, 'Maximum marks must be greater than 0');
    if (data.passMarks < 0 || data.passMarks > data.maximumMarks) {
      throw new AppError(400, 'Pass marks must be between 0 and maximum marks');
    }

    const examSubject = await prisma.examSubject.create({
      data: {
        tenantId,
        examId: data.examId,
        classId: data.classId,
        subjectId: data.subjectId,
        maximumMarks: data.maximumMarks,
        passMarks: data.passMarks,
        weightage: data.weightage || null,
        gradingMode: data.gradingMode,
        isOptional: data.isOptional || false,
        sortOrder: data.sortOrder || 0
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_SUBJECT_ADD',
      entityType: 'ExamSubject',
      entityId: examSubject.id,
      newValues: examSubject
    });

    return examSubject;
  },

  async updateExamSubject(
    tenantId: string,
    schoolId: string,
    id: string,
    data: {
      maximumMarks?: number;
      passMarks?: number;
      weightage?: number;
      gradingMode?: GradingMode;
      isOptional?: boolean;
      sortOrder?: number;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.examSubject.findFirst({
      where: { id, tenantId }
    });
    if (!existing) throw new AppError(404, 'Exam subject not found');

    const max = data.maximumMarks !== undefined ? data.maximumMarks : existing.maximumMarks;
    const pass = data.passMarks !== undefined ? data.passMarks : existing.passMarks;

    if (max <= 0) throw new AppError(400, 'Maximum marks must be greater than 0');
    if (pass < 0 || pass > max) {
      throw new AppError(400, 'Pass marks must be between 0 and maximum marks');
    }

    // If components exist, validate their sum does not exceed maximumMarks
    const components = await prisma.assessmentComponent.findMany({
      where: { tenantId, examSubjectId: id }
    });
    const componentsSum = components.reduce((sum, c) => sum + c.maximumMarks, 0);
    if (components.length > 0 && componentsSum !== max) {
      throw new AppError(400, `The sum of assessment components (${componentsSum}) does not match the new maximum marks (${max})`);
    }

    const updated = await prisma.examSubject.update({
      where: { id },
      data: {
        maximumMarks: max,
        passMarks: pass,
        weightage: data.weightage !== undefined ? data.weightage : existing.weightage,
        gradingMode: data.gradingMode !== undefined ? data.gradingMode : existing.gradingMode,
        isOptional: data.isOptional !== undefined ? data.isOptional : existing.isOptional,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_SUBJECT_UPDATE',
      entityType: 'ExamSubject',
      entityId: id,
      oldValues: existing,
      newValues: updated
    });

    return updated;
  },

  async deleteExamSubject(tenantId: string, schoolId: string, id: string, actorUserId: string, actorEmail: string) {
    const existing = await prisma.examSubject.findFirst({
      where: { id, tenantId }
    });
    if (!existing) throw new AppError(404, 'Exam subject not found');

    await prisma.examSubject.delete({ where: { id } });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_SUBJECT_DELETE',
      entityType: 'ExamSubject',
      entityId: id
    });
  },

  async setAssessmentComponents(
    tenantId: string,
    schoolId: string,
    examSubjectId: string,
    components: {
      name: string;
      code?: string;
      componentType: AssessmentComponentType;
      maximumMarks: number;
      passMarks?: number;
      weightage?: number;
      sortOrder?: number;
      isRequired?: boolean;
    }[],
    actorUserId: string,
    actorEmail: string
  ) {
    const examSubject = await prisma.examSubject.findFirst({
      where: { id: examSubjectId, tenantId }
    });
    if (!examSubject) throw new AppError(404, 'Exam subject not found');

    // Validate sum of components max marks equals examSubject max marks
    const sum = components.reduce((s, c) => s + c.maximumMarks, 0);
    if (sum !== examSubject.maximumMarks) {
      throw new AppError(400, `The sum of component maximum marks (${sum}) must exactly equal the subject maximum marks (${examSubject.maximumMarks})`);
    }

    const oldComponents = await prisma.assessmentComponent.findMany({
      where: { tenantId, examSubjectId }
    });

    await prisma.$transaction([
      prisma.assessmentComponent.deleteMany({ where: { tenantId, examSubjectId } }),
      prisma.assessmentComponent.createMany({
        data: components.map(c => ({
          tenantId,
          examSubjectId,
          name: c.name,
          code: c.code || null,
          componentType: c.componentType,
          maximumMarks: c.maximumMarks,
          passMarks: c.passMarks || null,
          weightage: c.weightage || null,
          sortOrder: c.sortOrder || 0,
          isRequired: c.isRequired !== undefined ? c.isRequired : true
        }))
      })
    ]);

    const newComponents = await prisma.assessmentComponent.findMany({
      where: { tenantId, examSubjectId }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ASSESSMENT_COMPONENTS_SET',
      entityType: 'ExamSubject',
      entityId: examSubjectId,
      oldValues: oldComponents,
      newValues: newComponents
    });

    return newComponents;
  },

  // ==========================================
  // F. GRADE SCALES
  // ==========================================
  async listGradeScales(tenantId: string) {
    return prisma.gradeScale.findMany({
      where: { tenantId },
      include: { boundaries: { orderBy: { sortOrder: 'asc' } } }
    });
  },

  async createGradeScale(
    tenantId: string,
    schoolId: string,
    data: {
      name: string;
      description?: string;
      calculationBasis: GradeScaleBasis;
      isDefault?: boolean;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    if (data.isDefault) {
      // Remove isDefault from other scales under this tenant
      await prisma.gradeScale.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const scale = await prisma.gradeScale.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        calculationBasis: data.calculationBasis,
        isDefault: data.isDefault || false,
        status: Status.ACTIVE
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GRADE_SCALE_CREATE',
      entityType: 'GradeScale',
      entityId: scale.id,
      newValues: scale
    });

    return scale;
  },

  async updateGradeScale(
    tenantId: string,
    schoolId: string,
    id: string,
    data: {
      name?: string;
      description?: string;
      calculationBasis?: GradeScaleBasis;
      isDefault?: boolean;
      status?: Status;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.gradeScale.findFirst({
      where: { id, tenantId }
    });
    if (!existing) throw new AppError(404, 'Grade scale not found');

    if (data.isDefault) {
      await prisma.gradeScale.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.gradeScale.update({
      where: { id },
      data: data
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GRADE_SCALE_UPDATE',
      entityType: 'GradeScale',
      entityId: id,
      oldValues: existing,
      newValues: updated
    });

    return updated;
  },

  async deleteGradeScale(tenantId: string, schoolId: string, id: string, actorUserId: string, actorEmail: string) {
    const existing = await prisma.gradeScale.findFirst({
      where: { id, tenantId }
    });
    if (!existing) throw new AppError(404, 'Grade scale not found');

    await prisma.gradeScale.delete({ where: { id } });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GRADE_SCALE_DELETE',
      entityType: 'GradeScale',
      entityId: id
    });
  },

  async setGradeBoundaries(
    tenantId: string,
    schoolId: string,
    gradeScaleId: string,
    boundaries: {
      grade: string;
      minimumValue: number;
      maximumValue: number;
      gradePoint?: number;
      description?: string;
      sortOrder?: number;
    }[],
    actorUserId: string,
    actorEmail: string
  ) {
    const scale = await prisma.gradeScale.findFirst({
      where: { id: gradeScaleId, tenantId }
    });
    if (!scale) throw new AppError(404, 'Grade scale not found');

    // Validation: no overlapping ranges and min <= max
    for (let i = 0; i < boundaries.length; i++) {
      const b1 = boundaries[i];
      if (b1.minimumValue > b1.maximumValue) {
        throw new AppError(400, `Grade ${b1.grade} has minimum value (${b1.minimumValue}) greater than maximum value (${b1.maximumValue})`);
      }

      for (let j = i + 1; j < boundaries.length; j++) {
        const b2 = boundaries[j];
        // Overlap condition: b1 starts before b2 ends, and b2 starts before b1 ends
        if (b1.minimumValue < b2.maximumValue && b2.minimumValue < b1.maximumValue) {
          throw new AppError(400, `Overlapping grade ranges detected between grade ${b1.grade} and ${b2.grade}`);
        }
      }
    }

    const oldBoundaries = await prisma.gradeBoundary.findMany({
      where: { tenantId, gradeScaleId }
    });

    await prisma.$transaction([
      prisma.gradeBoundary.deleteMany({ where: { tenantId, gradeScaleId } }),
      prisma.gradeBoundary.createMany({
        data: boundaries.map(b => ({
          tenantId,
          gradeScaleId,
          grade: b.grade,
          minimumValue: b.minimumValue,
          maximumValue: b.maximumValue,
          gradePoint: b.gradePoint || null,
          description: b.description || null,
          sortOrder: b.sortOrder || 0
        }))
      })
    ]);

    const newBoundaries = await prisma.gradeBoundary.findMany({
      where: { tenantId, gradeScaleId }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GRADE_BOUNDARIES_SET',
      entityType: 'GradeScale',
      entityId: gradeScaleId,
      oldValues: oldBoundaries,
      newValues: newBoundaries
    });

    return newBoundaries;
  },

  // ==========================================
  // G. TEACHER MARKS ENTRY & SUBMISSION
  // ==========================================
  async getTeacherMarksContexts(tenantId: string, schoolId: string, employeeUserId: string) {
    // Resolve employee
    const emp = await prisma.employee.findFirst({
      where: { userId: employeeUserId, tenantId, schoolId }
    });
    if (!emp) throw new AppError(404, 'Employee profile not found');

    // Find active teacher assignments
    const assignments = await prisma.teacherAssignment.findMany({
      where: { employeeId: emp.id, tenantId, schoolId, status: Status.ACTIVE },
      include: {
        gradeLevel: true,
        section: true,
        subject: true
      }
    });

    // For these assignments, find eligible ExamSubjects
    const classIds = Array.from(new Set(assignments.map(a => a.gradeLevelId)));
    const subjectIds = Array.from(new Set(assignments.map(a => a.subjectId)));

    const examSubjects = await prisma.examSubject.findMany({
      where: {
        tenantId,
        classId: { in: classIds },
        subjectId: { in: subjectIds },
        exam: { status: { in: [ExamStatus.MARKS_ENTRY_OPEN, ExamStatus.SCHEDULED] }, archivedAt: null }
      },
      include: {
        exam: true,
        class: true,
        subject: true,
        components: true
      }
    });

    // Map each assignment to eligible exams
    return assignments.map(a => {
      const eligibleExams = examSubjects.filter(
        es => es.classId === a.gradeLevelId && es.subjectId === a.subjectId
      );
      return {
        assignmentId: a.id,
        class: a.gradeLevel,
        section: a.section,
        subject: a.subject,
        eligibleExams: eligibleExams.map(es => ({
          examId: es.exam.id,
          examName: es.exam.name,
          examStatus: es.exam.status,
          examSubjectId: es.id,
          maximumMarks: es.maximumMarks,
          passMarks: es.passMarks,
          gradingMode: es.gradingMode,
          components: es.components
        }))
      };
    }).filter(ctx => ctx.eligibleExams.length > 0);
  },

  async getMarksRoster(
    tenantId: string,
    schoolId: string,
    examSubjectId: string,
    sectionId: string,
    employeeUserId?: string
  ) {
    // 1. Resolve ExamSubject
    const es = await prisma.examSubject.findFirst({
      where: { id: examSubjectId, tenantId },
      include: { exam: true, components: true }
    });
    if (!es) throw new AppError(404, 'Exam subject configuration not found');

    // 2. Enforce Teacher Authorization if employeeUserId is provided
    if (employeeUserId) {
      const emp = await prisma.employee.findFirst({
        where: { userId: employeeUserId, tenantId, schoolId }
      });
      if (!emp) throw new AppError(403, 'Access denied: not an active employee');

      // Verify assignment to this class-subject-section
      const assignment = await prisma.teacherAssignment.findFirst({
        where: {
          employeeId: emp.id,
          tenantId,
          schoolId,
          gradeLevelId: es.classId,
          sectionId,
          subjectId: es.subjectId,
          status: Status.ACTIVE
        }
      });
      if (!assignment) {
        throw new AppError(403, 'Access denied: you are not assigned to this subject/section context');
      }
    }

    // 3. Find active student enrollments for this class and section in this academic year
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        tenantId,
        schoolId,
        academicYearId: es.exam.academicYearId,
        gradeLevelId: es.classId,
        sectionId,
        status: 'ACTIVE'
      },
      include: {
        student: true
      },
      orderBy: { rollNumber: 'asc' }
    });

    // 4. Fetch existing marks entries
    const existingEntries = await prisma.marksEntry.findMany({
      where: { tenantId, examId: es.examId, examSubjectId }
    });

    // 5. Fetch submission status
    const submission = await prisma.marksSubmission.findFirst({
      where: { tenantId, examId: es.examId, examSubjectId, classId: es.classId, sectionId }
    });

    // Map roster students with their component-wise marks
    const roster = enrollments.map(e => {
      const studentMarks = es.components.length > 0 
        ? es.components.map(comp => {
            const entry = existingEntries.find(
              ex => ex.studentId === e.studentId && ex.assessmentComponentId === comp.id
            );
            return {
              componentId: comp.id,
              componentName: comp.name,
              maximumMarks: comp.maximumMarks,
              marksObtained: entry?.marksObtained || null,
              specialStatus: entry?.specialStatus || null,
              remarks: entry?.remarks || null,
              entryStatus: entry?.entryStatus || 'DRAFT'
            };
          })
        : [
            (() => {
              const entry = existingEntries.find(
                ex => ex.studentId === e.studentId && ex.assessmentComponentId === null
              );
              return {
                componentId: null,
                componentName: 'Subject Marks',
                maximumMarks: es.maximumMarks,
                marksObtained: entry?.marksObtained || null,
                specialStatus: entry?.specialStatus || null,
                remarks: entry?.remarks || null,
                entryStatus: entry?.entryStatus || 'DRAFT'
              };
            })()
          ];

      return {
        studentId: e.studentId,
        studentName: `${e.student.firstName} ${e.student.lastName}`,
        admissionNumber: e.student.admissionNumber,
        rollNumber: e.rollNumber,
        enrollmentId: e.id,
        marks: studentMarks
      };
    });

    return {
      exam: es.exam,
      examSubject: {
        id: es.id,
        maximumMarks: es.maximumMarks,
        passMarks: es.passMarks,
        gradingMode: es.gradingMode,
        components: es.components
      },
      submissionStatus: submission?.status || 'DRAFT',
      isLocked: submission?.status === 'LOCKED',
      roster
    };
  },

  async saveMarksDraft(
    tenantId: string,
    schoolId: string,
    data: {
      examSubjectId: string;
      sectionId: string;
      entries: {
        studentId: string;
        enrollmentId: string;
        componentId?: string | null;
        marksObtained?: number | null;
        specialStatus?: SpecialStatus | null;
        remarks?: string | null;
      }[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    // 1. Resolve ExamSubject details
    const es = await prisma.examSubject.findFirst({
      where: { id: data.examSubjectId, tenantId },
      include: { exam: true, components: true }
    });
    if (!es) throw new AppError(404, 'Exam subject not found');

    // 2. Check if Marks Entry is open
    if (es.exam.status === ExamStatus.MARKS_ENTRY_CLOSED || es.exam.status === ExamStatus.COMPLETED) {
      throw new AppError(400, 'Marks entry is closed for this exam');
    }

    // 3. Verify if submission is locked
    const submission = await prisma.marksSubmission.findFirst({
      where: { tenantId, examId: es.examId, examSubjectId: data.examSubjectId, classId: es.classId, sectionId: data.sectionId }
    });
    if (submission && submission.status === 'LOCKED') {
      throw new AppError(400, 'Marks context is locked and cannot be edited without correction approval');
    }

    // 4. Save each entry in database
    for (const entry of data.entries) {
      // Validate marksObtained does not exceed maximum
      const compMax = entry.componentId 
        ? es.components.find(c => c.id === entry.componentId)?.maximumMarks 
        : es.maximumMarks;

      if (compMax === undefined) throw new AppError(400, 'Invalid assessment component ID');

      if (entry.marksObtained !== undefined && entry.marksObtained !== null) {
        if (entry.marksObtained < 0 || entry.marksObtained > compMax) {
          throw new AppError(400, `Marks obtained (${entry.marksObtained}) must be between 0 and component max marks (${compMax})`);
        }
      }

      const queryParams = {
        tenantId,
        examId: es.examId,
        examSubjectId: data.examSubjectId,
        assessmentComponentId: entry.componentId || null,
        studentId: entry.studentId
      };

      await prisma.marksEntry.upsert({
        where: {
          tenantId_examId_examSubjectId_assessmentComponentId_studentId: queryParams as any
        },
        create: {
          ...queryParams,
          studentEnrollmentId: entry.enrollmentId,
          marksObtained: entry.marksObtained || null,
          specialStatus: entry.specialStatus || null,
          remarks: entry.remarks || null,
          entryStatus: EntryStatus.DRAFT,
          enteredByUserId: actorUserId
        },
        update: {
          marksObtained: entry.marksObtained !== undefined ? entry.marksObtained : null,
          specialStatus: entry.specialStatus || null,
          remarks: entry.remarks || null,
          entryStatus: EntryStatus.DRAFT,
          enteredByUserId: actorUserId
        }
      });
    }

    // Create/update submission row in draft state
    if (!submission) {
      await prisma.marksSubmission.create({
        data: {
          tenantId,
          examId: es.examId,
          examSubjectId: data.examSubjectId,
          classId: es.classId,
          sectionId: data.sectionId,
          status: EntryStatus.DRAFT
        }
      });
    } else {
      await prisma.marksSubmission.update({
        where: { id: submission.id },
        data: { status: EntryStatus.DRAFT }
      });
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'MARKS_SAVE_DRAFT',
      entityType: 'ExamSubject',
      entityId: data.examSubjectId,
      metadata: { sectionId: data.sectionId, entriesCount: data.entries.length }
    });
  },

  async submitMarks(
    tenantId: string,
    schoolId: string,
    examSubjectId: string,
    sectionId: string,
    actorUserId: string,
    actorEmail: string
  ) {
    const es = await prisma.examSubject.findFirst({
      where: { id: examSubjectId, tenantId },
      include: { exam: true, components: true }
    });
    if (!es) throw new AppError(404, 'Exam subject not found');

    const submission = await prisma.marksSubmission.findFirst({
      where: { tenantId, examId: es.examId, examSubjectId, classId: es.classId, sectionId }
    });
    if (!submission) throw new AppError(404, 'Marks draft entry not found');
    if (submission.status === 'LOCKED') throw new AppError(400, 'Marks already locked');

    // Update all entries to SUBMITTED
    await prisma.marksEntry.updateMany({
      where: { tenantId, examId: es.examId, examSubjectId },
      data: { entryStatus: EntryStatus.SUBMITTED }
    });

    await prisma.marksSubmission.update({
      where: { id: submission.id },
      data: {
        status: EntryStatus.SUBMITTED,
        submittedByUserId: actorUserId,
        submittedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'MARKS_SUBMIT',
      entityType: 'ExamSubject',
      entityId: examSubjectId,
      metadata: { sectionId }
    });
  },

  // ==========================================
  // H. ADMIN LOCK / REOPEN MARKS
  // ==========================================
  async lockMarks(
    tenantId: string,
    schoolId: string,
    submissionId: string,
    actorUserId: string,
    actorEmail: string
  ) {
    const submission = await prisma.marksSubmission.findFirst({
      where: { id: submissionId, tenantId }
    });
    if (!submission) throw new AppError(404, 'Marks submission context not found');

    await prisma.marksEntry.updateMany({
      where: { tenantId, examId: submission.examId, examSubjectId: submission.examSubjectId },
      data: { entryStatus: EntryStatus.LOCKED }
    });

    await prisma.marksSubmission.update({
      where: { id: submissionId },
      data: {
        status: EntryStatus.LOCKED,
        lockedAt: new Date(),
        lockedByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'MARKS_LOCK',
      entityType: 'MarksSubmission',
      entityId: submissionId
    });
  },

  async reopenMarks(
    tenantId: string,
    schoolId: string,
    submissionId: string,
    actorUserId: string,
    actorEmail: string
  ) {
    const submission = await prisma.marksSubmission.findFirst({
      where: { id: submissionId, tenantId }
    });
    if (!submission) throw new AppError(404, 'Marks submission context not found');

    await prisma.marksEntry.updateMany({
      where: { tenantId, examId: submission.examId, examSubjectId: submission.examSubjectId },
      data: { entryStatus: EntryStatus.REOPENED }
    });

    await prisma.marksSubmission.update({
      where: { id: submissionId },
      data: {
        status: EntryStatus.REOPENED
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'MARKS_REOPEN',
      entityType: 'MarksSubmission',
      entityId: submissionId
    });
  },

  async getMarksSubmissionsStatus(tenantId: string, schoolId: string, examId: string) {
    return prisma.marksSubmission.findMany({
      where: { tenantId, examId },
      include: {
        examSubject: { include: { subject: true } },
        class: true,
        section: true
      }
    });
  },

  // ==========================================
  // I. CORRECTIONS WORKFLOW
  // ==========================================
  async requestMarksCorrection(
    tenantId: string,
    schoolId: string,
    data: {
      examId: string;
      marksEntryId: string;
      requestedValue?: number | null;
      reason: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const entry = await prisma.marksEntry.findFirst({
      where: { id: data.marksEntryId, tenantId, examId: data.examId }
    });
    if (!entry) throw new AppError(404, 'Marks entry not found');

    // Create request
    const request = await prisma.marksCorrectionRequest.create({
      data: {
        tenantId,
        examId: data.examId,
        marksEntryId: data.marksEntryId,
        requestedByUserId: actorUserId,
        oldValue: entry.marksObtained,
        requestedValue: data.requestedValue !== undefined ? data.requestedValue : null,
        reason: data.reason,
        status: CorrectionStatus.PENDING
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'MARKS_CORRECTION_REQUEST',
      entityType: 'MarksCorrectionRequest',
      entityId: request.id,
      newValues: request
    });

    return request;
  },

  async listCorrectionRequests(tenantId: string, schoolId: string, examId?: string) {
    const whereClause: any = { tenantId };
    if (examId) whereClause.examId = examId;

    return prisma.marksCorrectionRequest.findMany({
      where: whereClause,
      include: {
        exam: true,
        marksEntry: {
          include: {
            student: true,
            examSubject: { include: { subject: true } },
            assessmentComponent: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async approveCorrectionRequest(
    tenantId: string,
    schoolId: string,
    id: string,
    reviewComment: string,
    actorUserId: string,
    actorEmail: string
  ) {
    const request = await prisma.marksCorrectionRequest.findFirst({
      where: { id, tenantId, status: CorrectionStatus.PENDING }
    });
    if (!request) throw new AppError(404, 'Pending correction request not found');

    // 1. Update MarksEntry value
    await prisma.marksEntry.update({
      where: { id: request.marksEntryId },
      data: {
        marksObtained: request.requestedValue
      }
    });

    // 2. Update status of request
    const updated = await prisma.marksCorrectionRequest.update({
      where: { id },
      data: {
        status: CorrectionStatus.APPROVED,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date(),
        reviewComment
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'MARKS_CORRECTION_APPROVE',
      entityType: 'MarksCorrectionRequest',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  async rejectCorrectionRequest(
    tenantId: string,
    schoolId: string,
    id: string,
    reviewComment: string,
    actorUserId: string,
    actorEmail: string
  ) {
    const request = await prisma.marksCorrectionRequest.findFirst({
      where: { id, tenantId, status: CorrectionStatus.PENDING }
    });
    if (!request) throw new AppError(404, 'Pending correction request not found');

    const updated = await prisma.marksCorrectionRequest.update({
      where: { id },
      data: {
        status: CorrectionStatus.REJECTED,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date(),
        reviewComment
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'MARKS_CORRECTION_REJECT',
      entityType: 'MarksCorrectionRequest',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  // ==========================================
  // J. RESULT CALCULATION ENGINE
  // ==========================================
  async calculateResults(
    tenantId: string,
    schoolId: string,
    examId: string,
    classId: string,
    sectionId: string,
    actorUserId: string,
    actorEmail: string
  ) {
    // 1. Fetch Exam & Targets
    const exam = await prisma.exam.findFirst({
      where: { id: examId, tenantId, schoolId, archivedAt: null },
      include: { subjects: { include: { components: true } } }
    });
    if (!exam) throw new AppError(404, 'Exam not found');

    // 2. Fetch Result Policy (default or create dummy policy)
    let policy = await prisma.resultPolicy.findFirst({ where: { tenantId } });
    if (!policy) {
      policy = await prisma.resultPolicy.create({
        data: {
          tenantId,
          name: 'Default Policy',
          requireAllSubjectsPass: true,
          componentPassRequired: false,
          absentPolicy: 'FAIL',
          roundingMode: 'ROUND_HALF_UP',
          decimalPlaces: 2
        }
      });
    }

    // 3. Fetch default Grade Scale
    const scale = await prisma.gradeScale.findFirst({
      where: { tenantId, isDefault: true },
      include: { boundaries: { orderBy: { sortOrder: 'asc' } } }
    });

    const getGrade = (val: number, basis: GradeScaleBasis): string | null => {
      if (!scale) return null;
      const b = scale.boundaries.find(
        bound => bound.minimumValue <= val && val <= bound.maximumValue
      );
      return b ? b.grade : null;
    };

    // 4. Fetch students roster enrolled in class + section
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        tenantId,
        schoolId,
        academicYearId: exam.academicYearId,
        gradeLevelId: classId,
        sectionId,
        status: 'ACTIVE'
      }
    });

    // 5. Fetch Marks entries
    const marks = await prisma.marksEntry.findMany({
      where: { tenantId, examId }
    });

    // 6. Iterate students and compute subject-wise + overall results
    const resultsComputed: any[] = [];

    for (const enrol of enrollments) {
      let overallObtained = 0;
      let overallMax = 0;
      let overallPass = true;
      let hasAbsent = false;
      const subjectResultsData: any[] = [];

      for (const es of exam.subjects) {
        // Exclude subject calculation if student is not mapped to this optional subject context where needed.
        // For simplicity, we assume they take all targeted subjects unless flagged.
        const esMarks = marks.filter(
          m => m.studentId === enrol.studentId && m.examSubjectId === es.id
        );

        let subjectObtained = 0;
        let isAbsent = false;
        let isExempt = false;
        let isNa = false;

        if (es.components.length > 0) {
          for (const comp of es.components) {
            const entry = esMarks.find(m => m.assessmentComponentId === comp.id);
            if (entry) {
              if (entry.specialStatus === SpecialStatus.ABSENT) isAbsent = true;
              else if (entry.specialStatus === SpecialStatus.EXEMPT) isExempt = true;
              else if (entry.specialStatus === SpecialStatus.NOT_APPLICABLE) isNa = true;
              else subjectObtained += entry.marksObtained || 0;
            } else {
              // Missing component entry
              if (comp.isRequired) overallPass = false;
            }
          }
        } else {
          const entry = esMarks.find(m => m.assessmentComponentId === null);
          if (entry) {
            if (entry.specialStatus === SpecialStatus.ABSENT) isAbsent = true;
            else if (entry.specialStatus === SpecialStatus.EXEMPT) isExempt = true;
            else if (entry.specialStatus === SpecialStatus.NOT_APPLICABLE) isNa = true;
            else subjectObtained = entry.marksObtained || 0;
          }
        }

        const percentage = es.maximumMarks > 0 ? (subjectObtained / es.maximumMarks) * 100 : 0;
        const grade = getGrade(percentage, scale?.calculationBasis || GradeScaleBasis.PERCENTAGE);
        
        let subStatus: SubjectResultStatus = SubjectResultStatus.PASS;
        if (isAbsent) {
          subStatus = SubjectResultStatus.ABSENT;
          hasAbsent = true;
          if (policy.absentPolicy === 'FAIL') overallPass = false;
        } else if (isExempt) {
          subStatus = SubjectResultStatus.EXEMPT;
        } else if (isNa) {
          subStatus = SubjectResultStatus.NOT_APPLICABLE;
        } else {
          const passed = subjectObtained >= es.passMarks;
          if (!passed) {
            subStatus = SubjectResultStatus.FAIL;
            if (!es.isOptional) overallPass = false;
          }
        }

        subjectResultsData.push({
          tenantId,
          examId,
          studentId: enrol.studentId,
          studentEnrollmentId: enrol.id,
          examSubjectId: es.id,
          totalMarksObtained: subjectObtained,
          maximumMarks: es.maximumMarks,
          percentage,
          grade,
          resultStatus: subStatus
        });

        if (!es.isOptional && !isExempt && !isNa) {
          overallObtained += subjectObtained;
          overallMax += es.maximumMarks;
        }
      }

      // Compute Overall Result
      const overallPercentage = overallMax > 0 ? (overallObtained / overallMax) * 100 : 0;
      const overallGrade = getGrade(overallPercentage, scale?.calculationBasis || GradeScaleBasis.PERCENTAGE);

      let overallStatus: OverallResultStatus = OverallResultStatus.PASS;
      if (!overallPass) overallStatus = OverallResultStatus.FAIL;
      else if (hasAbsent) {
        overallStatus = policy.absentPolicy === 'FAIL' ? OverallResultStatus.FAIL : OverallResultStatus.PASS;
      }

      resultsComputed.push({
        studentResult: {
          tenantId,
          examId,
          studentId: enrol.studentId,
          studentEnrollmentId: enrol.id,
          totalMarksObtained: overallObtained,
          totalMaximumMarks: overallMax,
          percentage: overallPercentage,
          overallGrade,
          resultStatus: overallStatus,
          calculationVersion: 'v1',
          calculatedAt: new Date(),
          rank: null as number | null
        },
        subjectResults: subjectResultsData
      });
    }

    // 7. Rankings computation (Dense Rank by default)
    resultsComputed.sort((a, b) => b.studentResult.totalMarksObtained - a.studentResult.totalMarksObtained);
    let rank = 0;
    let prevScore = -1;
    let denseRank = 0;

    for (let i = 0; i < resultsComputed.length; i++) {
      const currentScore = resultsComputed[i].studentResult.totalMarksObtained;
      rank++;
      if (currentScore !== prevScore) {
        denseRank++;
        prevScore = currentScore;
      }
      // Support Competition vs Dense Rank options
      resultsComputed[i].studentResult.rank = denseRank; // Assigning dense rank
    }

    // Write to database in a transaction
    await prisma.$transaction(async (tx) => {
      // Clean previous results
      const studentIds = enrollments.map(e => e.studentId);
      await tx.subjectResult.deleteMany({
        where: { tenantId, examId, studentId: { in: studentIds } }
      });
      await tx.studentResult.deleteMany({
        where: { tenantId, examId, studentId: { in: studentIds } }
      });

      // Write new results
      for (const res of resultsComputed) {
        const sr = await tx.studentResult.create({
          data: res.studentResult
        });

        await tx.subjectResult.createMany({
          data: res.subjectResults
        });
      }
    });

    // Update Exam Result Status
    await prisma.exam.update({
      where: { id: examId },
      data: { resultStatus: ResultStatus.CALCULATED }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'RESULTS_CALCULATE',
      entityType: 'Exam',
      entityId: examId,
      metadata: { classId, sectionId, calculatedCount: resultsComputed.length }
    });

    return resultsComputed;
  },

  async listResults(tenantId: string, examId: string, classId?: string, sectionId?: string) {
    const whereClause: any = { tenantId, examId };
    if (classId) {
      whereClause.studentEnrollment = { gradeLevelId: classId };
    }
    if (sectionId) {
      whereClause.studentEnrollment = { ...whereClause.studentEnrollment, sectionId };
    }

    return prisma.studentResult.findMany({
      where: whereClause,
      include: {
        student: true,
        studentEnrollment: {
          include: { gradeLevel: true, section: true }
        }
      },
      orderBy: { totalMarksObtained: 'desc' }
    });
  },

  async getStudentOverallResult(tenantId: string, examId: string, studentId: string) {
    return prisma.studentResult.findFirst({
      where: { tenantId, examId, studentId },
      include: {
        student: true,
        exam: true
      }
    });
  },

  async getStudentSubjectResults(tenantId: string, examId: string, studentId: string) {
    return prisma.subjectResult.findMany({
      where: { tenantId, examId, studentId },
      include: {
        examSubject: { include: { subject: true } }
      }
    });
  },

  async approveResults(tenantId: string, schoolId: string, examId: string, actorUserId: string, actorEmail: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, tenantId, schoolId }
    });
    if (!exam) throw new AppError(404, 'Exam not found');

    await prisma.exam.update({
      where: { id: examId },
      data: { resultStatus: ResultStatus.APPROVED }
    });

    // Update all calculated student results to approved status where applicable
    await prisma.studentResult.updateMany({
      where: { tenantId, examId },
      data: { approvedAt: new Date() }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'RESULTS_APPROVE',
      entityType: 'Exam',
      entityId: examId
    });
  },

  async publishResults(tenantId: string, schoolId: string, examId: string, actorUserId: string, actorEmail: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, tenantId, schoolId }
    });
    if (!exam) throw new AppError(404, 'Exam not found');

    if (exam.resultStatus !== ResultStatus.APPROVED) {
      throw new AppError(400, 'Results must be approved before they can be published');
    }

    await prisma.exam.update({
      where: { id: examId },
      data: { resultStatus: ResultStatus.PUBLISHED, status: ExamStatus.COMPLETED }
    });

    await prisma.studentResult.updateMany({
      where: { tenantId, examId },
      data: { publishedAt: new Date() }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'RESULTS_PUBLISH',
      entityType: 'Exam',
      entityId: examId
    });
  },

  async unpublishResults(tenantId: string, schoolId: string, examId: string, actorUserId: string, actorEmail: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, tenantId, schoolId }
    });
    if (!exam) throw new AppError(404, 'Exam not found');

    await prisma.exam.update({
      where: { id: examId },
      data: { resultStatus: ResultStatus.APPROVED, status: ExamStatus.MARKS_ENTRY_CLOSED }
    });

    await prisma.studentResult.updateMany({
      where: { tenantId, examId },
      data: { publishedAt: null }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'RESULTS_UNPUBLISH',
      entityType: 'Exam',
      entityId: examId
    });
  },

  // ==========================================
  // K. PORTAL RESOLVERS (Student / Guardian)
  // ==========================================
  async getStudentPortalResults(tenantId: string, studentUserId: string) {
    const student = await prisma.student.findFirst({
      where: { userId: studentUserId, tenantId }
    });
    if (!student) throw new AppError(404, 'Student profile not mapped to your user account');

    // Find all student results for published exams
    return prisma.studentResult.findMany({
      where: {
        tenantId,
        studentId: student.id,
        publishedAt: { not: null }
      },
      include: {
        exam: { include: { academicTerm: true } }
      }
    });
  },

  async getStudentPortalExamDetail(tenantId: string, studentUserId: string, examId: string) {
    const student = await prisma.student.findFirst({
      where: { userId: studentUserId, tenantId }
    });
    if (!student) throw new AppError(404, 'Student profile not mapped');

    const overall = await prisma.studentResult.findFirst({
      where: { tenantId, examId, studentId: student.id, publishedAt: { not: null } },
      include: { exam: true }
    });
    if (!overall) throw new AppError(403, 'Result not published or not found');

    const subjects = await prisma.subjectResult.findMany({
      where: { tenantId, examId, studentId: student.id },
      include: { examSubject: { include: { subject: true } } }
    });

    // Also fetch Co-Scholastic Entries and Remarks
    const remarks = await prisma.studentExamRemark.findFirst({
      where: { tenantId, examId, studentId: student.id }
    });

    const coScholastic = await prisma.coScholasticEntry.findMany({
      where: { tenantId, examId, studentId: student.id },
      include: { area: true }
    });

    // Finalized attendance count
    const attendance = await this.calculateStudentAttendance(tenantId, student.id, overall.exam.startDate, overall.exam.endDate);

    return {
      overall,
      subjects,
      remarks,
      coScholastic,
      attendance
    };
  },

  async getGuardianPortalResults(tenantId: string, guardianUserId: string, childStudentId: string) {
    // Verify approved guardian child relationship
    const guardian = await prisma.guardian.findFirst({
      where: { userId: guardianUserId, tenantId }
    });
    if (!guardian) throw new AppError(404, 'Guardian profile not found');

    const relationship = await prisma.studentGuardian.findFirst({
      where: { guardianId: guardian.id, studentId: childStudentId, tenantId }
    });
    if (!relationship) throw new AppError(403, 'Access denied: child student is not linked to your guardian account');

    return prisma.studentResult.findMany({
      where: {
        tenantId,
        studentId: childStudentId,
        publishedAt: { not: null }
      },
      include: {
        exam: { include: { academicTerm: true } }
      }
    });
  },

  async getGuardianPortalExamDetail(tenantId: string, guardianUserId: string, childStudentId: string, examId: string) {
    const guardian = await prisma.guardian.findFirst({
      where: { userId: guardianUserId, tenantId }
    });
    if (!guardian) throw new AppError(404, 'Guardian profile not found');

    const relationship = await prisma.studentGuardian.findFirst({
      where: { guardianId: guardian.id, studentId: childStudentId, tenantId }
    });
    if (!relationship) throw new AppError(403, 'Access denied');

    const overall = await prisma.studentResult.findFirst({
      where: { tenantId, examId, studentId: childStudentId, publishedAt: { not: null } },
      include: { exam: true }
    });
    if (!overall) throw new AppError(403, 'Result not published or not found');

    const subjects = await prisma.subjectResult.findMany({
      where: { tenantId, examId, studentId: childStudentId },
      include: { examSubject: { include: { subject: true } } }
    });

    const remarks = await prisma.studentExamRemark.findFirst({
      where: { tenantId, examId, studentId: childStudentId }
    });

    const coScholastic = await prisma.coScholasticEntry.findMany({
      where: { tenantId, examId, studentId: childStudentId },
      include: { area: true }
    });

    const attendance = await this.calculateStudentAttendance(tenantId, childStudentId, overall.exam.startDate, overall.exam.endDate);

    return {
      overall,
      subjects,
      remarks,
      coScholastic,
      attendance
    };
  },

  // ==========================================
  // L. ATTENDANCE INTEGRATION SUMMARY
  // ==========================================
  async calculateStudentAttendance(
    tenantId: string,
    studentId: string,
    startDate?: Date | null,
    endDate?: Date | null
  ) {
    const whereClause: any = {
      tenantId,
      studentId
    };

    if (startDate || endDate) {
      whereClause.session = {};
      if (startDate) whereClause.session.attendanceDate = { gte: startDate };
      if (endDate) whereClause.session.attendanceDate = { ...whereClause.session.attendanceDate, lte: endDate };
    }

    // Only count finalized attendance sessions
    whereClause.session = {
      ...whereClause.session,
      status: 'SUBMITTED' // finalized state in Phase 6
    };

    const records = await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: { session: true }
    });

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

    return {
      totalDays,
      presentDays,
      percentage: Number(percentage.toFixed(2))
    };
  },

  // ==========================================
  // M. REPORT CARD TEMPLATE & GENERATION
  // ==========================================
  async listReportCardTemplates(tenantId: string) {
    return prisma.reportCardTemplate.findMany({
      where: { tenantId }
    });
  },

  async createReportCardTemplate(
    tenantId: string,
    schoolId: string,
    data: any,
    actorUserId: string,
    actorEmail: string
  ) {
    if (data.isDefault) {
      await prisma.reportCardTemplate.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.reportCardTemplate.create({
      data: {
        ...data,
        tenantId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'REPORT_CARD_TEMPLATE_CREATE',
      entityType: 'ReportCardTemplate',
      entityId: template.id,
      newValues: template
    });

    return template;
  },

  async updateReportCardTemplate(
    tenantId: string,
    schoolId: string,
    id: string,
    data: Prisma.ReportCardTemplateUpdateInput,
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.reportCardTemplate.findFirst({
      where: { id, tenantId }
    });
    if (!existing) throw new AppError(404, 'Report card template not found');

    if (data.isDefault) {
      await prisma.reportCardTemplate.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.reportCardTemplate.update({
      where: { id },
      data
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'REPORT_CARD_TEMPLATE_UPDATE',
      entityType: 'ReportCardTemplate',
      entityId: id,
      oldValues: existing,
      newValues: template
    });

    return template;
  },

  async previewReportCard(
    tenantId: string,
    schoolId: string,
    examId: string,
    studentId: string,
    templateId: string
  ) {
    // 1. Fetch template
    const template = await prisma.reportCardTemplate.findFirst({
      where: { id: templateId, tenantId }
    });
    if (!template) throw new AppError(404, 'Report card template not found');

    // 2. Fetch School info
    const school = await prisma.school.findFirst({
      where: { id: schoolId, tenantId }
    });
    if (!school) throw new AppError(404, 'School details not found');

    // 3. Fetch Student profile & active enrollment
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, schoolId, studentId, isCurrent: true, status: 'ACTIVE' },
      include: { student: true, gradeLevel: true, section: true, academicYear: true }
    });
    if (!enrollment) throw new AppError(404, 'Student active enrollment not found');

    // 4. Fetch Calculated results
    const overallResult = await prisma.studentResult.findFirst({
      where: { tenantId, examId, studentId },
      include: { exam: true }
    });
    if (!overallResult) throw new AppError(400, 'Student results not calculated yet');

    const subjectResults = await prisma.subjectResult.findMany({
      where: { tenantId, examId, studentId },
      include: { examSubject: { include: { subject: true } } }
    });

    // 5. Fetch Remarks
    const remarks = await prisma.studentExamRemark.findFirst({
      where: { tenantId, examId, studentId }
    });

    // 6. Fetch Co-scholastic grades
    const coScholastic = await prisma.coScholasticEntry.findMany({
      where: { tenantId, examId, studentId },
      include: { area: true }
    });

    // 7. Fetch Attendance Summary
    const attendance = await this.calculateStudentAttendance(
      tenantId,
      studentId,
      overallResult.exam.startDate,
      overallResult.exam.endDate
    );

    return {
      schoolName: school.name,
      schoolLogo: school.logoUrl,
      schoolAddress: `${school.addressLine1}, ${school.city}, ${school.state}`,
      schoolContact: `${school.officialEmail} | ${school.officialPhone}`,
      student: {
        id: studentId,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        admissionNumber: enrollment.student.admissionNumber,
        rollNumber: enrollment.rollNumber,
        dateOfBirth: enrollment.student.dateOfBirth,
        photoUrl: enrollment.student.photoUrl,
        class: enrollment.gradeLevel.name,
        section: enrollment.section.name,
        academicYear: enrollment.academicYear.name
      },
      examName: overallResult.exam.name,
      templateSettings: template,
      overallResult,
      subjectResults,
      remarks,
      coScholastic,
      attendance
    };
  },

  async generateReportCard(
    tenantId: string,
    schoolId: string,
    examId: string,
    studentId: string,
    templateId: string,
    actorUserId: string,
    actorEmail: string
  ) {
    const preview = await this.previewReportCard(tenantId, schoolId, examId, studentId, templateId);
    
    // Upsert snapshot data
    const queryParams = {
      tenantId,
      examId,
      studentId
    };

    const reportCard = await prisma.reportCard.upsert({
      where: {
        tenantId_examId_studentId: queryParams
      },
      create: {
        ...queryParams,
        studentEnrollmentId: preview.overallResult.studentEnrollmentId,
        studentResultId: preview.overallResult.id,
        templateId,
        snapshotData: preview as any,
        versionNumber: 1,
        status: 'GENERATED',
        generatedByUserId: actorUserId
      },
      update: {
        snapshotData: preview as any,
        templateId,
        versionNumber: { increment: 1 },
        status: 'GENERATED',
        generatedByUserId: actorUserId,
        generatedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'REPORT_CARD_GENERATE',
      entityType: 'ReportCard',
      entityId: reportCard.id,
      metadata: { studentId }
    });

    return reportCard;
  },

  async getReportCardSnapshot(tenantId: string, examId: string, studentId: string) {
    return prisma.reportCard.findFirst({
      where: { tenantId, examId, studentId }
    });
  },

  // ==========================================
  // N. REMARKS & CO-SCHOLASTIC
  // ==========================================
  async saveStudentRemarks(
    tenantId: string,
    schoolId: string,
    data: {
      examId: string;
      studentId: string;
      studentEnrollmentId: string;
      classTeacherRemark?: string;
      principalRemark?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const queryParams = {
      tenantId,
      examId: data.examId,
      studentId: data.studentId
    };

    const remark = await prisma.studentExamRemark.upsert({
      where: {
        tenantId_examId_studentId: queryParams
      },
      create: {
        ...queryParams,
        studentEnrollmentId: data.studentEnrollmentId,
        classTeacherRemark: data.classTeacherRemark || null,
        principalRemark: data.principalRemark || null,
        createdByUserId: actorUserId
      },
      update: {
        classTeacherRemark: data.classTeacherRemark !== undefined ? data.classTeacherRemark : undefined,
        principalRemark: data.principalRemark !== undefined ? data.principalRemark : undefined,
        updatedByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EXAM_REMARK_SAVE',
      entityType: 'StudentExamRemark',
      entityId: remark.id,
      metadata: { studentId: data.studentId }
    });

    return remark;
  },

  async listCoScholasticAreas(tenantId: string, academicYearId: string) {
    return prisma.coScholasticArea.findMany({
      where: { tenantId, academicYearId, status: Status.ACTIVE },
      orderBy: { sortOrder: 'asc' }
    });
  },

  async createCoScholasticArea(
    tenantId: string,
    schoolId: string,
    data: {
      academicYearId: string;
      name: string;
      code?: string;
      sortOrder?: number;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const area = await prisma.coScholasticArea.create({
      data: {
        tenantId,
        academicYearId: data.academicYearId,
        name: data.name,
        code: data.code,
        sortOrder: data.sortOrder || 0,
        status: Status.ACTIVE
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CO_SCHOLASTIC_AREA_CREATE',
      entityType: 'CoScholasticArea',
      entityId: area.id,
      newValues: area
    });

    return area;
  },

  async saveCoScholasticEntries(
    tenantId: string,
    schoolId: string,
    data: {
      examId: string;
      studentId: string;
      entries: {
        areaId: string;
        grade: string;
        remarks?: string | null;
      }[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    for (const ent of data.entries) {
      const queryParams = {
        tenantId,
        examId: data.examId,
        studentId: data.studentId,
        areaId: ent.areaId
      };

      await prisma.coScholasticEntry.upsert({
        where: {
          tenantId_examId_studentId_areaId: queryParams
        },
        create: {
          ...queryParams,
          grade: ent.grade,
          remarks: ent.remarks || null,
          enteredByUserId: actorUserId
        },
        update: {
          grade: ent.grade,
          remarks: ent.remarks || null,
          enteredByUserId: actorUserId
        }
      });
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CO_SCHOLASTIC_ENTRIES_SAVE',
      entityType: 'CoScholasticEntry',
      entityId: data.examId,
      metadata: { studentId: data.studentId, count: data.entries.length }
    });
  }
};
