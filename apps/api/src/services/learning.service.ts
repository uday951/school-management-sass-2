import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { 
  HomeworkStatus,
  AssignmentStatus,
  SubmissionStatus,
  StudyMaterialStatus,
  StudyMaterialType,
  EmployeeStatus
} from '@prisma/client';

export const learningService = {
  // ==========================================
  // AUTHORIZATION HELPER
  // ==========================================
  async validateTeacherAccess(
    tenantId: string,
    teacherEmployeeId: string,
    classId: string,
    sectionId: string,
    subjectId: string,
    academicYearId: string
  ) {
    // Look up if there is an active TeacherAssignment matching
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        tenantId,
        employeeId: teacherEmployeeId,
        gradeLevelId: classId,
        sectionId,
        subjectId,
        academicYearId,
        status: 'ACTIVE'
      }
    });

    if (!assignment) {
      throw new AppError(403, 'Teacher is not assigned to this class, section, and subject');
    }
  },

  // ==========================================
  // C1. HOMEWORK WORKFLOW
  // ==========================================
  async getHomework(tenantId: string, id: string) {
    const hw = await prisma.homework.findFirst({
      where: { id, tenantId, archivedAt: null },
      include: { class: true, section: true, subject: true, teacher: true }
    });
    if (!hw) throw new AppError(404, 'Homework not found');
    return hw;
  },

  async createHomework(
    tenantId: string,
    teacherEmployeeId: string,
    data: {
      academicYearId: string;
      classId: string;
      sectionId: string;
      subjectId: string;
      title: string;
      description: string;
      attachmentUrl?: string;
      assignedDate: string;
      dueDate?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    // Validate teacher access
    await this.validateTeacherAccess(
      tenantId,
      teacherEmployeeId,
      data.classId,
      data.sectionId,
      data.subjectId,
      data.academicYearId
    );

    const hw = await prisma.homework.create({
      data: {
        tenantId,
        academicYearId: data.academicYearId,
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherEmployeeId,
        title: data.title,
        description: data.description,
        attachmentUrl: data.attachmentUrl || null,
        assignedDate: new Date(data.assignedDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: HomeworkStatus.DRAFT,
        createdByUserId: actorUserId,
        archivedAt: null
      }
    });

    return hw;
  },

  async publishHomework(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const hw = await this.getHomework(tenantId, id);
    if (hw.status === HomeworkStatus.PUBLISHED) {
      throw new AppError(400, 'Homework already published');
    }

    const updated = await prisma.homework.update({
      where: { id },
      data: {
        status: HomeworkStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });

    // Notify all students in this class/section
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { tenantId, gradeLevelId: hw.classId, sectionId: hw.sectionId, isCurrent: true, status: 'ACTIVE' },
      include: { student: true }
    });

    for (const e of enrollments) {
      if (e.student.userId) {
        await prisma.notification.create({
          data: {
            tenantId,
            userId: e.student.userId,
            type: 'HOMEWORK',
            title: `New Homework: ${hw.title}`,
            message: `Homework due for ${hw.subject.name}`,
            referenceType: 'Homework',
            referenceId: hw.id
          }
        });
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'HOMEWORK_PUBLISH',
      entityType: 'Homework',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  async listHomeworkForStudent(tenantId: string, studentId: string, academicYearId: string) {
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId, academicYearId, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) return [];

    return prisma.homework.findMany({
      where: {
        tenantId,
        classId: enrollment.gradeLevelId,
        sectionId: enrollment.sectionId,
        status: HomeworkStatus.PUBLISHED,
        archivedAt: null
      },
      include: { subject: true, teacher: true },
      orderBy: { assignedDate: 'desc' }
    });
  },

  // ==========================================
  // C5. ASSIGNMENTS WORKFLOW
  // ==========================================
  async getAssignment(tenantId: string, id: string) {
    const assign = await prisma.assignment.findFirst({
      where: { id, tenantId },
      include: { class: true, section: true, subject: true, teacher: true }
    });
    if (!assign) throw new AppError(404, 'Assignment not found');
    return assign;
  },

  async createAssignment(
    tenantId: string,
    teacherEmployeeId: string,
    data: {
      academicYearId: string;
      classId: string;
      sectionId: string;
      subjectId: string;
      title: string;
      description: string;
      attachmentUrl?: string;
      assignedAt: string;
      dueAt: string;
      maximumMarks?: number;
      allowLateSubmission?: boolean;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    await this.validateTeacherAccess(
      tenantId,
      teacherEmployeeId,
      data.classId,
      data.sectionId,
      data.subjectId,
      data.academicYearId
    );

    const assign = await prisma.assignment.create({
      data: {
        tenantId,
        academicYearId: data.academicYearId,
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherEmployeeId,
        title: data.title,
        description: data.description,
        attachmentUrl: data.attachmentUrl || null,
        assignedAt: new Date(data.assignedAt),
        dueAt: new Date(data.dueAt),
        maximumMarks: data.maximumMarks || null,
        allowLateSubmission: data.allowLateSubmission !== undefined ? data.allowLateSubmission : false,
        status: AssignmentStatus.DRAFT,
        createdByUserId: actorUserId
      }
    });

    return assign;
  },

  async publishAssignment(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const assign = await this.getAssignment(tenantId, id);
    if (assign.status === AssignmentStatus.PUBLISHED) {
      throw new AppError(400, 'Assignment already published');
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { tenantId, gradeLevelId: assign.classId, sectionId: assign.sectionId, isCurrent: true, status: 'ACTIVE' },
      include: { student: true }
    });

    for (const e of enrollments) {
      if (e.student.userId) {
        await prisma.notification.create({
          data: {
            tenantId,
            userId: e.student.userId,
            type: 'ASSIGNMENT',
            title: `New Assignment: ${assign.title}`,
            message: `Assignment due on ${assign.dueAt.toDateString()}`,
            referenceType: 'Assignment',
            referenceId: assign.id
          }
        });
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'ASSIGNMENT_PUBLISH',
      entityType: 'Assignment',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  async listAssignmentsForStudent(tenantId: string, studentId: string, academicYearId: string) {
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId, academicYearId, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) return [];

    const assignments = await prisma.assignment.findMany({
      where: {
        tenantId,
        classId: enrollment.gradeLevelId,
        sectionId: enrollment.sectionId,
        status: AssignmentStatus.PUBLISHED
      },
      include: {
        subject: true,
        teacher: true,
        submissions: {
          where: { studentId }
        }
      },
      orderBy: { dueAt: 'asc' }
    });

    return assignments.map(a => {
      const submission = a.submissions[0] || null;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        attachmentUrl: a.attachmentUrl,
        assignedAt: a.assignedAt,
        dueAt: a.dueAt,
        maximumMarks: a.maximumMarks,
        allowLateSubmission: a.allowLateSubmission,
        subjectName: a.subject.name,
        teacherName: `${a.teacher.firstName} ${a.teacher.lastName}`,
        submissionStatus: submission ? submission.status : 'PENDING',
        submission: submission
      };
    });
  },

  // ==========================================
  // C7. STUDENT SUBMISSIONS
  // ==========================================
  async getSubmission(tenantId: string, id: string, requestingStudentId?: string) {
    const sub = await prisma.assignmentSubmission.findFirst({
      where: { id, tenantId },
      include: { student: true, assignment: { include: { subject: true } }, grade: true }
    });
    if (!sub) throw new AppError(404, 'Submission not found');

    if (requestingStudentId && sub.studentId !== requestingStudentId) {
      throw new AppError(403, 'Unauthorized access to other student submission');
    }

    return sub;
  },

  async listSubmissionsForAssignment(tenantId: string, assignmentId: string) {
    return prisma.assignmentSubmission.findMany({
      where: { tenantId, assignmentId },
      include: { student: true, grade: true }
    });
  },

  async submitAssignment(
    tenantId: string,
    studentId: string,
    assignmentId: string,
    data: { textResponse?: string; attachmentUrl?: string },
    academicYearId: string
  ) {
    const assignment = await this.getAssignment(tenantId, assignmentId);
    if (assignment.status !== AssignmentStatus.PUBLISHED) {
      throw new AppError(400, 'Assignment is not open for submissions');
    }

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId, academicYearId, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) throw new AppError(400, 'Active student enrollment not found');

    const today = new Date();
    const isLate = today > assignment.dueAt;

    if (isLate && !assignment.allowLateSubmission) {
      throw new AppError(400, 'Late submissions are not allowed for this assignment');
    }

    const existing = await prisma.assignmentSubmission.findUnique({
      where: {
        tenantId_assignmentId_studentId: {
          tenantId,
          assignmentId,
          studentId
        }
      }
    });

    if (existing && existing.status === SubmissionStatus.GRADED) {
      throw new AppError(400, 'Cannot modify a graded assignment submission');
    }

    let submission;
    if (existing) {
      submission = await prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          submittedAt: today,
          status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
          textResponse: data.textResponse,
          attachmentUrl: data.attachmentUrl,
          isLate
        }
      });
    } else {
      submission = await prisma.assignmentSubmission.create({
        data: {
          tenantId,
          assignmentId,
          studentId,
          studentEnrollmentId: enrollment.id,
          submittedAt: today,
          status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
          textResponse: data.textResponse,
          attachmentUrl: data.attachmentUrl,
          isLate
        }
      });
    }

    return submission;
  },

  // ==========================================
  // C9. TEACHER REVIEW & GRADING
  // ==========================================
  async gradeSubmission(
    tenantId: string,
    submissionId: string,
    data: { marksAwarded?: number; feedback?: string },
    actorUserId: string,
    actorEmail: string
  ) {
    const submission = await prisma.assignmentSubmission.findFirst({
      where: { id: submissionId, tenantId },
      include: { assignment: true }
    });
    if (!submission) throw new AppError(404, 'Submission not found');

    // Validate marks limits
    if (data.marksAwarded !== undefined && submission.assignment.maximumMarks !== null) {
      if (data.marksAwarded > submission.assignment.maximumMarks) {
        throw new AppError(400, `Marks awarded cannot exceed maximum marks (${submission.assignment.maximumMarks})`);
      }
    }

    // Upsert assignment grade record
    const grade = await prisma.assignmentGrade.upsert({
      where: { assignmentSubmissionId: submissionId },
      create: {
        tenantId,
        assignmentSubmissionId: submissionId,
        marksAwarded: data.marksAwarded,
        feedback: data.feedback,
        gradedByUserId: actorUserId,
        gradedAt: new Date()
      },
      update: {
        marksAwarded: data.marksAwarded,
        feedback: data.feedback,
        gradedByUserId: actorUserId,
        gradedAt: new Date()
      }
    });

    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.GRADED }
    });

    // Notify student
    const student = await prisma.student.findUnique({ where: { id: submission.studentId } });
    if (student && student.userId) {
      await prisma.notification.create({
        data: {
          tenantId,
          userId: student.userId,
          type: 'GRADE',
          title: `Assignment Graded: ${submission.assignment.title}`,
          message: `Your assignment has been reviewed. Marks: ${data.marksAwarded ?? 'N/A'}`,
          referenceType: 'AssignmentSubmission',
          referenceId: submissionId
        }
      });
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'ASSIGNMENT_GRADE_SUBMIT',
      entityType: 'AssignmentGrade',
      entityId: grade.id,
      newValues: grade
    });

    return { submission: updatedSubmission, grade };
  },

  // ==========================================
  // C11. STUDY MATERIALS WORKFLOW
  // ==========================================
  async getStudyMaterial(tenantId: string, id: string) {
    const mat = await prisma.studyMaterial.findFirst({
      where: { id, tenantId },
      include: { class: true, section: true, subject: true, teacher: true }
    });
    if (!mat) throw new AppError(404, 'Study material not found');
    return mat;
  },

  async createStudyMaterial(
    tenantId: string,
    teacherEmployeeId: string,
    data: {
      academicYearId: string;
      classId: string;
      sectionId?: string;
      subjectId: string;
      title: string;
      description?: string;
      materialType: StudyMaterialType;
      fileAttachmentUrl?: string;
      url?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    // Validate teacher access
    await this.validateTeacherAccess(
      tenantId,
      teacherEmployeeId,
      data.classId,
      data.sectionId || '',
      data.subjectId,
      data.academicYearId
    );

    const mat = await prisma.studyMaterial.create({
      data: {
        tenantId,
        academicYearId: data.academicYearId,
        classId: data.classId,
        sectionId: data.sectionId || null,
        subjectId: data.subjectId,
        teacherEmployeeId,
        title: data.title,
        description: data.description,
        materialType: data.materialType,
        fileAttachmentUrl: data.fileAttachmentUrl || null,
        url: data.url || null,
        status: StudyMaterialStatus.PUBLISHED,
        publishedAt: new Date(),
        createdByUserId: actorUserId
      }
    });

    // Notify students
    const whereClause: any = { tenantId, gradeLevelId: data.classId, isCurrent: true, status: 'ACTIVE' };
    if (data.sectionId) whereClause.sectionId = data.sectionId;
    const enrollments = await prisma.studentEnrollment.findMany({
      where: whereClause,
      include: { student: true }
    });

    for (const e of enrollments) {
      if (e.student.userId) {
        await prisma.notification.create({
          data: {
            tenantId,
            userId: e.student.userId,
            type: 'STUDY_MATERIAL',
            title: `New Material: ${mat.title}`,
            message: `Study material notes updated for ${mat.materialType}`,
            referenceType: 'StudyMaterial',
            referenceId: mat.id
          }
        });
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'STUDY_MATERIAL_PUBLISH',
      entityType: 'StudyMaterial',
      entityId: mat.id,
      newValues: mat
    });

    return mat;
  },

  async listStudyMaterialsForStudent(tenantId: string, studentId: string, academicYearId: string) {
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId, academicYearId, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) return [];

    return prisma.studyMaterial.findMany({
      where: {
        tenantId,
        classId: enrollment.gradeLevelId,
        OR: [
          { sectionId: enrollment.sectionId },
          { sectionId: null }
        ],
        status: StudyMaterialStatus.PUBLISHED
      },
      include: { subject: true, teacher: true },
      orderBy: { publishedAt: 'desc' }
    });
  }
};
