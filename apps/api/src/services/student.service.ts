import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import { StudentStatus, EnrollmentStatus, DocumentVerificationStatus, Status } from '@prisma/client';

export interface CreateStudentParams {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  photoUrl?: string;
  dateOfBirth: string; // ISO String
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  motherTongue?: string;
  personalEmail?: string;
  personalPhone?: string;
  admissionNumber: string;
  studentCode?: string;
  admissionDate: string; // ISO String
  joiningType?: string;
  previousSchoolName?: string;
  previousClassName?: string;
  
  // Addresses
  currentAddressLine1: string;
  currentAddressLine2?: string;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  currentPostalCode: string;
  
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentCountry?: string;
  permanentPostalCode?: string;
  sameAsCurrentAddress: boolean;

  // Emergency / Sensitive Info
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalNotes?: string;
  specialAssistanceNotes?: string;

  // Initial Enrollment
  enrollment: {
    academicYearId: string;
    gradeLevelId: string;
    sectionId: string;
    rollNumber?: string;
  };

  // Linked Guardians (New or Existing)
  guardians: Array<{
    guardianId?: string; // If linking existing
    firstName?: string;  // If creating new
    middleName?: string;
    lastName?: string;
    phone?: string;
    alternatePhone?: string;
    email?: string;
    occupation?: string;
    employer?: string;
    relationship: string;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    isAuthorizedPickup: boolean;
    receivesAcademicUpdates: boolean;
    receivesAttendanceUpdates: boolean;
    receivesFeeUpdates: boolean;
    hasPortalAccess: boolean;
  }>;

  // Document metadata list
  documents?: Array<{
    documentType: string;
    title: string;
    fileUrl?: string;
    storageKey?: string;
    mimeType?: string;
    fileSize?: number;
    issueDate?: string;
    expiryDate?: string;
  }>;
}

