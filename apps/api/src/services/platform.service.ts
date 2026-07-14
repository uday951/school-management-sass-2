import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { SchoolStatus, TenantStatus, UserStatus, UserType, SchoolType, BoardType } from '@prisma/client';

export interface CreateSchoolParams {
  name: string;
  code: string;
  schoolType: SchoolType;
  board: BoardType;
  establishedYear?: number;
  officialEmail: string;
  officialPhone: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl?: string;
  firstAdmin: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export const platformService = {
  getDashboardStats: async () => {
    const [
      totalSchools,
      activeSchools,
      suspendedSchools,
      archivedSchools,
      totalSchoolAdmins,
      recentSchools,
      recentActivity,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { status: 'ACTIVE' } }),
      prisma.school.count({ where: { status: 'SUSPENDED' } }),
      prisma.school.count({ where: { status: 'ARCHIVED' } }),
      prisma.user.count({ where: { userType: 'SCHOOL_ADMIN' } }),
      prisma.school.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      stats: {
        totalSchools,
        activeSchools,
        suspendedSchools,
        archivedSchools,
        totalSchoolAdmins,
      },
      recentSchools,
      recentActivity,
    };
  },

  createSchool: async (dto: CreateSchoolParams, actorUserId: string, actorEmail: string) => {
    // Unique check
    const [existingCode, existingSchoolEmail, existingAdminEmail] = await Promise.all([
      prisma.school.findUnique({ where: { code: dto.code } }),
      prisma.school.findUnique({ where: { officialEmail: dto.officialEmail } }),
      prisma.user.findUnique({ where: { email: dto.firstAdmin.email } }),
    ]);

    if (existingCode) throw new AppError(409, `School code '${dto.code}' is already registered`);
    if (existingSchoolEmail) throw new AppError(409, `Official email '${dto.officialEmail}' is already registered`);
    if (existingAdminEmail) throw new AppError(409, `Admin email '${dto.firstAdmin.email}' is already registered`);

    const tempPassword = crypto.randomBytes(16).toString('base64').slice(0, 16);
    const passwordHash = await argon2.hash(tempPassword);

    const baseSlug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tenantSlug = `${baseSlug}-${Date.now()}`;
    const schoolSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    let tenantId: string | null = null;
    let schoolId: string | null = null;
    let userId: string | null = null;

    try {
      // 1. Create Tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: dto.name,
          slug: tenantSlug,
          status: TenantStatus.ACTIVE,
        },
      });
      tenantId = tenant.id;

      // 2. Create School
      const school = await prisma.school.create({
        data: {
          tenantId: tenant.id,
          name: dto.name,
          code: dto.code.toUpperCase(),
          slug: schoolSlug,
          schoolType: dto.schoolType,
          board: dto.board,
          establishedYear: dto.establishedYear,
          officialEmail: dto.officialEmail,
          officialPhone: dto.officialPhone,
          website: dto.website,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          city: dto.city,
          state: dto.state,
          country: dto.country || 'India',
          postalCode: dto.postalCode,
          logoUrl: dto.logoUrl,
          status: SchoolStatus.ACTIVE, // Onboard active
        },
      });
      schoolId = school.id;

      // 3. Create Admin User
      const adminUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          firstName: dto.firstAdmin.firstName,
          lastName: dto.firstAdmin.lastName,
          email: dto.firstAdmin.email,
          phone: dto.firstAdmin.phone,
          passwordHash,
          userType: UserType.SCHOOL_ADMIN,
          status: UserStatus.ACTIVE,
          mustChangePassword: true,
        },
      });
      userId = adminUser.id;

      // Audit log
      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId: tenant.id,
        schoolId: school.id,
        action: 'SCHOOL_ONBOARDED',
        entityType: 'School',
        entityId: school.id,
        newValues: {
          name: school.name,
          code: school.code,
          adminEmail: adminUser.email,
        },
      });

      return {
        tenant,
        school,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          tempPassword,
        },
      };
    } catch (error) {
      // Manual transactional rollback
      if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      if (schoolId) await prisma.school.delete({ where: { id: schoolId } }).catch(() => {});
      if (tenantId) await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
      throw error;
    }
  },

  listSchools: async (params: {
    search?: string;
    status?: SchoolStatus;
    schoolType?: SchoolType;
    board?: BoardType;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }) => {
    const skip = (params.page - 1) * params.limit;
    const where: any = {};

    if (params.status) where.status = params.status;
    if (params.schoolType) where.schoolType = params.schoolType;
    if (params.board) where.board = params.board;

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
        { officialEmail: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: params.limit,
      }),
      prisma.school.count({ where }),
    ]);

    // Fetch primary admin for each school
    const schoolsWithAdmins = await Promise.all(
      schools.map(async (school) => {
        const primaryAdmin = await prisma.user.findFirst({
          where: { tenantId: school.tenantId, userType: 'SCHOOL_ADMIN' },
          select: { firstName: true, lastName: true, email: true },
        });
        return { ...school, primaryAdmin };
      }),
    );

    return {
      data: schoolsWithAdmins,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  getSchool: async (id: string) => {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { name: true, slug: true, status: true },
        },
      },
    });

    if (!school) throw new AppError(404, 'School not found');

    const [primaryAdmin, recentActivity] = await Promise.all([
      prisma.user.findFirst({
        where: { tenantId: school.tenantId, userType: 'SCHOOL_ADMIN' },
      }),
      prisma.auditLog.findMany({
        where: { schoolId: school.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      ...school,
      primaryAdmin,
      recentActivity,
    };
  },

  updateSchool: async (
    id: string,
    dto: any,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) throw new AppError(404, 'School not found');

    const updated = await prisma.school.update({
      where: { id },
      data: dto,
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId: school.tenantId,
      schoolId: school.id,
      action: 'SCHOOL_PROFILE_UPDATED',
      entityType: 'School',
      entityId: school.id,
      newValues: dto,
    });

    return updated;
  },

  updateSchoolStatus: async (
    id: string,
    status: SchoolStatus,
    reason: string | undefined,
    actorUserId: string,
    actorEmail: string,
  ) => {
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) throw new AppError(404, 'School not found');

    // Transitions validation check
    const STATUS_TRANSITIONS: Record<SchoolStatus, SchoolStatus[]> = {
      ONBOARDING: [SchoolStatus.ACTIVE, SchoolStatus.ARCHIVED],
      ACTIVE: [SchoolStatus.SUSPENDED, SchoolStatus.ARCHIVED],
      SUSPENDED: [SchoolStatus.ACTIVE, SchoolStatus.ARCHIVED],
      ARCHIVED: [],
    };

    const allowed = STATUS_TRANSITIONS[school.status] || [];
    if (!allowed.includes(status)) {
      throw new AppError(
        400,
        `Invalid status transition from '${school.status}' to '${status}'`,
      );
    }

    const updated = await prisma.school.update({
      where: { id },
      data: {
        status,
        archivedAt: status === 'ARCHIVED' ? new Date() : undefined,
      },
    });

    // Mirror status to tenant as well
    let tenantStatus: TenantStatus = TenantStatus.ACTIVE;
    if (status === 'SUSPENDED') tenantStatus = TenantStatus.SUSPENDED;
    if (status === 'ARCHIVED') tenantStatus = TenantStatus.ARCHIVED;

    await prisma.tenant.update({
      where: { id: school.tenantId },
      data: { status: tenantStatus },
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId: school.tenantId,
      schoolId: school.id,
      action: 'SCHOOL_STATUS_CHANGED',
      entityType: 'School',
      entityId: school.id,
      newValues: { status, reason },
    });

    return updated;
  },

  listAuditLogs: async (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
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
