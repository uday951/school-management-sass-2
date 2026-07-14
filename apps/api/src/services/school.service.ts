import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import { AcademicYearStatus, Status, DepartmentType, SubjectType } from '@prisma/client';

export const ALLOWED_SCHOOL_PERMISSIONS = [
  'school.profile.read',
  'school.profile.update',
  'academic_year.read',
  'academic_year.create',
  'academic_year.update',
  'academic_year.set_current',
  'academic_year.archive',
  'department.read',
  'department.create',
  'department.update',
  'department.archive',
  'class.read',
  'class.create',
  'class.update',
  'class.archive',
  'section.read',
  'section.create',
  'section.update',
  'section.archive',
  'subject.read',
  'subject.create',
  'subject.update',
  'subject.archive',
  'subject_mapping.read',
  'subject_mapping.manage',
  'school_role.read',
  'school_role.create',
  'school_role.update',
  'school_role.permissions.manage',
  'audit.read',
];

export const schoolService = {
  // 1. SETUP CHECKLIST & STATUS
  getSetupStatus: async (tenantId: string, schoolId: string) => {
    const [
      school,
      academicYearsCount,
      departmentsCount,
      classesCount,
      sectionsCount,
      subjectsCount,
      classSubjectsCount,
    ] = await Promise.all([
      prisma.school.findFirst({ where: { id: schoolId, tenantId } }),
      prisma.academicYear.count({ where: { tenantId, schoolId, status: { not: 'ARCHIVED' } } }),
      prisma.department.count({ where: { tenantId, schoolId, status: { not: Status.ARCHIVED } } }),
      prisma.gradeLevel.count({ where: { tenantId, schoolId, status: { not: Status.ARCHIVED } } }),
      prisma.section.count({ where: { tenantId, schoolId, status: { not: Status.ARCHIVED } } }),
      prisma.subject.count({ where: { tenantId, schoolId, status: { not: Status.ARCHIVED } } }),
      prisma.classSubject.count({ where: { tenantId, schoolId, status: { not: Status.ARCHIVED } } }),
    ]);

    if (!school) throw new AppError(404, 'School not found');

    const steps = {
      profile: true,
      academicYear: academicYearsCount > 0,
      department: departmentsCount > 0,
      class: classesCount > 0,
      section: sectionsCount > 0,
      subject: subjectsCount > 0,
      mapping: classSubjectsCount > 0,
    };

    let percentage = 0;
    if (steps.profile) percentage += 15;
    if (steps.academicYear) percentage += 15;
    if (steps.department) percentage += 15;
    if (steps.class) percentage += 15;
    if (steps.section) percentage += 15;
    if (steps.subject) percentage += 15;
    if (steps.mapping) percentage += 10;

    return {
      percentage,
      steps,
      counts: {
        academicYears: academicYearsCount,
        departments: departmentsCount,
        classes: classesCount,
        sections: sectionsCount,
        subjects: subjectsCount,
        classSubjects: classSubjectsCount,
      },
    };
  },

  // 2. DASHBOARD
  getDashboardData: async (tenantId: string, schoolId: string) => {
    const [setupStatus, currentYear, recentLogs] = await Promise.all([
      schoolService.getSetupStatus(tenantId, schoolId),
      prisma.academicYear.findFirst({
        where: { tenantId, schoolId, isCurrent: true },
        select: { id: true, name: true, status: true },
      }),
      prisma.auditLog.findMany({
        where: { tenantId, schoolId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    return {
      stats: {
        academicYearsCount: setupStatus.counts.academicYears,
        departmentsCount: setupStatus.counts.departments,
        classesCount: setupStatus.counts.classes,
        sectionsCount: setupStatus.counts.sections,
        subjectsCount: setupStatus.counts.subjects,
        classSubjectsCount: setupStatus.counts.classSubjects,
        setupPercentage: setupStatus.percentage,
      },
      setupSteps: setupStatus.steps,
      currentAcademicYear: currentYear || null,
      recentActivity: recentLogs,
    };
  },

  // 3. PROFILE
  getProfile: async (tenantId: string, schoolId: string) => {
    const school = await prisma.school.findFirst({
      where: { id: schoolId, tenantId },
      include: {
        tenant: {
          select: { name: true, slug: true, status: true },
        },
      },
    });
    if (!school) throw new AppError(404, 'School profile not found');
    return school;
  },

  updateProfile: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getProfile(tenantId, schoolId);

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: dto,
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SCHOOL_PROFILE_UPDATED',
      entityType: 'School',
      entityId: schoolId,
      oldValues: { officialEmail: existing.officialEmail, officialPhone: existing.officialPhone },
      newValues: { officialEmail: updated.officialEmail, officialPhone: updated.officialPhone },
    });

    return updated;
  },

  // 4. ACADEMIC YEARS
  createAcademicYear: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (start >= end) throw new AppError(400, 'Start date must be strictly before end date');

    const existing = await prisma.academicYear.findUnique({
      where: { tenantId_schoolId_name: { tenantId, schoolId, name: dto.name } },
    });
    if (existing) throw new AppError(409, `Academic year '${dto.name}' already exists`);

    const year = await prisma.academicYear.create({
      data: {
        tenantId,
        schoolId,
        name: dto.name,
        code: dto.code,
        startDate: start,
        endDate: end,
        status: dto.status || 'PLANNED',
        isCurrent: false,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ACADEMIC_YEAR_CREATED',
      entityType: 'AcademicYear',
      entityId: year.id,
      newValues: { name: year.name, status: year.status },
    });

    return year;
  },

  listAcademicYears: async (tenantId: string, schoolId: string) => {
    return prisma.academicYear.findMany({
      where: { tenantId, schoolId },
      orderBy: { startDate: 'desc' },
    });
  },

  getAcademicYear: async (tenantId: string, schoolId: string, id: string) => {
    const year = await prisma.academicYear.findFirst({ where: { id, tenantId, schoolId } });
    if (!year) throw new AppError(404, 'Academic year not found');
    return year;
  },

  updateAcademicYear: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getAcademicYear(tenantId, schoolId, id);
    if (existing.status === 'ARCHIVED') throw new AppError(400, 'Cannot modify archived session');

    let start = existing.startDate;
    let end = existing.endDate;
    if (dto.startDate) start = new Date(dto.startDate);
    if (dto.endDate) end = new Date(dto.endDate);
    if (start >= end) throw new AppError(400, 'Start date must be strictly before end date');

    if (dto.name && dto.name !== existing.name) {
      const conflict = await prisma.academicYear.findFirst({
        where: { tenantId, schoolId, name: dto.name, id: { not: id } },
      });
      if (conflict) throw new AppError(409, `Academic year '${dto.name}' already exists`);
    }

    const updated = await prisma.academicYear.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
        archivedAt: dto.status === 'ARCHIVED' ? new Date() : undefined,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ACADEMIC_YEAR_UPDATED',
      entityType: 'AcademicYear',
      entityId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: updated.name, status: updated.status },
    });

    return updated;
  },

  setCurrentAcademicYear: async (
    tenantId: string,
    schoolId: string,
    id: string,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getAcademicYear(tenantId, schoolId, id);
    if (existing.status === 'ARCHIVED') throw new AppError(400, 'Cannot set archived session as current');

    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { tenantId, schoolId, isCurrent: true },
        data: { isCurrent: false },
      }),
      prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true, status: 'ACTIVE' },
      }),
    ]);

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ACADEMIC_YEAR_SET_CURRENT',
      entityType: 'AcademicYear',
      entityId: id,
      newValues: { name: existing.name, isCurrent: true },
    });

    return schoolService.getAcademicYear(tenantId, schoolId, id);
  },

  // 5. DEPARTMENTS
  createDepartment: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const code = dto.code.toUpperCase().trim();
    const existing = await prisma.department.findUnique({
      where: { tenantId_schoolId_code: { tenantId, schoolId, code } },
    });
    if (existing) throw new AppError(409, `Department code '${code}' already exists`);

    const dept = await prisma.department.create({
      data: {
        tenantId,
        schoolId,
        name: dto.name,
        code,
        type: dto.type || 'ACADEMIC',
        description: dto.description,
        status: 'ACTIVE',
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: dept.id,
      newValues: { name: dept.name, code: dept.code },
    });

    return dept;
  },

  listDepartments: async (tenantId: string, schoolId: string) => {
    return prisma.department.findMany({
      where: { tenantId, schoolId, status: { not: 'ARCHIVED' } },
      orderBy: { name: 'asc' },
    });
  },

  getDepartment: async (tenantId: string, schoolId: string, id: string) => {
    const dept = await prisma.department.findFirst({ where: { id, tenantId, schoolId } });
    if (!dept) throw new AppError(404, 'Department not found');
    return dept;
  },

  updateDepartment: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getDepartment(tenantId, schoolId, id);
    if (existing.status === 'ARCHIVED') throw new AppError(400, 'Cannot modify archived department');

    if (dto.code) {
      const code = dto.code.toUpperCase().trim();
      if (code !== existing.code) {
        const conflict = await prisma.department.findFirst({
          where: { tenantId, schoolId, code, id: { not: id } },
        });
        if (conflict) throw new AppError(409, `Department code '${code}' already exists`);
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code ? dto.code.toUpperCase().trim() : undefined,
        type: dto.type,
        description: dto.description,
        status: dto.status,
        archivedAt: dto.status === 'ARCHIVED' ? new Date() : undefined,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'DEPARTMENT_UPDATED',
      entityType: 'Department',
      entityId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: updated.name, status: updated.status },
    });

    return updated;
  },

  // 6. CLASSES (GradeLevels)
  createClass: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const code = dto.code.toUpperCase().trim();
    const existing = await prisma.gradeLevel.findUnique({
      where: { tenantId_schoolId_code: { tenantId, schoolId, code } },
    });
    if (existing) throw new AppError(409, `Class code '${code}' already exists`);

    const classRecord = await prisma.gradeLevel.create({
      data: {
        tenantId,
        schoolId,
        name: dto.name,
        code,
        displayOrder: dto.displayOrder || 0,
        description: dto.description,
        status: 'ACTIVE',
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CLASS_CREATED',
      entityType: 'GradeLevel',
      entityId: classRecord.id,
      newValues: { name: classRecord.name, code: classRecord.code },
    });

    return classRecord;
  },

  listClasses: async (tenantId: string, schoolId: string) => {
    return prisma.gradeLevel.findMany({
      where: { tenantId, schoolId, status: { not: 'ARCHIVED' } },
      orderBy: { displayOrder: 'asc' },
    });
  },

  getClass: async (tenantId: string, schoolId: string, id: string) => {
    const classRecord = await prisma.gradeLevel.findFirst({ where: { id, tenantId, schoolId } });
    if (!classRecord) throw new AppError(404, 'Class not found');
    return classRecord;
  },

  updateClass: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getClass(tenantId, schoolId, id);
    if (existing.status === 'ARCHIVED') throw new AppError(400, 'Cannot modify archived class');

    if (dto.code) {
      const code = dto.code.toUpperCase().trim();
      if (code !== existing.code) {
        const conflict = await prisma.gradeLevel.findFirst({
          where: { tenantId, schoolId, code, id: { not: id } },
        });
        if (conflict) throw new AppError(409, `Class code '${code}' already exists`);
      }
    }

    const updated = await prisma.gradeLevel.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code ? dto.code.toUpperCase().trim() : undefined,
        displayOrder: dto.displayOrder,
        description: dto.description,
        status: dto.status,
        archivedAt: dto.status === 'ARCHIVED' ? new Date() : undefined,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CLASS_UPDATED',
      entityType: 'GradeLevel',
      entityId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: updated.name, status: updated.status },
    });

    return updated;
  },

  // 7. SECTIONS
  createSection: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const parentClass = await prisma.gradeLevel.findFirst({
      where: { id: dto.gradeLevelId, tenantId, schoolId },
    });
    if (!parentClass || parentClass.status === 'ARCHIVED') {
      throw new AppError(400, 'Active parent class not found under this tenant');
    }

    const existing = await prisma.section.findUnique({
      where: {
        tenantId_schoolId_gradeLevelId_name: {
          tenantId,
          schoolId,
          gradeLevelId: dto.gradeLevelId,
          name: dto.name,
        },
      },
    });
    if (existing) {
      throw new AppError(409, `Section '${dto.name}' already mapped to this class`);
    }

    const section = await prisma.section.create({
      data: {
        tenantId,
        schoolId,
        gradeLevelId: dto.gradeLevelId,
        name: dto.name,
        code: dto.code,
        capacity: dto.capacity,
        displayOrder: dto.displayOrder || 0,
        status: 'ACTIVE',
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SECTION_CREATED',
      entityType: 'Section',
      entityId: section.id,
      newValues: { name: section.name, gradeLevelId: section.gradeLevelId },
    });

    return section;
  },

  listSections: async (tenantId: string, schoolId: string, gradeLevelId?: string) => {
    return prisma.section.findMany({
      where: {
        tenantId,
        schoolId,
        gradeLevelId: gradeLevelId || undefined,
        status: { not: 'ARCHIVED' },
      },
      include: {
        gradeLevel: { select: { name: true, code: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });
  },

  getSection: async (tenantId: string, schoolId: string, id: string) => {
    const section = await prisma.section.findFirst({
      where: { id, tenantId, schoolId },
      include: { gradeLevel: { select: { name: true } } },
    });
    if (!section) throw new AppError(404, 'Section not found');
    return section;
  },

  updateSection: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getSection(tenantId, schoolId, id);
    if (existing.status === 'ARCHIVED') throw new AppError(400, 'Cannot modify archived section');

    if (dto.name && dto.name !== existing.name) {
      const conflict = await prisma.section.findFirst({
        where: {
          tenantId,
          schoolId,
          gradeLevelId: existing.gradeLevelId,
          name: dto.name,
          id: { not: id },
        },
      });
      if (conflict) throw new AppError(409, `Section '${dto.name}' already exists in this class`);
    }

    const updated = await prisma.section.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        capacity: dto.capacity,
        displayOrder: dto.displayOrder,
        status: dto.status,
        archivedAt: dto.status === 'ARCHIVED' ? new Date() : undefined,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SECTION_UPDATED',
      entityType: 'Section',
      entityId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: updated.name, status: updated.status },
    });

    return updated;
  },

  // 8. SUBJECTS
  createSubject: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const code = dto.code.toUpperCase().trim();
    const existing = await prisma.subject.findUnique({
      where: { tenantId_schoolId_code: { tenantId, schoolId, code } },
    });
    if (existing) throw new AppError(409, `Subject code '${code}' already exists`);

    if (dto.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: dto.departmentId, tenantId, schoolId },
      });
      if (!dept || dept.status === 'ARCHIVED') {
        throw new AppError(400, 'Active department not found under this tenant');
      }
    }

    const subject = await prisma.subject.create({
      data: {
        tenantId,
        schoolId,
        name: dto.name,
        code,
        description: dto.description,
        subjectType: dto.subjectType || 'CORE',
        departmentId: dto.departmentId || null,
        status: 'ACTIVE',
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SUBJECT_CREATED',
      entityType: 'Subject',
      entityId: subject.id,
      newValues: { name: subject.name, code: subject.code },
    });

    return subject;
  },

  listSubjects: async (tenantId: string, schoolId: string, departmentId?: string) => {
    return prisma.subject.findMany({
      where: {
        tenantId,
        schoolId,
        departmentId: departmentId || undefined,
        status: { not: 'ARCHIVED' },
      },
      include: {
        department: { select: { name: true, code: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  getSubject: async (tenantId: string, schoolId: string, id: string) => {
    const subject = await prisma.subject.findFirst({
      where: { id, tenantId, schoolId },
      include: { department: { select: { name: true } } },
    });
    if (!subject) throw new AppError(404, 'Subject not found');
    return subject;
  },

  updateSubject: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getSubject(tenantId, schoolId, id);
    if (existing.status === 'ARCHIVED') throw new AppError(400, 'Cannot modify archived subject');

    if (dto.code) {
      const code = dto.code.toUpperCase().trim();
      if (code !== existing.code) {
        const conflict = await prisma.subject.findFirst({
          where: { tenantId, schoolId, code, id: { not: id } },
        });
        if (conflict) throw new AppError(409, `Subject code '${code}' already exists`);
      }
    }

    if (dto.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: dto.departmentId, tenantId, schoolId },
      });
      if (!dept || dept.status === 'ARCHIVED') {
        throw new AppError(400, 'Active department not found under this tenant');
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code ? dto.code.toUpperCase().trim() : undefined,
        description: dto.description,
        subjectType: dto.subjectType,
        departmentId: dto.departmentId !== undefined ? dto.departmentId : undefined,
        status: dto.status,
        archivedAt: dto.status === 'ARCHIVED' ? new Date() : undefined,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SUBJECT_UPDATED',
      entityType: 'Subject',
      entityId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: updated.name, status: updated.status },
    });

    return updated;
  },

  // 9. CURRICULUM MAPPINGS
  validateMapRefs: async (
    tenantId: string,
    schoolId: string,
    gradeLevelId: string,
    academicYearId: string,
    subjectId: string,
    sectionId?: string,
  ) => {
    const [year, level, sub, sec] = await Promise.all([
      prisma.academicYear.findFirst({ where: { id: academicYearId, tenantId, schoolId } }),
      prisma.gradeLevel.findFirst({ where: { id: gradeLevelId, tenantId, schoolId } }),
      prisma.subject.findFirst({ where: { id: subjectId, tenantId, schoolId } }),
      sectionId
        ? prisma.section.findFirst({ where: { id: sectionId, tenantId, schoolId, gradeLevelId } })
        : Promise.resolve({ status: 'ACTIVE' }),
    ]);

    if (!year || year.status === 'ARCHIVED') throw new AppError(400, 'Active academic year not found');
    if (!level || level.status === 'ARCHIVED') throw new AppError(400, 'Active class not found');
    if (!sub || sub.status === 'ARCHIVED') throw new AppError(400, 'Active subject not found');
    if (sectionId && (!sec || sec.status === 'ARCHIVED')) {
      throw new AppError(400, 'Active section not found under this class');
    }
  },

  mapSubject: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    await schoolService.validateMapRefs(
      tenantId,
      schoolId,
      dto.gradeLevelId,
      dto.academicYearId,
      dto.subjectId,
      dto.sectionId,
    );

    const sectionId = dto.sectionId || undefined;

    const existing = await prisma.classSubject.findUnique({
      where: {
        tenantId_schoolId_academicYearId_gradeLevelId_sectionId_subjectId: {
          tenantId,
          schoolId,
          academicYearId: dto.academicYearId,
          gradeLevelId: dto.gradeLevelId,
          sectionId: sectionId || null,
          subjectId: dto.subjectId,
        },
      },
    });
    if (existing) throw new AppError(409, 'Subject is already mapped to this class');

    const mapping = await prisma.classSubject.create({
      data: {
        tenantId,
        schoolId,
        gradeLevelId: dto.gradeLevelId,
        subjectId: dto.subjectId,
        academicYearId: dto.academicYearId,
        sectionId,
        isMandatory: dto.isMandatory !== undefined ? dto.isMandatory : true,
        status: 'ACTIVE',
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CLASS_SUBJECT_MAPPED',
      entityType: 'ClassSubject',
      entityId: mapping.id,
      newValues: { gradeLevelId: mapping.gradeLevelId, subjectId: mapping.subjectId },
    });

    return mapping;
  },

  bulkMapSubjects: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const sectionId = dto.sectionId || undefined;
    const mappingsCreated = [];

    for (const subjectId of dto.subjectIds) {
      await schoolService.validateMapRefs(
        tenantId,
        schoolId,
        dto.gradeLevelId,
        dto.academicYearId,
        subjectId,
        dto.sectionId,
      );

      const existing = await prisma.classSubject.findUnique({
        where: {
          tenantId_schoolId_academicYearId_gradeLevelId_sectionId_subjectId: {
            tenantId,
            schoolId,
            academicYearId: dto.academicYearId,
            gradeLevelId: dto.gradeLevelId,
            sectionId: sectionId || null,
            subjectId,
          },
        },
      });

      if (!existing) {
        const mapping = await prisma.classSubject.create({
          data: {
            tenantId,
            schoolId,
            gradeLevelId: dto.gradeLevelId,
            subjectId,
            academicYearId: dto.academicYearId,
            sectionId,
            isMandatory: dto.isMandatory !== undefined ? dto.isMandatory : true,
            status: 'ACTIVE',
          },
        });
        mappingsCreated.push(mapping);
      }
    }

    if (mappingsCreated.length > 0) {
      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId,
        action: 'CLASS_SUBJECT_BULK_MAPPED',
        entityType: 'ClassSubject',
        newValues: { gradeLevelId: dto.gradeLevelId, subjectIds: dto.subjectIds },
      });
    }

    return { count: mappingsCreated.length, data: mappingsCreated };
  },

  listMappings: async (
    tenantId: string,
    schoolId: string,
    academicYearId: string,
    gradeLevelId?: string,
    sectionId?: string,
  ) => {
    return prisma.classSubject.findMany({
      where: {
        tenantId,
        schoolId,
        academicYearId,
        gradeLevelId: gradeLevelId || undefined,
        sectionId: sectionId || undefined,
        status: { not: 'ARCHIVED' },
      },
      include: {
        gradeLevel: { select: { name: true, code: true } },
        subject: { select: { name: true, code: true, subjectType: true } },
        academicYear: { select: { name: true } },
        section: { select: { name: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });
  },

  unmapSubject: async (
    tenantId: string,
    schoolId: string,
    id: string,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await prisma.classSubject.findFirst({ where: { id, tenantId, schoolId } });
    if (!existing) throw new AppError(404, 'Mapping not found');

    const updated = await prisma.classSubject.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CLASS_SUBJECT_UNMAPPED',
      entityType: 'ClassSubject',
      entityId: id,
    });

    return updated;
  },

  // 10. ROLES & PERMISSIONS
  seedDefaultRoles: async (tenantId: string, schoolId: string) => {
    const defaultRoles = [
      {
        code: 'SCHOOL_ADMIN',
        name: 'School Administrator',
        description: 'System role with full management permissions over school workspace.',
        permissions: ALLOWED_SCHOOL_PERMISSIONS,
        isSystem: true,
      },
      {
        code: 'PRINCIPAL',
        name: 'Principal',
        description: 'Academic and administrative lead role.',
        permissions: [
          'school.profile.read',
          'academic_year.read',
          'department.read',
          'class.read',
          'section.read',
          'subject.read',
          'subject_mapping.read',
          'audit.read',
        ],
        isSystem: true,
      },
      {
        code: 'TEACHER',
        name: 'Teacher',
        description: 'Academic classroom instructor.',
        permissions: [
          'academic_year.read',
          'class.read',
          'section.read',
          'subject.read',
          'subject_mapping.read',
        ],
        isSystem: true,
      },
      {
        code: 'ACCOUNTANT',
        name: 'Accountant',
        description: 'Finance and audit operations.',
        permissions: ['school.profile.read', 'academic_year.read'],
        isSystem: true,
      },
    ];

    for (const r of defaultRoles) {
      const existing = await prisma.role.findUnique({
        where: { tenantId_schoolId_code: { tenantId, schoolId, code: r.code } },
      });
      if (!existing) {
        await prisma.role.create({
          data: {
            tenantId,
            schoolId,
            name: r.name,
            code: r.code,
            scope: 'SCHOOL',
            isSystem: r.isSystem,
            description: r.description,
            permissions: r.permissions,
          },
        });
      }
    }
  },

  validatePermissions: (permissions?: string[]) => {
    if (!permissions) return;
    for (const p of permissions) {
      if (!ALLOWED_SCHOOL_PERMISSIONS.includes(p)) {
        throw new AppError(
          400,
          `Permission '${p}' is not allowed at school level. Platform privilege escalation rejected.`,
        );
      }
    }
  },

  createRole: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const code = dto.code.toUpperCase().trim();
    schoolService.validatePermissions(dto.permissions);

    const existing = await prisma.role.findUnique({
      where: { tenantId_schoolId_code: { tenantId, schoolId, code } },
    });
    if (existing) throw new AppError(409, `Role code '${code}' already exists`);

    const role = await prisma.role.create({
      data: {
        tenantId,
        schoolId,
        name: dto.name,
        code,
        scope: 'SCHOOL',
        isSystem: false,
        description: dto.description,
        permissions: dto.permissions || [],
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ROLE_CREATED',
      entityType: 'Role',
      entityId: role.id,
      newValues: { name: role.name, code: role.code },
    });

    return role;
  },

  listRoles: async (tenantId: string, schoolId: string) => {
    await schoolService.seedDefaultRoles(tenantId, schoolId);
    return prisma.role.findMany({
      where: { tenantId, schoolId },
      orderBy: { name: 'asc' },
    });
  },

  getRole: async (tenantId: string, schoolId: string, id: string) => {
    const role = await prisma.role.findFirst({ where: { id, tenantId, schoolId } });
    if (!role) throw new AppError(404, 'Role not found');
    return role;
  },

  updateRole: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getRole(tenantId, schoolId, id);
    if (existing.isSystem) throw new AppError(400, 'Cannot modify system roles');
    schoolService.validatePermissions(dto.permissions);

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ROLE_UPDATED',
      entityType: 'Role',
      entityId: id,
    });

    return updated;
  },

  updateRolePermissions: async (
    tenantId: string,
    schoolId: string,
    id: string,
    permissions: string[],
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await schoolService.getRole(tenantId, schoolId, id);
    if (existing.isSystem) throw new AppError(400, 'Cannot modify system roles');
    schoolService.validatePermissions(permissions);

    const updated = await prisma.role.update({
      where: { id },
      data: { permissions },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'ROLE_PERMISSIONS_UPDATED',
      entityType: 'Role',
      entityId: id,
    });

    return updated;
  },

  // 11. AUDIT LOGS
  listAuditLogs: async (tenantId: string, schoolId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { tenantId, schoolId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: { tenantId, schoolId } }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