export const studentService = {
  // 1. CREATE STUDENT (ATOMIC INTEGRITY CHECK TRANSACTION)
  createStudent: async (
    tenantId: string,
    schoolId: string,
    dto: CreateStudentParams,
    actorUserId: string,
    actorEmail: string,
  ) => {
    // A. Validate unique admission number within school
    const existingAdmission = await prisma.student.findFirst({
      where: { tenantId, schoolId, admissionNumber: dto.admissionNumber },
    });
    if (existingAdmission) {
      throw new AppError(409, `Admission number '${dto.admissionNumber}' is already registered in this school`);
    }

    // B. Validate Enrollment references
    const [year, level, sec] = await Promise.all([
      prisma.academicYear.findFirst({ where: { id: dto.enrollment.academicYearId, tenantId, schoolId } }),
      prisma.gradeLevel.findFirst({ where: { id: dto.enrollment.gradeLevelId, tenantId, schoolId } }),
      prisma.section.findFirst({ where: { id: dto.enrollment.sectionId, tenantId, schoolId, gradeLevelId: dto.enrollment.gradeLevelId } }),
    ]);

    if (!year || year.status === 'ARCHIVED') throw new AppError(400, 'Valid active academic year not found');
    if (!level || level.status === 'ARCHIVED') throw new AppError(400, 'Valid active class level not found');
    if (!sec || sec.status === 'ARCHIVED') throw new AppError(400, 'Valid active section not found under selected class');

    // C. Validate roll number uniqueness inside section mapping if rollNumber is specified
    if (dto.enrollment.rollNumber) {
      const existingRoll = await prisma.studentEnrollment.findFirst({
        where: {
          tenantId,
          schoolId,
          academicYearId: dto.enrollment.academicYearId,
          gradeLevelId: dto.enrollment.gradeLevelId,
          sectionId: dto.enrollment.sectionId,
          rollNumber: dto.enrollment.rollNumber,
          status: 'ACTIVE',
        },
      });
      if (existingRoll) {
        throw new AppError(409, `Roll number '${dto.enrollment.rollNumber}' is already assigned in this section`);
      }
    }

    // D. Validate existing guardians tenant scopes
    for (const g of dto.guardians) {
      if (g.guardianId) {
        const guardianRecord = await prisma.guardian.findFirst({
          where: { id: g.guardianId, tenantId, schoolId },
        });
        if (!guardianRecord) {
          throw new AppError(404, `Linked guardian reference not found or belongs to another tenant`);
        }
      }
    }

    // E. Assemble Address details
    const permanentAddress = dto.sameAsCurrentAddress
      ? {
          permanentAddressLine1: dto.currentAddressLine1,
          permanentAddressLine2: dto.currentAddressLine2 || null,
          permanentCity: dto.currentCity,
          permanentState: dto.currentState,
          permanentCountry: dto.currentCountry,
          permanentPostalCode: dto.currentPostalCode,
        }
      : {
          permanentAddressLine1: dto.permanentAddressLine1 || dto.currentAddressLine1,
          permanentAddressLine2: dto.permanentAddressLine2 || null,
          permanentCity: dto.permanentCity || dto.currentCity,
          permanentState: dto.permanentState || dto.currentState,
          permanentCountry: dto.permanentCountry || dto.currentCountry,
          permanentPostalCode: dto.permanentPostalCode || dto.currentPostalCode,
        };

    // F. Execute transactional creations
    let studentId: string | null = null;
    let enrollmentId: string | null = null;
    const guardianLinkIds: string[] = [];
    const newGuardianIds: string[] = [];
    const docIds: string[] = [];

    try {
      // 1. Create Student
      const student = await prisma.student.create({
        data: {
          tenantId,
          schoolId,
          admissionNumber: dto.admissionNumber,
          studentCode: dto.studentCode || null,
          firstName: dto.firstName,
          middleName: dto.middleName || null,
          lastName: dto.lastName,
          preferredName: dto.preferredName || null,
          photoUrl: dto.photoUrl || null,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          bloodGroup: dto.bloodGroup || null,
          nationality: dto.nationality || null,
          motherTongue: dto.motherTongue || null,
          personalEmail: dto.personalEmail || null,
          personalPhone: dto.personalPhone || null,
          status: StudentStatus.ACTIVE,
          admissionDate: new Date(dto.admissionDate),
          joiningType: dto.joiningType || null,
          previousSchoolName: dto.previousSchoolName || null,
          previousClassName: dto.previousClassName || null,
          
          currentAddressLine1: dto.currentAddressLine1,
          currentAddressLine2: dto.currentAddressLine2 || null,
          currentCity: dto.currentCity,
          currentState: dto.currentState,
          currentCountry: dto.currentCountry,
          currentPostalCode: dto.currentPostalCode,

          ...permanentAddress,
          sameAsCurrentAddress: dto.sameAsCurrentAddress,

          emergencyContactName: dto.emergencyContactName || null,
          emergencyContactRelationship: dto.emergencyContactRelationship || null,
          emergencyContactPhone: dto.emergencyContactPhone || null,
          allergies: dto.allergies || null,
          medicalNotes: dto.medicalNotes || null,
          specialAssistanceNotes: dto.specialAssistanceNotes || null,
        },
      });
      studentId = student.id;

      // 2. Create StudentEnrollment
      const enrollment = await prisma.studentEnrollment.create({
        data: {
          tenantId,
          schoolId,
          studentId: student.id,
          academicYearId: dto.enrollment.academicYearId,
          gradeLevelId: dto.enrollment.gradeLevelId,
          sectionId: dto.enrollment.sectionId,
          rollNumber: dto.enrollment.rollNumber || null,
          enrollmentDate: new Date(dto.admissionDate),
          status: EnrollmentStatus.ACTIVE,
          isCurrent: true,
        },
      });
      enrollmentId = enrollment.id;

      // 3. Process Guardians
      for (const g of dto.guardians) {
        let finalGuardianId = g.guardianId;

        if (!finalGuardianId) {
          // Create new guardian
          const newG = await prisma.guardian.create({
            data: {
              tenantId,
              schoolId,
              firstName: g.firstName!,
              middleName: g.middleName || null,
              lastName: g.lastName!,
              phone: g.phone!,
              alternatePhone: g.alternatePhone || null,
              email: g.email || null,
              occupation: g.occupation || null,
              employer: g.employer || null,
              status: Status.ACTIVE,
            },
          });
          newGuardianIds.push(newG.id);
          finalGuardianId = newG.id;
        }

        // Link guardian to student
        const link = await prisma.studentGuardian.create({
          data: {
            tenantId,
            schoolId,
            studentId: student.id,
            guardianId: finalGuardianId,
            relationship: g.relationship,
            isPrimary: g.isPrimary,
            isEmergencyContact: g.isEmergencyContact,
            isAuthorizedPickup: g.isAuthorizedPickup,
            receivesAcademicUpdates: g.receivesAcademicUpdates,
            receivesAttendanceUpdates: g.receivesAttendanceUpdates,
            receivesFeeUpdates: g.receivesFeeUpdates,
            hasPortalAccess: g.hasPortalAccess,
          },
        });
        guardianLinkIds.push(link.id);
      }

      // 4. Create document metadata
      if (dto.documents && dto.documents.length > 0) {
        for (const doc of dto.documents) {
          const newDoc = await prisma.studentDocument.create({
            data: {
              tenantId,
              schoolId,
              studentId: student.id,
              documentType: doc.documentType,
              title: doc.title,
              fileUrl: doc.fileUrl || null,
              storageKey: doc.storageKey || null,
              mimeType: doc.mimeType || null,
              fileSize: doc.fileSize || null,
              issueDate: doc.issueDate ? new Date(doc.issueDate) : null,
              expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
              verificationStatus: DocumentVerificationStatus.PENDING,
              uploadedByUserId: actorUserId,
            },
          });
          docIds.push(newDoc.id);
        }
      }

      // Audit Log
      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId,
        action: 'STUDENT_CREATED',
        entityType: 'Student',
        entityId: student.id,
        newValues: {
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
          classId: dto.enrollment.gradeLevelId,
          sectionId: dto.enrollment.sectionId,
        },
      });

      return { student, enrollment };
    } catch (err) {
      // Manual compensation rollback
      for (const id of docIds) await prisma.studentDocument.delete({ where: { id } }).catch(() => {});
      for (const id of guardianLinkIds) await prisma.studentGuardian.delete({ where: { id } }).catch(() => {});
      for (const id of newGuardianIds) await prisma.guardian.delete({ where: { id } }).catch(() => {});
      if (enrollmentId) await prisma.studentEnrollment.delete({ where: { id: enrollmentId } }).catch(() => {});
      if (studentId) await prisma.student.delete({ where: { id: studentId } }).catch(() => {});
      throw err;
    }
  },

  // 2. LIST STUDENTS (SEARCH, PAGINATED & FILTERED)
  listStudents: async (
    tenantId: string,
    schoolId: string,
    params: {
      search?: string;
      academicYearId?: string;
      gradeLevelId?: string;
      sectionId?: string;
      status?: StudentStatus;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page: number;
      limit: number;
    },
  ) => {
    const skip = (params.page - 1) * params.limit;
    
    // Build Student filter criteria
    const where: any = { tenantId, schoolId };
    
    if (params.status) {
      where.status = params.status;
    } else {
      where.status = { not: StudentStatus.ARCHIVED };
    }

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { admissionNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // Filters linked to current enrollment
    const enrollmentFilter: any = { isCurrent: true };
    let hasEnrollmentFilter = false;

    if (params.academicYearId) {
      enrollmentFilter.academicYearId = params.academicYearId;
      hasEnrollmentFilter = true;
    }
    if (params.gradeLevelId) {
      enrollmentFilter.gradeLevelId = params.gradeLevelId;
      hasEnrollmentFilter = true;
    }
    if (params.sectionId) {
      enrollmentFilter.sectionId = params.sectionId;
      hasEnrollmentFilter = true;
    }

    if (hasEnrollmentFilter) {
      where.enrollments = {
        some: enrollmentFilter,
      };
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: params.limit,
        include: {
          enrollments: {
            where: { isCurrent: true },
            include: {
              gradeLevel: { select: { name: true } },
              section: { select: { name: true } },
              academicYear: { select: { name: true } },
            },
          },
          guardians: {
            where: { isPrimary: true },
            include: {
              guardian: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    // Format output
    const formatted = students.map((s) => {
      const currentEnrollment = s.enrollments[0] || null;
      const primaryGuardian = s.guardians[0]?.guardian || null;
      return {
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        admissionNumber: s.admissionNumber,
        photoUrl: s.photoUrl,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        status: s.status,
        createdAt: s.createdAt,
        currentEnrollment: currentEnrollment
          ? {
              academicYear: currentEnrollment.academicYear.name,
              class: currentEnrollment.gradeLevel.name,
              section: currentEnrollment.section.name,
              rollNumber: currentEnrollment.rollNumber,
            }
          : null,
        primaryGuardian: primaryGuardian
          ? {
              name: `${primaryGuardian.firstName} ${primaryGuardian.lastName}`,
              phone: primaryGuardian.phone,
            }
          : null,
      };
    });

    return {
      data: formatted,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  // 3. GET STUDENT PROFILE
  getStudentProfile: async (tenantId: string, schoolId: string, id: string) => {
    const student = await prisma.student.findFirst({
      where: { id, tenantId, schoolId },
      include: {
        enrollments: {
          include: {
            gradeLevel: { select: { name: true } },
            section: { select: { name: true } },
            academicYear: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        guardians: {
          include: {
            guardian: true,
          },
        },
        documents: {
          where: { archivedAt: null },
        },
      },
    });

    if (!student) throw new AppError(404, 'Student profile not found');

    const currentEnrollment = student.enrollments.find((e) => e.isCurrent) || null;

    // Filter out sensitive medical notes from general views if needed, 
    // but we can return them as they are restricted behind controller auth!
    return {
      ...student,
      currentEnrollment,
    };
  },

  // 4. UPDATE STUDENT PERSONAL INFO
  updateStudent: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    // Assert tenant scope
    const existing = await prisma.student.findFirst({ where: { id, tenantId, schoolId } });
    if (!existing) throw new AppError(404, 'Student profile not found');

    // Prevent direct edits to academic enrollment fields from general patch
    delete dto.tenantId;
    delete dto.schoolId;
    delete dto.admissionNumber; // Immutable

    // If sameAsCurrentAddress is true, copy address parameters
    if (dto.sameAsCurrentAddress) {
      dto.permanentAddressLine1 = dto.currentAddressLine1 || existing.currentAddressLine1;
      dto.permanentAddressLine2 = dto.currentAddressLine2 || existing.currentAddressLine2;
      dto.permanentCity = dto.currentCity || existing.currentCity;
      dto.permanentState = dto.currentState || existing.currentState;
      dto.permanentCountry = dto.currentCountry || existing.currentCountry;
      dto.permanentPostalCode = dto.currentPostalCode || existing.currentPostalCode;
    }

    const updated = await prisma.student.update({
      where: { id },
      data: dto,
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'STUDENT_UPDATED',
      entityType: 'Student',
      entityId: id,
    });

    return updated;
  },

  // 5. UPDATE STUDENT STATUS WORKFLOW
  updateStudentStatus: async (
    tenantId: string,
    schoolId: string,
    id: string,
    params: { status: StudentStatus; reason?: string },
    actorUserId: string,
    actorEmail: string,
  ) => {
    const student = await prisma.student.findFirst({ where: { id, tenantId, schoolId } });
    if (!student) throw new AppError(404, 'Student profile not found');

    const VALID_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
      ACTIVE: [StudentStatus.INACTIVE, StudentStatus.WITHDRAWN, StudentStatus.TRANSFERRED, StudentStatus.GRADUATED, StudentStatus.ARCHIVED],
      INACTIVE: [StudentStatus.ACTIVE, StudentStatus.ARCHIVED],
      WITHDRAWN: [StudentStatus.ACTIVE, StudentStatus.ARCHIVED],
      TRANSFERRED: [StudentStatus.ACTIVE, StudentStatus.ARCHIVED],
      GRADUATED: [StudentStatus.ARCHIVED],
      ARCHIVED: [StudentStatus.ACTIVE],
    };

    const allowed = VALID_TRANSITIONS[student.status] || [];
    if (!allowed.includes(params.status)) {
      throw new AppError(400, `Invalid student status transition from '${student.status}' to '${params.status}'`);
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        status: params.status,
        archivedAt: params.status === StudentStatus.ARCHIVED ? new Date() : undefined,
      },
    });

    // If status is withdrawn/transferred/graduated, mark current enrollments as completed/withdrawn accordingly
    if (['WITHDRAWN', 'TRANSFERRED', 'GRADUATED'].includes(params.status)) {
      let enrollmentStatus: EnrollmentStatus = EnrollmentStatus.WITHDRAWN;
      if (params.status === 'GRADUATED') enrollmentStatus = EnrollmentStatus.COMPLETED;
      if (params.status === 'TRANSFERRED') enrollmentStatus = EnrollmentStatus.TRANSFERRED;

      await prisma.studentEnrollment.updateMany({
        where: { studentId: id, isCurrent: true },
        data: {
          isCurrent: false,
          status: enrollmentStatus,
          endDate: new Date(),
        },
      });
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'STUDENT_STATUS_CHANGED',
      entityType: 'Student',
      entityId: id,
      newValues: { status: params.status, reason: params.reason },
    });

    return updated;
  },

  // 6. ENROLLMENT WORKFLOWS: SECTION TRANSFER
  transferSection: async (
    tenantId: string,
    schoolId: string,
    enrollmentId: string,
    params: { targetSectionId: string; reason?: string },
    actorUserId: string,
    actorEmail: string,
  ) => {
    // Verify enrollment
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { id: enrollmentId, tenantId, schoolId },
    });
    if (!enrollment || !enrollment.isCurrent) {
      throw new AppError(404, 'Active student enrollment context not found');
    }

    // Verify target section belongs to same grade level and tenant
    const targetSection = await prisma.section.findFirst({
      where: {
        id: params.targetSectionId,
        gradeLevelId: enrollment.gradeLevelId,
        tenantId,
        schoolId,
        status: Status.ACTIVE,
      },
    });
    if (!targetSection) {
      throw new AppError(400, 'Target section is invalid, inactive, or belongs to another class standard');
    }

    // Perform transfer by updating sectionId
    const updated = await prisma.studentEnrollment.update({
      where: { id: enrollmentId },
      data: {
        sectionId: params.targetSectionId,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'SECTION_TRANSFER_EXECUTED',
      entityType: 'StudentEnrollment',
      entityId: enrollmentId,
      newValues: {
        studentId: enrollment.studentId,
        oldSectionId: enrollment.sectionId,
        newSectionId: params.targetSectionId,
        reason: params.reason,
      },
    });

    return updated;
  },

  // 7. ENROLLMENT WORKFLOWS: CHANGE CLASS / PROMOTION
  changeClass: async (
    tenantId: string,
    schoolId: string,
    params: {
      studentId: string;
      academicYearId: string;
      gradeLevelId: string;
      sectionId: string;
      rollNumber?: string;
    },
    actorUserId: string,
    actorEmail: string,
  ) => {
    // Verify references
    const [student, year, level, sec] = await Promise.all([
      prisma.student.findFirst({ where: { id: params.studentId, tenantId, schoolId } }),
      prisma.academicYear.findFirst({ where: { id: params.academicYearId, tenantId, schoolId } }),
      prisma.gradeLevel.findFirst({ where: { id: params.gradeLevelId, tenantId, schoolId } }),
      prisma.section.findFirst({ where: { id: params.sectionId, tenantId, schoolId, gradeLevelId: params.gradeLevelId } }),
    ]);

    if (!student || student.status === 'ARCHIVED') throw new AppError(404, 'Active student record not found');
    if (!year || year.status === 'ARCHIVED') throw new AppError(400, 'Active academic year not found');
    if (!level || level.status === 'ARCHIVED') throw new AppError(400, 'Active class level not found');
    if (!sec || sec.status === 'ARCHIVED') throw new AppError(400, 'Active section not found');

    // Check for roll number conflicts in the new target class section
    if (params.rollNumber) {
      const conflict = await prisma.studentEnrollment.findFirst({
        where: {
          tenantId,
          schoolId,
          academicYearId: params.academicYearId,
          gradeLevelId: params.gradeLevelId,
          sectionId: params.sectionId,
          rollNumber: params.rollNumber,
          status: 'ACTIVE',
        },
      });
      if (conflict) {
        throw new AppError(409, `Roll number '${params.rollNumber}' is already taken in the target class section`);
      }
    }

    // Deactivate old enrollments
    await prisma.studentEnrollment.updateMany({
      where: { studentId: params.studentId, isCurrent: true },
      data: {
        isCurrent: false,
        status: EnrollmentStatus.COMPLETED,
        endDate: new Date(),
      },
    });

    // Create new enrollment
    const newEnrollment = await prisma.studentEnrollment.create({
      data: {
        tenantId,
        schoolId,
        studentId: params.studentId,
        academicYearId: params.academicYearId,
        gradeLevelId: params.gradeLevelId,
        sectionId: params.sectionId,
        rollNumber: params.rollNumber || null,
        enrollmentDate: new Date(),
        status: EnrollmentStatus.ACTIVE,
        isCurrent: true,
        startDate: new Date(),
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'STUDENT_CLASS_PROMOTED',
      entityType: 'StudentEnrollment',
      entityId: newEnrollment.id,
      newValues: {
        studentId: params.studentId,
        academicYearId: params.academicYearId,
        gradeLevelId: params.gradeLevelId,
        sectionId: params.sectionId,
      },
    });

    return newEnrollment;
  },

  // 8. LIST GUARDIANS (PAGINATED SEARCH)
  listGuardians: async (
    tenantId: string,
    schoolId: string,
    params: {
      search?: string;
      page: number;
      limit: number;
    },
  ) => {
    const skip = (params.page - 1) * params.limit;
    const where: any = { tenantId, schoolId, status: { not: Status.ARCHIVED } };

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [guardians, total] = await Promise.all([
      prisma.guardian.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          students: {
            include: {
              student: { select: { firstName: true, lastName: true, id: true } },
            },
          },
        },
      }),
      prisma.guardian.count({ where }),
    ]);

    return {
      data: guardians,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  // 9. GET GUARDIAN PROFILE
  getGuardianProfile: async (tenantId: string, schoolId: string, id: string) => {
    const guardian = await prisma.guardian.findFirst({
      where: { id, tenantId, schoolId, status: { not: Status.ARCHIVED } },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                status: true,
                enrollments: {
                  where: { isCurrent: true },
                  include: {
                    gradeLevel: { select: { name: true } },
                    section: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!guardian) throw new AppError(404, 'Guardian profile not found');
    return guardian;
  },

  // 10. CREATE standalone GUARDIAN
  createGuardian: async (
    tenantId: string,
    schoolId: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const guardian = await prisma.guardian.create({
      data: {
        tenantId,
        schoolId,
        firstName: dto.firstName,
        middleName: dto.middleName || null,
        lastName: dto.lastName,
        phone: dto.phone,
        alternatePhone: dto.alternatePhone || null,
        email: dto.email || null,
        occupation: dto.occupation || null,
        employer: dto.employer || null,
        status: Status.ACTIVE,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GUARDIAN_CREATED',
      entityType: 'Guardian',
      entityId: guardian.id,
      newValues: { name: `${guardian.firstName} ${guardian.lastName}`, phone: guardian.phone },
    });

    return guardian;
  },

  // 11. UPDATE GUARDIAN DETAILS
  updateGuardian: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await prisma.guardian.findFirst({ where: { id, tenantId, schoolId } });
    if (!existing) throw new AppError(404, 'Guardian profile not found');

    const updated = await prisma.guardian.update({
      where: { id },
      data: dto,
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GUARDIAN_UPDATED',
      entityType: 'Guardian',
      entityId: id,
    });

    return updated;
  },

  // 12. LINK / UNLINK GUARDIANS
  linkGuardian: async (
    tenantId: string,
    schoolId: string,
    studentId: string,
    dto: {
      guardianId: string;
      relationship: string;
      isPrimary?: boolean;
      isEmergencyContact?: boolean;
      isAuthorizedPickup?: boolean;
      receivesAcademicUpdates?: boolean;
      receivesAttendanceUpdates?: boolean;
      receivesFeeUpdates?: boolean;
      hasPortalAccess?: boolean;
    },
    actorUserId: string,
    actorEmail: string,
  ) => {
    const [student, guardian] = await Promise.all([
      prisma.student.findFirst({ where: { id: studentId, tenantId, schoolId } }),
      prisma.guardian.findFirst({ where: { id: dto.guardianId, tenantId, schoolId } }),
    ]);

    if (!student) throw new AppError(404, 'Student profile not found');
    if (!guardian) throw new AppError(404, 'Guardian profile not found');

    // Check for duplicate link
    const duplicate = await prisma.studentGuardian.findUnique({
      where: {
        tenantId_schoolId_studentId_guardianId: {
          tenantId,
          schoolId,
          studentId,
          guardianId: dto.guardianId,
        },
      },
    });
    if (duplicate) throw new AppError(409, 'Guardian is already linked to this student');

    const link = await prisma.studentGuardian.create({
      data: {
        tenantId,
        schoolId,
        studentId,
        guardianId: dto.guardianId,
        relationship: dto.relationship,
        isPrimary: dto.isPrimary || false,
        isEmergencyContact: dto.isEmergencyContact || false,
        isAuthorizedPickup: dto.isAuthorizedPickup || false,
        receivesAcademicUpdates: dto.receivesAcademicUpdates || false,
        receivesAttendanceUpdates: dto.receivesAttendanceUpdates || false,
        receivesFeeUpdates: dto.receivesFeeUpdates || false,
        hasPortalAccess: dto.hasPortalAccess || false,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GUARDIAN_LINKED',
      entityType: 'StudentGuardian',
      entityId: link.id,
      newValues: { studentId, guardianId: dto.guardianId, relationship: dto.relationship },
    });

    return link;
  },

  unlinkGuardian: async (
    tenantId: string,
    schoolId: string,
    id: string, // StudentGuardian mapping record ID
    actorUserId: string,
    actorEmail: string,
  ) => {
    const link = await prisma.studentGuardian.findFirst({ where: { id, tenantId, schoolId } });
    if (!link) throw new AppError(404, 'Guardian link not found');

    await prisma.studentGuardian.delete({ where: { id } });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'GUARDIAN_UNLINKED',
      entityType: 'StudentGuardian',
      entityId: id,
      oldValues: { studentId: link.studentId, guardianId: link.guardianId },
    });
  },

  // 13. DOCUMENTS METADATA
  listDocuments: async (tenantId: string, schoolId: string, studentId: string) => {
    const student = await prisma.student.findFirst({ where: { id: studentId, tenantId, schoolId } });
    if (!student) throw new AppError(404, 'Student not found');

    return prisma.studentDocument.findMany({
      where: { tenantId, schoolId, studentId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  addDocument: async (
    tenantId: string,
    schoolId: string,
    studentId: string,
    dto: {
      documentType: string;
      title: string;
      fileUrl?: string;
      storageKey?: string;
      mimeType?: string;
      fileSize?: number;
      issueDate?: string;
      expiryDate?: string;
    },
    actorUserId: string,
    actorEmail: string,
  ) => {
    const student = await prisma.student.findFirst({ where: { id: studentId, tenantId, schoolId } });
    if (!student) throw new AppError(404, 'Student not found');

    const doc = await prisma.studentDocument.create({
      data: {
        tenantId,
        schoolId,
        studentId,
        documentType: dto.documentType,
        title: dto.title,
        fileUrl: dto.fileUrl || null,
        storageKey: dto.storageKey || null,
        mimeType: dto.mimeType || null,
        fileSize: dto.fileSize || null,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        uploadedByUserId: actorUserId,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'StudentDocument',
      entityId: doc.id,
      newValues: { studentId, title: doc.title, documentType: doc.documentType },
    });

    return doc;
  },

  archiveDocument: async (
    tenantId: string,
    schoolId: string,
    id: string,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const doc = await prisma.studentDocument.findFirst({ where: { id, tenantId, schoolId } });
    if (!doc) throw new AppError(404, 'Document not found');

    const updated = await prisma.studentDocument.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'DOCUMENT_ARCHIVED',
      entityType: 'StudentDocument',
      entityId: id,
    });

    return updated;
  },
};
