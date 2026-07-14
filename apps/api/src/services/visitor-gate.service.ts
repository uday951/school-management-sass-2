import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { VisitRecordStatus, GatePassRequestType, GatePassStatus } from '@prisma/client';

export const visitorGateService = {
  // Visitor CRUD
  async listVisitors(tenantId: string, search?: string) {
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    return prisma.visitor.findMany({ where, orderBy: { fullName: 'asc' } });
  },

  async createVisitor(
    tenantId: string,
    data: { fullName: string; phone?: string; identificationType?: string; identificationLast4?: string; organization?: string }
  ) {
    return prisma.visitor.create({
      data: {
        tenantId,
        fullName: data.fullName,
        phone: data.phone || null,
        identificationType: data.identificationType || null,
        identificationLast4: data.identificationLast4 || null,
        organization: data.organization || null
      }
    });
  },

  // Visit records
  async listVisitRecords(tenantId: string, params: { date?: string; status?: VisitRecordStatus }) {
    const where: any = { tenantId };
    if (params.status) where.status = params.status;
    if (params.date) {
      const start = new Date(params.date);
      start.setHours(0,0,0,0);
      const end = new Date(params.date);
      end.setHours(23,59,59,999);
      where.checkInAt = { gte: start, lte: end };
    }
    return prisma.visitRecord.findMany({
      where,
      include: { visitor: true },
      orderBy: { checkInAt: 'desc' }
    });
  },

  async checkInVisitor(
    tenantId: string,
    data: {
      visitorId?: string;
      fullName?: string;
      phone?: string;
      identificationType?: string;
      identificationLast4?: string;
      organization?: string;
      purpose: string;
      personToMeetUserId?: string;
      personToMeetEmployeeId?: string;
      badgeNumber?: string;
      notes?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    let visitorId = data.visitorId;
    if (!visitorId) {
      if (!data.fullName) throw new AppError(400, 'Visitor full name required for new entry');
      const visitor = await this.createVisitor(tenantId, {
        fullName: data.fullName,
        phone: data.phone,
        identificationType: data.identificationType,
        identificationLast4: data.identificationLast4,
        organization: data.organization
      });
      visitorId = visitor.id;
    }

    const record = await prisma.visitRecord.create({
      data: {
        tenantId,
        visitorId: visitorId!,
        purpose: data.purpose,
        personToMeetUserId: data.personToMeetUserId || null,
        personToMeetEmployeeId: data.personToMeetEmployeeId || null,
        badgeNumber: data.badgeNumber || null,
        notes: data.notes || null,
        status: VisitRecordStatus.CHECKED_IN,
        createdByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'VISITOR_CHECK_IN',
      entityType: 'VisitRecord',
      entityId: record.id,
      newValues: record
    });

    return record;
  },

  async checkOutVisitor(tenantId: string, visitId: string, actorUserId: string, actorEmail: string) {
    const record = await prisma.visitRecord.findFirst({ where: { id: visitId, tenantId } });
    if (!record) throw new AppError(404, 'Visit record not found');
    if (record.status === VisitRecordStatus.CHECKED_OUT) {
      throw new AppError(400, 'Visitor already checked out');
    }

    const updated = await prisma.visitRecord.update({
      where: { id: visitId },
      data: {
        status: VisitRecordStatus.CHECKED_OUT,
        checkOutAt: new Date(),
        checkedOutByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'VISITOR_CHECK_OUT',
      entityType: 'VisitRecord',
      entityId: visitId,
      newValues: updated
    });

    return updated;
  },

  // Student Gate Pass
  async listGatePasses(tenantId: string, params: { studentId?: string; status?: GatePassStatus }) {
    const where: any = { tenantId };
    if (params.studentId) where.studentId = params.studentId;
    if (params.status) where.status = params.status;
    return prisma.studentGatePass.findMany({
      where,
      include: { student: true, pickupGuardian: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async createGatePass(
    tenantId: string,
    data: {
      studentId: string;
      studentEnrollmentId: string;
      requestType: GatePassRequestType;
      reason: string;
      requestedExitAt: string;
      expectedReturnAt?: string;
      pickupGuardianId?: string;
      pickupVisitorId?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const student = await prisma.student.findFirst({ where: { id: data.studentId, tenantId } });
    if (!student) throw new AppError(404, 'Student not found');

    const pass = await prisma.studentGatePass.create({
      data: {
        tenantId,
        studentId: data.studentId,
        studentEnrollmentId: data.studentEnrollmentId,
        requestedByUserId: actorUserId,
        requestType: data.requestType,
        reason: data.reason,
        requestedExitAt: new Date(data.requestedExitAt),
        expectedReturnAt: data.expectedReturnAt ? new Date(data.expectedReturnAt) : null,
        pickupGuardianId: data.pickupGuardianId || null,
        pickupVisitorId: data.pickupVisitorId || null,
        status: GatePassStatus.PENDING
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'GATE_PASS_CREATE',
      entityType: 'StudentGatePass',
      entityId: pass.id,
      newValues: pass
    });

    return pass;
  },

  async approveGatePass(tenantId: string, id: string, actorUserId: string, actorEmail: string, comment?: string) {
    const pass = await prisma.studentGatePass.findFirst({ where: { id, tenantId } });
    if (!pass) throw new AppError(404, 'Gate pass not found');
    if (pass.status !== GatePassStatus.PENDING) {
      throw new AppError(400, 'Gate pass is not pending review');
    }

    const updated = await prisma.studentGatePass.update({
      where: { id },
      data: {
        status: GatePassStatus.APPROVED,
        approvedByUserId: actorUserId,
        approvedAt: new Date(),
        reviewComment: comment || null
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'GATE_PASS_APPROVE',
      entityType: 'StudentGatePass',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  async rejectGatePass(tenantId: string, id: string, actorUserId: string, actorEmail: string, comment?: string) {
    const pass = await prisma.studentGatePass.findFirst({ where: { id, tenantId } });
    if (!pass) throw new AppError(404, 'Gate pass not found');
    if (pass.status !== GatePassStatus.PENDING) {
      throw new AppError(400, 'Gate pass is not pending review');
    }

    const updated = await prisma.studentGatePass.update({
      where: { id },
      data: {
        status: GatePassStatus.REJECTED,
        rejectedByUserId: actorUserId,
        rejectedAt: new Date(),
        reviewComment: comment || null
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'GATE_PASS_REJECT',
      entityType: 'StudentGatePass',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  async recordExit(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const pass = await prisma.studentGatePass.findFirst({ where: { id, tenantId } });
    if (!pass) throw new AppError(404, 'Gate pass not found');
    if (pass.status !== GatePassStatus.APPROVED) {
      throw new AppError(400, 'Unapproved gate pass cannot record normal exit');
    }

    const updated = await prisma.studentGatePass.update({
      where: { id },
      data: {
        status: GatePassStatus.EXITED,
        actualExitAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'GATE_PASS_EXIT_RECORD',
      entityType: 'StudentGatePass',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  async recordReturn(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const pass = await prisma.studentGatePass.findFirst({ where: { id, tenantId } });
    if (!pass) throw new AppError(404, 'Gate pass not found');
    if (pass.status !== GatePassStatus.EXITED) {
      throw new AppError(400, 'Return can only be recorded for exited student passes');
    }

    const updated = await prisma.studentGatePass.update({
      where: { id },
      data: {
        status: GatePassStatus.RETURNED,
        actualReturnAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'GATE_PASS_RETURN_RECORD',
      entityType: 'StudentGatePass',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  // Gate dashboard stats
  async getGateDashboard(tenantId: string) {
    const insideCount = await prisma.visitRecord.count({
      where: { tenantId, status: VisitRecordStatus.CHECKED_IN }
    });
    const todayVisitors = await prisma.visitRecord.count({
      where: { tenantId }
    });
    const pendingPasses = await prisma.studentGatePass.count({
      where: { tenantId, status: GatePassStatus.PENDING }
    });
    const exitedStudents = await prisma.studentGatePass.count({
      where: { tenantId, status: GatePassStatus.EXITED }
    });

    return {
      insideCount,
      todayVisitors,
      pendingPasses,
      exitedStudents
    };
  }
};
