import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import * as argon2 from 'argon2';
import {
  EmployeeType,
  EmploymentType,
  EmployeeStatus,
  Status,
  DocumentVerificationStatus,
} from '@prisma/client';

export interface CreateEmployeeParams {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  photoUrl?: string;
  dateOfBirth?: string; // ISO Date String
  gender?: string;
  bloodGroup?: string;
  personalEmail?: string;
  workEmail?: string;
  personalPhone?: string;
  workPhone?: string;
  employeeType: EmployeeType;
  employmentType: EmploymentType;
  designation: string;
  primaryDepartmentId?: string;
  joiningDate: string; // ISO Date String
  confirmationDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  reportingManagerEmployeeId?: string;
  
  // Addresses
  currentAddressLine1?: string;
  currentAddressLine2?: string;
  currentCity?: string;
  currentState?: string;
  currentCountry?: string;
  currentPostalCode?: string;

  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentCountry?: string;
  permanentPostalCode?: string;
  sameAsCurrentAddress: boolean;

  // Emergency
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  notes?: string;

  // Account creation toggle
  createLoginAccount?: boolean;
  loginEmail?: string;
  schoolRoleId?: string;
  temporaryPassword?: string;
}

export const employeeService = {
  // 1. CREATE EMPLOYEE (WITH OPTIONAL ACCOUNT INTEGRITY TRANSACTION)
  createEmployee: async (
    tenantId: string,
    schoolId: string,
    dto: CreateEmployeeParams,
    actorUserId: string,
    actorEmail: string,
  ) => {
    // Check school status - block if suspended or archived
    const school = await prisma.school.findFirst({
      where: { id: schoolId, tenantId },
    });
    if (!school) throw new AppError(404, 'School workspace not found');
    if (school.status === 'SUSPENDED' || school.status === 'ARCHIVED') {
      throw new AppError(403, `Access denied. School workspace is currently ${school.status}`);
    }

    // A. Check employee number uniqueness inside tenant/school
    const employeeNumber = `EMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const existingEmp = await prisma.employee.findFirst({
      where: { tenantId, schoolId, employeeNumber },
    });
    if (existingEmp) {
      throw new AppError(409, `Employee number '${employeeNumber}' already exists`);
    }

    // B. Check department exists in same tenant
    if (dto.primaryDepartmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: dto.primaryDepartmentId, tenantId, schoolId, status: { not: Status.ARCHIVED } },
      });
      if (!dept) throw new AppError(404, 'Primary Department not found or archived');
    }

    // C. Handle optional account creation
    let userId: string | null = null;
    if (dto.createLoginAccount) {
      if (!dto.loginEmail) throw new AppError(400, 'Login email is required for user account creation');
      if (!dto.schoolRoleId) throw new AppError(400, 'School workspace role is required');
      if (!dto.temporaryPassword) throw new AppError(400, 'Temporary password is required');

      // Verify email uniqueness
      const existingUser = await prisma.user.findUnique({
        where: { email: dto.loginEmail },
      });
      if (existingUser) {
        throw new AppError(409, `Login email '${dto.loginEmail}' is already registered to another user account`);
      }

      // Verify role belongs to tenant/school
      const role = await prisma.role.findFirst({
        where: { id: dto.schoolRoleId, tenantId, schoolId },
      });
      if (!role) throw new AppError(404, 'Selected workspace role is invalid or belongs to another school');

      // Hash password
      const passwordHash = await argon2.hash(dto.temporaryPassword);

      // Create user account
      const newUser = await prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.loginEmail,
          phone: dto.workPhone || dto.personalPhone || null,
          passwordHash,
          userType: 'SCHOOL_ADMIN', // Users inside school fall under general school admin access middleware
          tenantId,
          roleId: dto.schoolRoleId,
        },
      });
      userId = newUser.id;
    }

    // D. Assemble Addresses
    const permanentAddress = dto.sameAsCurrentAddress
      ? {
          permanentAddressLine1: dto.currentAddressLine1 || null,
          permanentAddressLine2: dto.currentAddressLine2 || null,
          permanentCity: dto.currentCity || null,
          permanentState: dto.currentState || null,
          permanentCountry: dto.currentCountry || 'India',
          permanentPostalCode: dto.currentPostalCode || null,
        }
      : {
          permanentAddressLine1: dto.permanentAddressLine1 || null,
          permanentAddressLine2: dto.permanentAddressLine2 || null,
          permanentCity: dto.permanentCity || null,
          permanentState: dto.permanentState || null,
          permanentCountry: dto.permanentCountry || 'India',
          permanentPostalCode: dto.permanentPostalCode || null,
        };

    let employeeId: string | null = null;
    try {
      const employee = await prisma.employee.create({
        data: {
          tenantId,
          schoolId,
          userId: userId || undefined,
          employeeNumber,
          firstName: dto.firstName,
          middleName: dto.middleName || null,
          lastName: dto.lastName,
          preferredName: dto.preferredName || null,
          photoUrl: dto.photoUrl || null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender || null,
          bloodGroup: dto.bloodGroup || null,
          personalEmail: dto.personalEmail || null,
          workEmail: dto.workEmail || null,
          personalPhone: dto.personalPhone || null,
          workPhone: dto.workPhone || null,
          employeeType: dto.employeeType,
          employmentType: dto.employmentType,
          designation: dto.designation,
          primaryDepartmentId: dto.primaryDepartmentId || null,
          joiningDate: new Date(dto.joiningDate),
          confirmationDate: dto.confirmationDate ? new Date(dto.confirmationDate) : null,
          contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : null,
          contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : null,
          reportingManagerEmployeeId: dto.reportingManagerEmployeeId || null,
          status: EmployeeStatus.ACTIVE,

          currentAddressLine1: dto.currentAddressLine1 || null,
          currentAddressLine2: dto.currentAddressLine2 || null,
          currentCity: dto.currentCity || null,
          currentState: dto.currentState || null,
          currentCountry: dto.currentCountry || 'India',
          currentPostalCode: dto.currentPostalCode || null,

          ...permanentAddress,
          sameAsCurrentAddress: dto.sameAsCurrentAddress,

          emergencyContactName: dto.emergencyContactName || null,
          emergencyContactRelationship: dto.emergencyContactRelationship || null,
          emergencyContactPhone: dto.emergencyContactPhone || null,
          notes: dto.notes || null,
        },
      });
      employeeId = employee.id;

      // Log audit
      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId,
        action: 'EMPLOYEE_CREATED',
        entityType: 'Employee',
        entityId: employee.id,
        newValues: { firstName: employee.firstName, lastName: employee.lastName, designation: employee.designation },
      });

      return employee;
    } catch (err) {
      // Rollback User account if employee creation fails
      if (userId) {
        await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      }
      throw err;
    }
  },

  // 2. LIST EMPLOYEES
  listEmployees: async (
    tenantId: string,
    schoolId: string,
    params: {
      search?: string;
      employeeType?: EmployeeType;
      employmentType?: EmploymentType;
      departmentId?: string;
      status?: EmployeeStatus;
      page: number;
      limit: number;
    },
  ) => {
    const skip = (params.page - 1) * params.limit;
    const where: any = { tenantId, schoolId };

    if (params.status) {
      where.status = params.status;
    } else {
      where.status = { not: EmployeeStatus.ARCHIVED };
    }

    if (params.employeeType) where.employeeType = params.employeeType;
    if (params.employmentType) where.employmentType = params.employmentType;
    if (params.departmentId) where.primaryDepartmentId = params.departmentId;

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { employeeNumber: { contains: params.search, mode: 'insensitive' } },
        { designation: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          primaryDepartment: { select: { name: true } },
          user: { select: { status: true, role: { select: { name: true } } } },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  // 3. GET EMPLOYEE PROFILE DETAIL
  getEmployeeProfile: async (tenantId: string, schoolId: string, id: string) => {
    const emp = await prisma.employee.findFirst({
      where: { id, tenantId, schoolId },
      include: {
        primaryDepartment: true,
        user: { select: { id: true, email: true, status: true, role: { select: { id: true, name: true } } } },
        qualifications: true,
        experiences: true,
        documents: { where: { archivedAt: null } },
        teacherAssignments: {
          include: {
            academicYear: { select: { name: true } },
            subject: { select: { name: true } },
            gradeLevel: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
        classTeacherAssignments: {
          include: {
            academicYear: { select: { name: true } },
            gradeLevel: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
        departmentHeadAssignments: {
          include: {
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!emp) throw new AppError(404, 'Employee record not found');
    return emp;
  },

  // 4. UPDATE EMPLOYEE DETAILS
  updateEmployee: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const existing = await prisma.employee.findFirst({ where: { id, tenantId, schoolId } });
    if (!existing) throw new AppError(404, 'Employee not found');

    // Strip primary keys
    delete dto.id;
    delete dto.tenantId;
    delete dto.schoolId;
    delete dto.employeeNumber; // Immutable
    delete dto.userId;

    if (dto.sameAsCurrentAddress) {
      dto.permanentAddressLine1 = dto.currentAddressLine1 || existing.currentAddressLine1;
      dto.permanentAddressLine2 = dto.currentAddressLine2 || existing.currentAddressLine2;
      dto.permanentCity = dto.currentCity || existing.currentCity;
      dto.permanentState = dto.currentState || existing.currentState;
      dto.permanentCountry = dto.currentCountry || existing.currentCountry;
      dto.permanentPostalCode = dto.currentPostalCode || existing.currentPostalCode;
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: dto,
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EMPLOYEE_UPDATED',
      entityType: 'Employee',
      entityId: id,
    });

    return updated;
  },

  // 5. STATUS LIFECYCLE MANAGEMENT
  updateStatus: async (
    tenantId: string,
    schoolId: string,
    id: string,
    params: { status: EmployeeStatus; reason?: string },
    actorUserId: string,
    actorEmail: string,
  ) => {
    const emp = await prisma.employee.findFirst({ where: { id, tenantId, schoolId } });
    if (!emp) throw new AppError(404, 'Employee not found');

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        status: params.status,
        archivedAt: params.status === EmployeeStatus.ARCHIVED ? new Date() : undefined,
      },
    });

    // If status is SUSPENDED, TERMINATED, or RESIGNED, suspend their User login account as well
    if (['SUSPENDED', 'TERMINATED', 'RESIGNED'].includes(params.status) && emp.userId) {
      await prisma.user.update({
        where: { id: emp.userId },
        data: { status: 'SUSPENDED' },
      });
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EMPLOYEE_STATUS_CHANGED',
      entityType: 'Employee',
      entityId: id,
      newValues: { status: params.status, reason: params.reason },
    });

    return updated;
  },

  // 6. MANAGE ACCOUNT ACCESS
  createAccount: async (
    tenantId: string,
    schoolId: string,
    id: string,
    dto: { loginEmail: string; schoolRoleId: string; temporaryPassword?: string },
    actorUserId: string,
    actorEmail: string,
  ) => {
    const emp = await prisma.employee.findFirst({ where: { id, tenantId, schoolId } });
    if (!emp) throw new AppError(404, 'Employee not found');
    if (emp.userId) throw new AppError(409, 'Employee already has an active user login account');

    // Email unique check
    const existingUser = await prisma.user.findUnique({ where: { email: dto.loginEmail } });
    if (existingUser) throw new AppError(409, 'Email address already registered to another user');

    // Role check
    const role = await prisma.role.findFirst({ where: { id: dto.schoolRoleId, tenantId, schoolId } });
    if (!role) throw new AppError(404, 'Selected workspace role is invalid');

    const tempPass = dto.temporaryPassword || 'Temp@Employee2026';
    const passwordHash = await argon2.hash(tempPass);

    const user = await prisma.user.create({
      data: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: dto.loginEmail,
        passwordHash,
        userType: 'SCHOOL_ADMIN',
        tenantId,
        roleId: dto.schoolRoleId,
      },
    });

    await prisma.employee.update({
      where: { id },
      data: { userId: user.id },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EMPLOYEE_ACCOUNT_LINKED',
      entityType: 'Employee',
      entityId: id,
      newValues: { userId: user.id },
    });

    return user;
  },

  updateAccountStatus: async (
    tenantId: string,
    schoolId: string,
    id: string,
    params: { active: boolean },
    actorUserId: string,
    actorEmail: string,
  ) => {
    const emp = await prisma.employee.findFirst({ where: { id, tenantId, schoolId } });
    if (!emp || !emp.userId) throw new AppError(404, 'Linked user account not found');

    const updatedUser = await prisma.user.update({
      where: { id: emp.userId },
      data: {
        status: params.active ? 'ACTIVE' : 'SUSPENDED',
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: params.active ? 'EMPLOYEE_ACCOUNT_ENABLED' : 'EMPLOYEE_ACCOUNT_DISABLED',
      entityType: 'Employee',
      entityId: id,
    });

    return updatedUser;
  },

  updateRoles: async (
    tenantId: string,
    schoolId: string,
    id: string,
    params: { schoolRoleId: string },
    actorUserId: string,
    actorEmail: string,
  ) => {
    const emp = await prisma.employee.findFirst({ where: { id, tenantId, schoolId } });
    if (!emp || !emp.userId) throw new AppError(404, 'Linked user account not found');

    const role = await prisma.role.findFirst({ where: { id: params.schoolRoleId, tenantId, schoolId } });
    if (!role) throw new AppError(404, 'Role not found or belongs to another tenant');

    const updatedUser = await prisma.user.update({
      where: { id: emp.userId },
      data: { roleId: params.schoolRoleId },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'EMPLOYEE_ROLES_MODIFIED',
      entityType: 'Employee',
      entityId: id,
      newValues: { roleId: params.schoolRoleId },
    });

    return updatedUser;
  },

  // 7. QUALIFICATIONS & EXPERIENCE
  addQualification: async (
    tenantId: string,
    schoolId: string,
    employeeId: string,
    dto: { qualificationName: string; specialization?: string; institution: string; universityOrBoard?: string; startYear?: number; completionYear?: number; gradeOrPercentage?: string },
  ) => {
    const emp = await prisma.employee.findFirst({ where: { id: employeeId, tenantId, schoolId } });
    if (!emp) throw new AppError(404, 'Employee not found');

    return prisma.employeeQualification.create({
      data: {
        tenantId,
        schoolId,
        employeeId,
        ...dto,
      },
    });
  },

  deleteQualification: async (tenantId: string, schoolId: string, id: string) => {
    const qual = await prisma.employeeQualification.findFirst({ where: { id, tenantId, schoolId } });
    if (!qual) throw new AppError(404, 'Qualification not found');

    await prisma.employeeQualification.delete({ where: { id } });
  },

  addExperience: async (
    tenantId: string,
    schoolId: string,
    employeeId: string,
    dto: { organizationName: string; designation: string; startDate: string; endDate?: string; isCurrent?: boolean; description?: string },
  ) => {
    const emp = await prisma.employee.findFirst({ where: { id: employeeId, tenantId, schoolId } });
    if (!emp) throw new AppError(404, 'Employee not found');

    return prisma.employeeExperience.create({
      data: {
        tenantId,
        schoolId,
        employeeId,
        organizationName: dto.organizationName,
        designation: dto.designation,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent || false,
        description: dto.description || null,
      },
    });
  },

  deleteExperience: async (tenantId: string, schoolId: string, id: string) => {
    const exp = await prisma.employeeExperience.findFirst({ where: { id, tenantId, schoolId } });
    if (!exp) throw new AppError(404, 'Experience record not found');

    await prisma.employeeExperience.delete({ where: { id } });
  },

  // 8. ACADEMIC TEACHER ASSIGNMENTS
  createTeacherAssignment: async (
    tenantId: string,
    schoolId: string,
    dto: { academicYearId: string; employeeId: string; subjectId: string; gradeLevelId: string; sectionId: string; assignmentType?: string },
    actorUserId: string,
    actorEmail: string,
  ) => {
    // Validate Employee belongs to tenant and is TEACHING
    const emp = await prisma.employee.findFirst({ where: { id: dto.employeeId, tenantId, schoolId } });
    if (!emp) throw new AppError(404, 'Employee profile not found');
    if (emp.employeeType !== EmployeeType.TEACHING) {
      throw new AppError(400, 'Employee is not registered as teaching faculty');
    }

    // Validate references
    const [year, level, sec, sub] = await Promise.all([
      prisma.academicYear.findFirst({ where: { id: dto.academicYearId, tenantId, schoolId } }),
      prisma.gradeLevel.findFirst({ where: { id: dto.gradeLevelId, tenantId, schoolId } }),
      prisma.section.findFirst({ where: { id: dto.sectionId, tenantId, schoolId, gradeLevelId: dto.gradeLevelId } }),
      prisma.subject.findFirst({ where: { id: dto.subjectId, tenantId, schoolId } }),
    ]);

    if (!year || year.status === 'ARCHIVED') throw new AppError(400, 'Invalid active academic session');
    if (!level || level.status === 'ARCHIVED') throw new AppError(400, 'Invalid active class level');
    if (!sec || sec.status === 'ARCHIVED') throw new AppError(400, 'Invalid active section under selected class');
    if (!sub || sub.status === 'ARCHIVED') throw new AppError(400, 'Invalid active subject');

    // Check duplicate active assignment
    const duplicate = await prisma.teacherAssignment.findUnique({
      where: {
        tenantId_schoolId_academicYearId_employeeId_subjectId_gradeLevelId_sectionId: {
          tenantId,
          schoolId,
          academicYearId: dto.academicYearId,
          employeeId: dto.employeeId,
          subjectId: dto.subjectId,
          gradeLevelId: dto.gradeLevelId,
          sectionId: dto.sectionId,
        },
      },
    });
    if (duplicate) throw new AppError(409, 'Teacher is already assigned to this academic mapping');

    const assignment = await prisma.teacherAssignment.create({
      data: {
        tenantId,
        schoolId,
        academicYearId: dto.academicYearId,
        employeeId: dto.employeeId,
        subjectId: dto.subjectId,
        gradeLevelId: dto.gradeLevelId,
        sectionId: dto.sectionId,
        assignmentType: dto.assignmentType || 'PRIMARY',
        status: Status.ACTIVE,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TEACHER_ASSIGNMENT_CREATED',
      entityType: 'TeacherAssignment',
      entityId: assignment.id,
      newValues: {
        employeeId: dto.employeeId,
        subjectId: dto.subjectId,
        classId: dto.gradeLevelId,
        sectionId: dto.sectionId,
      },
    });

    return assignment;
  },

  listTeacherAssignments: async (
    tenantId: string,
    schoolId: string,
    params: { academicYearId?: string; gradeLevelId?: string; sectionId?: string; employeeId?: string },
  ) => {
    const where: any = { tenantId, schoolId, status: { not: Status.ARCHIVED } };

    if (params.academicYearId) where.academicYearId = params.academicYearId;
    if (params.gradeLevelId) where.gradeLevelId = params.gradeLevelId;
    if (params.sectionId) where.sectionId = params.sectionId;
    if (params.employeeId) where.employeeId = params.employeeId;

    return prisma.teacherAssignment.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, designation: true } },
        subject: { select: { name: true, code: true } },
        gradeLevel: { select: { name: true } },
        section: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  deleteTeacherAssignment: async (tenantId: string, schoolId: string, id: string, actorUserId: string, actorEmail: string) => {
    const assignment = await prisma.teacherAssignment.findFirst({ where: { id, tenantId, schoolId } });
    if (!assignment) throw new AppError(404, 'Assignment not found');

    await prisma.teacherAssignment.delete({ where: { id } });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'TEACHER_ASSIGNMENT_ARCHIVED',
      entityType: 'TeacherAssignment',
      entityId: id,
    });
  },

  // 9. CLASS TEACHER / HOMEROOM TEACHER ASSIGNMENTS
  assignClassTeacher: async (
    tenantId: string,
    schoolId: string,
    dto: { academicYearId: string; gradeLevelId: string; sectionId: string; employeeId: string; isPrimary?: boolean },
    actorUserId: string,
    actorEmail: string,
  ) => {
    // Validate Employee belongs to tenant
    const emp = await prisma.employee.findFirst({ where: { id: dto.employeeId, tenantId, schoolId } });
    if (!emp) throw new AppError(404, 'Employee profile not found');
    if (emp.employeeType !== EmployeeType.TEACHING) {
      throw new AppError(400, 'Employee is not registered as teaching faculty');
    }

    // Verify section belongs to class standard
    const sec = await prisma.section.findFirst({
      where: { id: dto.sectionId, tenantId, schoolId, gradeLevelId: dto.gradeLevelId },
    });
    if (!sec) throw new AppError(400, 'Section standard is invalid or belongs to another class standard');

    const isPrimary = dto.isPrimary !== false;

    if (isPrimary) {
      // Check if there is already a primary class teacher for this section/year.
      // Deactivate it to preserve the "one primary homeroom teacher per year" constraint cleanly.
      await prisma.classTeacherAssignment.updateMany({
        where: {
          tenantId,
          schoolId,
          academicYearId: dto.academicYearId,
          gradeLevelId: dto.gradeLevelId,
          sectionId: dto.sectionId,
          isPrimary: true,
          status: Status.ACTIVE,
        },
        data: {
          isPrimary: false,
          status: Status.INACTIVE,
          endDate: new Date(),
        },
      });
    }

    // Create class teacher assignment
    const assignment = await prisma.classTeacherAssignment.create({
      data: {
        tenantId,
        schoolId,
        academicYearId: dto.academicYearId,
        gradeLevelId: dto.gradeLevelId,
        sectionId: dto.sectionId,
        employeeId: dto.employeeId,
        isPrimary,
        status: Status.ACTIVE,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CLASS_TEACHER_ASSIGNED',
      entityType: 'ClassTeacherAssignment',
      entityId: assignment.id,
      newValues: {
        employeeId: dto.employeeId,
        classId: dto.gradeLevelId,
        sectionId: dto.sectionId,
      },
    });

    return assignment;
  },

  listClassTeachers: async (tenantId: string, schoolId: string, academicYearId?: string) => {
    const where: any = { tenantId, schoolId, status: Status.ACTIVE };
    if (academicYearId) where.academicYearId = academicYearId;

    return prisma.classTeacherAssignment.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, designation: true } },
        gradeLevel: { select: { name: true } },
        section: { select: { name: true } },
      },
    });
  },

  deleteClassTeacher: async (tenantId: string, schoolId: string, id: string, actorUserId: string, actorEmail: string) => {
    const assignment = await prisma.classTeacherAssignment.findFirst({ where: { id, tenantId, schoolId } });
    if (!assignment) throw new AppError(404, 'Assignment not found');

    await prisma.classTeacherAssignment.delete({ where: { id } });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'CLASS_TEACHER_REMOVED',
      entityType: 'ClassTeacherAssignment',
      entityId: id,
    });
  },

  // 10. DEPARTMENT HEAD / HOD ASSIGNMENT FOUNDATION
  assignDepartmentHead: async (
    tenantId: string,
    schoolId: string,
    dto: { departmentId: string; employeeId: string; startDate: string },
    actorUserId: string,
    actorEmail: string,
  ) => {
    // Verify references
    const [dept, emp] = await Promise.all([
      prisma.department.findFirst({ where: { id: dto.departmentId, tenantId, schoolId } }),
      prisma.employee.findFirst({ where: { id: dto.employeeId, tenantId, schoolId } }),
    ]);

    if (!dept) throw new AppError(404, 'Department not found');
    if (!emp) throw new AppError(404, 'Employee not found');

    // Deactivate previous HOD
    await prisma.departmentHeadAssignment.updateMany({
      where: {
        tenantId,
        schoolId,
        departmentId: dto.departmentId,
        status: Status.ACTIVE,
      },
      data: {
        status: Status.INACTIVE,
        endDate: new Date(),
      },
    });

    const assignment = await prisma.departmentHeadAssignment.create({
      data: {
        tenantId,
        schoolId,
        departmentId: dto.departmentId,
        employeeId: dto.employeeId,
        startDate: new Date(dto.startDate),
        status: Status.ACTIVE,
      },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'DEPARTMENT_HEAD_ASSIGNED',
      entityType: 'DepartmentHeadAssignment',
      entityId: assignment.id,
      newValues: { departmentId: dto.departmentId, employeeId: dto.employeeId },
    });

    return assignment;
  },

  listDepartmentHeads: async (tenantId: string, schoolId: string) => {
    return prisma.departmentHeadAssignment.findMany({
      where: { tenantId, schoolId, status: Status.ACTIVE },
      include: {
        department: { select: { name: true, code: true } },
        employee: { select: { firstName: true, lastName: true, employeeNumber: true, designation: true } },
      },
    });
  },
};
