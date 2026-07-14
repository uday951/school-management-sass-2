import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import { OnboardingRequestStatus, ChildClaimStatus, StudentStatus, EnrollmentStatus, UserType, UserStatus } from '@prisma/client';
import { inviteService } from './invite.service';
import { studentService } from './student.service';
import * as argon2 from 'argon2';

async function getOrCreateSystemRole(tenantId: string, schoolId: string, name: string, code: string) {
  let role = await prisma.role.findFirst({
    where: { tenantId, schoolId, code }
  });
  if (!role) {
    role = await prisma.role.create({
      data: {
        tenantId,
        schoolId,
        name,
        code,
        scope: 'SCHOOL',
        isSystem: true,
        permissions: []
      }
    });
  }
  return role;
}

export const onboardingService = {
  // 1. STUDENT REGISTRATION
  submitStudentRequest: async (
    publicCode: string,
    dto: {
      personalData: any;
      admissionData: any;
      addressData?: any;
      guardianData?: any;
    }
  ) => {
    // A. Resolve invite securely
    const invite = await inviteService.resolveInvite(publicCode);

    // B. Save onboarding request
    const request = await prisma.studentOnboardingRequest.create({
      data: {
        tenantId: invite.tenantId,
        schoolId: invite.schoolId,
        inviteId: invite.id,
        requestedAcademicYearId: invite.academicYear?.id || null,
        requestedClassId: invite.class?.id || null,
        requestedSectionId: invite.section?.id || null,
        personalData: dto.personalData,
        admissionData: dto.admissionData,
        addressData: dto.addressData || null,
        guardianData: dto.guardianData || null,
        status: OnboardingRequestStatus.PENDING,
      }
    });

    // C. Increment usage count
    await prisma.schoolInvite.update({
      where: { id: invite.id },
      data: { usageCount: { increment: 1 } }
    });

    return request;
  },

  // 2. ADMIN STUDENT QUEUE
  getStudentQueue: async (
    tenantId: string,
    schoolId: string,
    params: {
      status?: OnboardingRequestStatus;
      page: number;
      limit: number;
    }
  ) => {
    const skip = (params.page - 1) * params.limit;
    const where: any = { tenantId, schoolId };
    if (params.status) where.status = params.status;

    const [total, requests] = await Promise.all([
      prisma.studentOnboardingRequest.count({ where }),
      prisma.studentOnboardingRequest.findMany({
        where,
        include: {
          academicYear: { select: { name: true } },
          class: { select: { name: true } },
          section: { select: { name: true } },
          invite: { select: { publicCode: true, inviteType: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit
      })
    ]);

    return { total, requests };
  },

  // 3. ADMIN REVIEW STUDENT ONBOARDING
  reviewStudentRequest: async (
    tenantId: string,
    schoolId: string,
    requestId: string,
    action: 'APPROVE' | 'REJECT' | 'CORRECT',
    params: {
      message?: string; // Correction details or rejection reason
      createLoginAccount?: boolean;
      loginEmail?: string;
      temporaryPassword?: string;
      academicYearId?: string;
      classId?: string;
      sectionId?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) => {
    const request = await prisma.studentOnboardingRequest.findFirst({
      where: { id: requestId, tenantId, schoolId }
    });

    if (!request) throw new AppError(404, 'Student onboarding request not found');
    if (request.status !== OnboardingRequestStatus.PENDING && request.status !== OnboardingRequestStatus.NEEDS_CORRECTION) {
      throw new AppError(400, 'Request is not in a reviewable status');
    }

    if (action === 'REJECT') {
      const updated = await prisma.studentOnboardingRequest.update({
        where: { id: requestId },
        data: {
          status: OnboardingRequestStatus.REJECTED,
          rejectionReason: params.message || 'Rejected by School Administrator',
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });

      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId,
        action: 'STUDENT_ONBOARDING_REJECTED',
        entityType: 'StudentOnboardingRequest',
        entityId: requestId,
        newValues: { status: OnboardingRequestStatus.REJECTED, reason: params.message }
      });

      return updated;
    }

    if (action === 'CORRECT') {
      const updated = await prisma.studentOnboardingRequest.update({
        where: { id: requestId },
        data: {
          status: OnboardingRequestStatus.NEEDS_CORRECTION,
          correctionMessage: params.message || 'Correction requested',
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });

      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId,
        action: 'STUDENT_ONBOARDING_CORRECTION_REQUESTED',
        entityType: 'StudentOnboardingRequest',
        entityId: requestId,
        newValues: { status: OnboardingRequestStatus.NEEDS_CORRECTION, message: params.message }
      });

      return updated;
    }

    // APPROVE FLOW
    const personal = request.personalData as any;
    const admission = request.admissionData as any;
    const address = (request.addressData || {}) as any;
    const guardian = (request.guardianData || {}) as any;

    const academicYearId = params.academicYearId || request.requestedAcademicYearId;
    const classId = params.classId || request.requestedClassId;
    const sectionId = params.sectionId || request.requestedSectionId;

    if (!academicYearId || !classId || !sectionId) {
      throw new AppError(400, 'Placement Academic Year, Class, and Section are required to approve the student');
    }

    // A. Verify placement references
    const [year, level, sec] = await Promise.all([
      prisma.academicYear.findFirst({ where: { id: academicYearId, tenantId, schoolId } }),
      prisma.gradeLevel.findFirst({ where: { id: classId, tenantId, schoolId } }),
      prisma.section.findFirst({ where: { id: sectionId, tenantId, schoolId, gradeLevelId: classId } }),
    ]);

    if (!year || year.status === 'ARCHIVED') throw new AppError(400, 'Placement Academic Year not active');
    if (!level || level.status === 'ARCHIVED') throw new AppError(400, 'Placement Class Level not active');
    if (!sec || sec.status === 'ARCHIVED') throw new AppError(400, 'Placement Section not active');

    // Update the request placement values so they are stored in the db
    await prisma.studentOnboardingRequest.update({
      where: { id: requestId },
      data: {
        requestedAcademicYearId: academicYearId,
        requestedClassId: classId,
        requestedSectionId: sectionId
      }
    });

    // B. Map guardians list
    const guardiansList = [];
    if (guardian.firstName && guardian.lastName) {
      // Check existing guardian by email/phone
      let existingGuardian = null;
      if (guardian.email) {
        existingGuardian = await prisma.guardian.findFirst({
          where: { tenantId, schoolId, email: guardian.email }
        });
      }
      if (!existingGuardian && guardian.phone) {
        existingGuardian = await prisma.guardian.findFirst({
          where: { tenantId, schoolId, phone: guardian.phone }
        });
      }

      guardiansList.push({
        guardianId: existingGuardian ? existingGuardian.id : undefined,
        firstName: guardian.firstName,
        lastName: guardian.lastName,
        relationship: guardian.relationship || 'FATHER',
        phone: guardian.phone || '',
        email: guardian.email || '',
        isPrimary: true,
        isEmergencyContact: true,
        isAuthorizedPickup: true,
        receivesAcademicUpdates: true,
        receivesAttendanceUpdates: true,
        receivesFeeUpdates: true,
        hasPortalAccess: false
      });
    }

    // C. Invoke studentService to create records
    const { student } = await studentService.createStudent(
      tenantId,
      schoolId,
      {
        firstName: personal.firstName,
        middleName: personal.middleName || '',
        lastName: personal.lastName,
        dateOfBirth: new Date(personal.dateOfBirth).toISOString(),
        gender: personal.gender,
        personalEmail: personal.personalEmail || '',
        personalPhone: personal.personalPhone || '',
        admissionNumber: admission.admissionNumber,
        admissionDate: new Date(admission.admissionDate).toISOString(),
        currentAddressLine1: address.currentAddressLine1 || '',
        currentAddressLine2: address.currentAddressLine2 || '',
        currentCity: address.currentCity || '',
        currentState: address.currentState || '',
        currentCountry: address.currentCountry || 'India',
        currentPostalCode: address.currentPostalCode || '',
        sameAsCurrentAddress: true,
        enrollment: {
          academicYearId,
          gradeLevelId: classId,
          sectionId,
          rollNumber: admission.rollNumber || undefined
        },
        guardians: guardiansList
      },
      actorUserId,
      actorEmail
    );

    // D. Optional user account creation
    if (params.createLoginAccount && params.loginEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: params.loginEmail }
      });
      if (existingUser) {
        throw new AppError(409, `Account email '${params.loginEmail}' is already registered`);
      }

      const tempPass = params.temporaryPassword || 'TempPass123!';
      const passwordHash = await argon2.hash(tempPass);

      const studRole = await getOrCreateSystemRole(tenantId, schoolId, 'Student', 'STUDENT');

      const studentUser = await prisma.user.create({
        data: {
          tenantId,
          firstName: personal.firstName,
          lastName: personal.lastName,
          email: params.loginEmail.toLowerCase().trim(),
          passwordHash,
          userType: UserType.STUDENT,
          roleId: studRole.id,
          status: UserStatus.ACTIVE,
        }
      });

      // Link User in Student profile
      await prisma.student.update({
        where: { id: student.id },
        data: { userId: studentUser.id }
      });
    }

    // E. Fetch enrollments created to return values
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { studentId: student.id }
    });

    const updated = await prisma.studentOnboardingRequest.update({
      where: { id: requestId },
      data: {
        status: OnboardingRequestStatus.APPROVED,
        createdStudentId: student.id,
        createdEnrollmentId: enrollments.length > 0 ? enrollments[0].id : null,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'STUDENT_ONBOARDING_APPROVED',
      entityType: 'StudentOnboardingRequest',
      entityId: requestId,
      newValues: { status: OnboardingRequestStatus.APPROVED, createdStudentId: student.id }
    });

    return updated;
  },

  // 4. GUARDIAN CHILD CLAIM WORKFLOWS
  submitChildClaimRequest: async (
    tenantId: string,
    guardianUserId: string,
    dto: {
      studentAdmissionNumber: string;
      studentDateOfBirth: string;
      relationship: string;
      guardianData?: any;
    }
  ) => {
    // Verify target student exists under tenant context using admission number + DOB
    const dob = new Date(dto.studentDateOfBirth);
    // Note: MongoDB dates matches exactly if we search by date range or ignore time.
    // To ignore time, we filter by date ranges on the DOB field.
    const startOfDay = new Date(dob.setHours(0,0,0,0));
    const endOfDay = new Date(dob.setHours(23,59,59,999));

    const student = await prisma.student.findFirst({
      where: {
        tenantId,
        admissionNumber: dto.studentAdmissionNumber,
        dateOfBirth: { gte: startOfDay, lte: endOfDay }
      }
    });

    // Abuse prevention/Enumeration guard: Return a generic error if mismatch to prevent guessing details
    if (!student) {
      throw new AppError(404, 'Student credentials matching your input were not found inside this school. Please verify the details.');
    }

    // Check if claim already exists
    const existing = await prisma.childClaimRequest.findFirst({
      where: {
        tenantId,
        guardianUserId,
        studentId: student.id,
        status: ChildClaimStatus.PENDING
      }
    });
    if (existing) {
      throw new AppError(409, 'A claim request is already pending for this student.');
    }

    const claim = await prisma.childClaimRequest.create({
      data: {
        tenantId,
        guardianUserId,
        studentId: student.id,
        studentAdmissionNumber: dto.studentAdmissionNumber,
        studentDateOfBirth: new Date(dto.studentDateOfBirth),
        relationship: dto.relationship,
        guardianData: dto.guardianData || null,
        status: ChildClaimStatus.PENDING
      }
    });

    return claim;
  },

  // 5. ADMIN GUARDIAN QUEUE
  getGuardianClaimsQueue: async (
    tenantId: string,
    schoolId: string,
    params: {
      status?: ChildClaimStatus;
      page: number;
      limit: number;
    }
  ) => {
    const skip = (params.page - 1) * params.limit;
    const where: any = { tenantId };
    if (params.status) where.status = params.status;

    // Filter claims by students belonging to the specific schoolId
    where.student = { schoolId };

    const [total, claims] = await Promise.all([
      prisma.childClaimRequest.count({ where }),
      prisma.childClaimRequest.findMany({
        where,
        include: {
          guardianUser: { select: { firstName: true, lastName: true, email: true, phone: true } },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
              schoolId: true,
              guardians: {
                include: {
                  guardian: {
                    select: { firstName: true, lastName: true, email: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit
      })
    ]);

    return { total, claims };
  },

  // 6. ADMIN REVIEW GUARDIAN CLAIM
  reviewChildClaim: async (
    tenantId: string,
    schoolId: string,
    claimId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason: string | undefined,
    actorUserId: string,
    actorEmail: string
  ) => {
    const claim = await prisma.childClaimRequest.findFirst({
      where: { id: claimId, tenantId },
      include: {
        guardianUser: true,
        student: true
      }
    });

    if (!claim) throw new AppError(404, 'Claim request not found');
    if (claim.status !== ChildClaimStatus.PENDING) {
      throw new AppError(400, 'Claim request is already reviewed');
    }
    if (!claim.student || claim.student.schoolId !== schoolId) {
      throw new AppError(403, 'Permission denied: cross-school claim review');
    }

    if (action === 'REJECT') {
      const updated = await prisma.childClaimRequest.update({
        where: { id: claimId },
        data: {
          status: ChildClaimStatus.REJECTED,
          rejectionReason: rejectionReason || 'Rejected by School Administrator',
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });

      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId,
        action: 'CHILD_CLAIM_REJECTED',
        entityType: 'ChildClaimRequest',
        entityId: claimId,
        newValues: { status: ChildClaimStatus.REJECTED }
      });

      return updated;
    }

    // APPROVE FLOW
    // 1. Get or create Guardian record mapping user context
    let guardian = await prisma.guardian.findFirst({
      where: { tenantId, schoolId, userId: claim.guardianUserId }
    });

    if (!guardian) {
      // Check if guardian email matches any unlinked guardian profile in school
      guardian = await prisma.guardian.findFirst({
        where: { tenantId, schoolId, email: claim.guardianUser.email, userId: null }
      });

      if (guardian) {
        // Link existing guardian profile
        guardian = await prisma.guardian.update({
          where: { id: guardian.id },
          data: { userId: claim.guardianUserId }
        });
      } else {
        // Create new Guardian profile
        guardian = await prisma.guardian.create({
          data: {
            tenantId,
            schoolId,
            userId: claim.guardianUserId,
            firstName: claim.guardianUser.firstName,
            lastName: claim.guardianUser.lastName,
            phone: claim.guardianUser.phone || '',
            email: claim.guardianUser.email,
            status: 'ACTIVE'
          }
        });
      }
    }

    // 2. Create StudentGuardian linkage relation
    const existingLink = await prisma.studentGuardian.findFirst({
      where: { tenantId, schoolId, studentId: claim.studentId!, guardianId: guardian.id }
    });

    if (!existingLink) {
      // Verify if other guardians are primary
      const primaryExists = await prisma.studentGuardian.findFirst({
        where: { tenantId, schoolId, studentId: claim.studentId!, isPrimary: true }
      });

      await prisma.studentGuardian.create({
        data: {
          tenantId,
          schoolId,
          studentId: claim.studentId!,
          guardianId: guardian.id,
          relationship: claim.relationship,
          isPrimary: !primaryExists,
          isEmergencyContact: true,
          isAuthorizedPickup: true,
          receivesAcademicUpdates: true,
          receivesAttendanceUpdates: true,
          receivesFeeUpdates: true,
          hasPortalAccess: true
        }
      });
    }

    // 3. Map role to Guardian User
    const parentRole = await getOrCreateSystemRole(tenantId, schoolId, 'Parent/Guardian', 'PARENT');
    await prisma.user.update({
      where: { id: claim.guardianUserId },
      data: { roleId: parentRole.id }
    });

    const updated = await prisma.childClaimRequest.update({
      where: { id: claimId },
      data: {
        status: ChildClaimStatus.APPROVED,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CHILD_CLAIM_APPROVED',
      entityType: 'ChildClaimRequest',
      entityId: claimId,
      newValues: { status: ChildClaimStatus.APPROVED, guardianId: guardian.id, studentId: claim.studentId }
    });

    return updated;
  }
};
