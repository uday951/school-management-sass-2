import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import { InviteType, InviteStatus } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateInviteParams {
  inviteType: InviteType;
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  expiresInDays?: number;
  maxUses?: number;
  requireApproval?: boolean;
}

export const inviteService = {
  createInvite: async (
    tenantId: string,
    schoolId: string,
    dto: CreateInviteParams,
    actorUserId: string,
    actorEmail: string
  ) => {
    // A. Generate cryptographically secure random codes
    const secureToken = crypto.randomBytes(32).toString('hex');
    const codeHash = crypto.createHash('sha256').update(secureToken).digest('hex');
    
    // publicCode is a shorter random alphanumeric code for public join links (sufficient entropy)
    const publicCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    // B. Calculate expiry date if specified
    let expiresAt: Date | null = null;
    if (dto.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + dto.expiresInDays);
    }

    // C. Validate references if scoped invite
    if (dto.academicYearId) {
      const year = await prisma.academicYear.findFirst({ where: { id: dto.academicYearId, tenantId, schoolId } });
      if (!year) throw new AppError(400, 'Invalid Academic Year reference');
    }
    if (dto.classId) {
      const grade = await prisma.gradeLevel.findFirst({ where: { id: dto.classId, tenantId, schoolId } });
      if (!grade) throw new AppError(400, 'Invalid Class Standard reference');
    }
    if (dto.sectionId) {
      if (!dto.classId) throw new AppError(400, 'Class reference is required if Section is specified');
      const sec = await prisma.section.findFirst({ where: { id: dto.sectionId, tenantId, schoolId, gradeLevelId: dto.classId } });
      if (!sec) throw new AppError(400, 'Invalid Section reference');
    }

    const invite = await prisma.schoolInvite.create({
      data: {
        tenantId,
        schoolId,
        inviteType: dto.inviteType,
        codeHash,
        publicCode,
        academicYearId: dto.academicYearId || null,
        classId: dto.classId || null,
        sectionId: dto.sectionId || null,
        createdByUserId: actorUserId,
        status: InviteStatus.ACTIVE,
        expiresAt,
        maxUses: dto.maxUses || null,
        requireApproval: dto.requireApproval !== undefined ? dto.requireApproval : true
      },
      include: {
        academicYear: { select: { name: true } },
        class: { select: { name: true } },
        section: { select: { name: true } }
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'INVITE_CREATED',
      entityType: 'SchoolInvite',
      entityId: invite.id,
      newValues: { inviteType: dto.inviteType, publicCode }
    });

    return { ...invite, secureToken };
  },

  resolveInvite: async (publicCode: string) => {
    // A. Resolve invite by public code
    const invite = await prisma.schoolInvite.findUnique({
      where: { publicCode },
      include: {
        school: {
          select: { name: true, officialEmail: true, logoUrl: true }
        },
        academicYear: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } }
      }
    });

    if (!invite) {
      throw new AppError(404, 'Invite not found or invalid');
    }

    // B. Check expiration & limits
    if (invite.status === InviteStatus.REVOKED) {
      throw new AppError(410, 'This invite has been revoked by the school administrator');
    }
    if (invite.status === InviteStatus.DISABLED) {
      throw new AppError(410, 'This invite has been disabled');
    }
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw new AppError(410, 'This invite code has expired');
    }
    if (invite.maxUses && invite.usageCount >= invite.maxUses) {
      throw new AppError(410, 'This invite has reached its usage limit');
    }

    // Expose only safe public identity details
    return {
      id: invite.id,
      tenantId: invite.tenantId,
      schoolId: invite.schoolId,
      inviteType: invite.inviteType,
      publicCode: invite.publicCode,
      requireApproval: invite.requireApproval,
      schoolName: invite.school.name,
      schoolEmail: invite.school.officialEmail,
      schoolLogo: invite.school.logoUrl,
      academicYear: invite.academicYear,
      class: invite.class,
      section: invite.section
    };
  },

  revokeInvite: async (
    tenantId: string,
    schoolId: string,
    inviteId: string,
    actorUserId: string,
    actorEmail: string
  ) => {
    const invite = await prisma.schoolInvite.findFirst({
      where: { id: inviteId, tenantId, schoolId }
    });
    if (!invite) throw new AppError(404, 'Invite not found');

    const updated = await prisma.schoolInvite.update({
      where: { id: inviteId },
      data: {
        status: InviteStatus.REVOKED,
        revokedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'INVITE_REVOKED',
      entityType: 'SchoolInvite',
      entityId: inviteId,
      newValues: { status: InviteStatus.REVOKED }
    });

    return updated;
  },

  listInvites: async (
    tenantId: string,
    schoolId: string,
    params: {
      inviteType?: InviteType;
      status?: InviteStatus;
      page: number;
      limit: number;
    }
  ) => {
    const skip = (params.page - 1) * params.limit;
    const where: any = { tenantId, schoolId };

    if (params.inviteType) where.inviteType = params.inviteType;
    if (params.status) where.status = params.status;

    const [total, invites] = await Promise.all([
      prisma.schoolInvite.count({ where }),
      prisma.schoolInvite.findMany({
        where,
        include: {
          academicYear: { select: { name: true } },
          class: { select: { name: true } },
          section: { select: { name: true } },
          createdBy: { select: { firstName: true, lastName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit
      })
    ]);

    return { total, invites };
  }
};
