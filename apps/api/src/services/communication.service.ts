import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { 
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementAudienceType,
  AnnouncementAudience,
  UserType,
  EmployeeType
} from '@prisma/client';

export const communicationService = {
  // ==========================================
  // B1. ANNOUNCEMENTS
  // ==========================================
  async getAnnouncement(tenantId: string, id: string) {
    const ann = await prisma.announcement.findFirst({
      where: { id, tenantId, archivedAt: null },
      include: { audiences: true }
    });
    if (!ann) throw new AppError(404, 'Announcement not found');
    return ann;
  },

  async listAnnouncementsForUser(tenantId: string, userId: string, userType: UserType) {
    // Find all published announcements where the user is listed as a recipient
    const recipients = await prisma.announcementRecipient.findMany({
      where: { tenantId, userId },
      include: {
        announcement: {
          include: { audiences: true }
        }
      }
    });

    return recipients
      .filter(r => r.announcement.status === AnnouncementStatus.PUBLISHED && r.announcement.archivedAt === null)
      .map(r => ({
        ...r.announcement,
        readAt: r.readAt,
        acknowledgedAt: r.acknowledgedAt,
        recipientId: r.id
      }))
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { URGENT: 3, IMPORTANT: 2, NORMAL: 1 };
        const pDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
        if (pDiff !== 0) return pDiff;
        return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
      });
  },

  async listAllAnnouncementsAdmin(tenantId: string) {
    return prisma.announcement.findMany({
      where: { tenantId, archivedAt: null },
      include: { audiences: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async createAnnouncement(
    tenantId: string,
    data: {
      title: string;
      body: string;
      announcementType: AnnouncementType;
      priority: AnnouncementPriority;
      requiresAcknowledgement?: boolean;
      audiences: { audienceType: AnnouncementAudienceType; targetId?: string | null }[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const ann = await prisma.announcement.create({
      data: {
        tenantId,
        title: data.title,
        body: data.body,
        announcementType: data.announcementType,
        priority: data.priority,
        requiresAcknowledgement: data.requiresAcknowledgement || false,
        status: AnnouncementStatus.DRAFT,
        createdByUserId: actorUserId,
        archivedAt: null
      }
    });

    for (const aud of data.audiences) {
      await prisma.announcementAudience.create({
        data: {
          tenantId,
          announcementId: ann.id,
          audienceType: aud.audienceType,
          targetId: aud.targetId || null
        }
      });
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'ANNOUNCEMENT_CREATE',
      entityType: 'Announcement',
      entityId: ann.id,
      newValues: ann
    });

    return this.getAnnouncement(tenantId, ann.id);
  },

  async publishAnnouncement(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const ann = await prisma.announcement.findFirst({
      where: { id, tenantId, archivedAt: null },
      include: { audiences: true }
    });
    if (!ann) throw new AppError(404, 'Announcement not found');
    if (ann.status === AnnouncementStatus.PUBLISHED) {
      throw new AppError(400, 'Announcement is already published');
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        status: AnnouncementStatus.PUBLISHED,
        publishedByUserId: actorUserId,
        publishedAt: new Date()
      }
    });

    // Resolve target audience and create recipients in the background
    const userIds = await this.resolveAudienceUsers(tenantId, ann.audiences);

    for (const uId of userIds) {
      await prisma.announcementRecipient.upsert({
        where: {
          tenantId_announcementId_userId: {
            tenantId,
            announcementId: id,
            userId: uId
          }
        },
        create: {
          tenantId,
          announcementId: id,
          userId: uId
        },
        update: {}
      });

      // Also trigger a personal center notification
      await this.createNotification({
        tenantId,
        userId: uId,
        type: 'ANNOUNCEMENT',
        title: `Notice: ${ann.title}`,
        message: ann.body.substring(0, 100),
        referenceType: 'Announcement',
        referenceId: ann.id
      });
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'ANNOUNCEMENT_PUBLISH',
      entityType: 'Announcement',
      entityId: id,
      newValues: updated,
      metadata: { recipientCount: userIds.length }
    });

    return updated;
  },

  async markAsRead(tenantId: string, announcementId: string, userId: string) {
    const recipient = await prisma.announcementRecipient.findUnique({
      where: {
        tenantId_announcementId_userId: {
          tenantId,
          announcementId,
          userId
        }
      }
    });
    if (!recipient) return null;

    return prisma.announcementRecipient.update({
      where: { id: recipient.id },
      data: { readAt: new Date() }
    });
  },

  async acknowledge(tenantId: string, announcementId: string, userId: string) {
    const recipient = await prisma.announcementRecipient.findUnique({
      where: {
        tenantId_announcementId_userId: {
          tenantId,
          announcementId,
          userId
        }
      }
    });
    if (!recipient) throw new AppError(404, 'Recipient record not found');

    return prisma.announcementRecipient.update({
      where: { id: recipient.id },
      data: {
        readAt: recipient.readAt || new Date(),
        acknowledgedAt: new Date()
      }
    });
  },

  async archiveAnnouncement(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const ann = await prisma.announcement.findFirst({
      where: { id, tenantId, archivedAt: null }
    });
    if (!ann) throw new AppError(404, 'Announcement not found');

    const updated = await prisma.announcement.update({
      where: { id },
      data: { archivedAt: new Date(), status: AnnouncementStatus.ARCHIVED }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'ANNOUNCEMENT_ARCHIVE',
      entityType: 'Announcement',
      entityId: id,
      newValues: updated
    });
  },

  async getAnnouncementAnalytics(tenantId: string, id: string) {
    const recipients = await prisma.announcementRecipient.findMany({
      where: { tenantId, announcementId: id }
    });

    const total = recipients.length;
    const read = recipients.filter(r => r.readAt !== null).length;
    const acknowledged = recipients.filter(r => r.acknowledgedAt !== null).length;

    return {
      total,
      read,
      unread: total - read,
      acknowledged,
      pendingAcknowledgement: total - acknowledged
    };
  },

  // Helper to resolve audiences to userIds
  async resolveAudienceUsers(tenantId: string, audiences: AnnouncementAudience[]): Promise<string[]> {
    const userIdsSet = new Set<string>();

    for (const aud of audiences) {
      switch (aud.audienceType) {
        case AnnouncementAudienceType.ALL_SCHOOL: {
          const users = await prisma.user.findMany({ where: { tenantId, status: 'ACTIVE' } });
          users.forEach(u => userIdsSet.add(u.id));
          break;
        }
        case AnnouncementAudienceType.ALL_STUDENTS: {
          const users = await prisma.user.findMany({
            where: { tenantId, userType: UserType.STUDENT, status: 'ACTIVE' }
          });
          users.forEach(u => userIdsSet.add(u.id));
          break;
        }
        case AnnouncementAudienceType.ALL_GUARDIANS: {
          const users = await prisma.user.findMany({
            where: { tenantId, userType: UserType.GUARDIAN, status: 'ACTIVE' }
          });
          users.forEach(u => userIdsSet.add(u.id));
          break;
        }
        case AnnouncementAudienceType.ALL_EMPLOYEES: {
          const employees = await prisma.employee.findMany({
            where: { tenantId, status: 'ACTIVE' }
          });
          employees.forEach(e => { if (e.userId) userIdsSet.add(e.userId); });
          break;
        }
        case AnnouncementAudienceType.TEACHERS: {
          const employees = await prisma.employee.findMany({
            where: { tenantId, employeeType: EmployeeType.TEACHING, status: 'ACTIVE' }
          });
          employees.forEach(e => { if (e.userId) userIdsSet.add(e.userId); });
          break;
        }
        case AnnouncementAudienceType.DEPARTMENT: {
          if (aud.targetId) {
            const employees = await prisma.employee.findMany({
              where: { tenantId, primaryDepartmentId: aud.targetId, status: 'ACTIVE' }
            });
            employees.forEach(e => { if (e.userId) userIdsSet.add(e.userId); });
          }
          break;
        }
        case AnnouncementAudienceType.CLASS: {
          if (aud.targetId) {
            // Find enrolled students in this class
            const enrolls = await prisma.studentEnrollment.findMany({
              where: { tenantId, gradeLevelId: aud.targetId, isCurrent: true, status: 'ACTIVE' },
              include: { student: true }
            });
            enrolls.forEach(e => {
              if (e.student.userId) userIdsSet.add(e.student.userId);
            });
          }
          break;
        }
        case AnnouncementAudienceType.SECTION: {
          if (aud.targetId) {
            const enrolls = await prisma.studentEnrollment.findMany({
              where: { tenantId, sectionId: aud.targetId, isCurrent: true, status: 'ACTIVE' },
              include: { student: true }
            });
            enrolls.forEach(e => {
              if (e.student.userId) userIdsSet.add(e.student.userId);
            });
          }
          break;
        }
        case AnnouncementAudienceType.ROLE: {
          if (aud.targetId) {
            const users = await prisma.user.findMany({
              where: { tenantId, roleId: aud.targetId, status: 'ACTIVE' }
            });
            users.forEach(u => userIdsSet.add(u.id));
          }
          break;
        }
        case AnnouncementAudienceType.USER: {
          if (aud.targetId) {
            userIdsSet.add(aud.targetId);
          }
          break;
        }
      }
    }

    return Array.from(userIdsSet);
  },

  // ==========================================
  // B9. PERSONAL NOTIFICATIONS CENTER
  // ==========================================
  async createNotification(data: {
    tenantId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    return prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        referenceType: data.referenceType || null,
        referenceId: data.referenceId || null,
        readAt: null
      }
    });
  },

  async listNotifications(tenantId: string, userId: string) {
    return prisma.notification.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  },

  async markNotificationRead(tenantId: string, id: string, userId: string) {
    const existing = await prisma.notification.findFirst({
      where: { id, tenantId, userId }
    });
    if (!existing) throw new AppError(404, 'Notification not found');

    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    });
  },

  async markAllNotificationsRead(tenantId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { tenantId, userId, readAt: null },
      data: { readAt: new Date() }
    });
  }
};
