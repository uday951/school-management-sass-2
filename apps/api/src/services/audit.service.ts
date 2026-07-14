import { prisma } from '../prisma';

export interface AuditLogParams {
  actorUserId: string;
  actorEmail: string;
  tenantId: string | null;
  schoolId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
}

export const auditService = {
  log: async (params: AuditLogParams) => {
    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: params.actorUserId,
          actorEmail: params.actorEmail,
          tenantId: params.tenantId || null,
          schoolId: params.schoolId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          oldValues: params.oldValues || null,
          newValues: params.newValues || null,
          metadata: params.metadata || null,
        },
      });
    } catch (error) {
      console.error('Audit logger failed:', error);
    }
  },
};
