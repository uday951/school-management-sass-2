import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { 
  Status,
  FeeCategoryStatus,
  FeeComponentType,
  FeeStructureStatus,
  FeeAssignmentStatus,
  FeeChargeStatus,
  FeeChargeType,
  ConcessionType,
  ConcessionStatus,
  AdjustmentType,
  PaymentMethod,
  PaymentStatus,
  ReceiptStatus,
  RefundStatus,
  LateFeeType,
  Prisma
} from '@prisma/client';

export const feesService = {
  // ==========================================
  // A. FEE CATEGORIES
  // ==========================================
  async listFeeCategories(tenantId: string) {
    return prisma.feeCategory.findMany({
      where: { tenantId, archivedAt: null },
      orderBy: { sortOrder: 'asc' }
    });
  },

  async createFeeCategory(
    tenantId: string,
    data: { name: string; code?: string; description?: string; sortOrder?: number },
    actorUserId: string,
    actorEmail: string
  ) {
    if (data.code) {
      const existing = await prisma.feeCategory.findFirst({
        where: { tenantId, code: data.code, archivedAt: null }
      });
      if (existing) throw new AppError(400, 'Fee category code already exists');
    }

    const category = await prisma.feeCategory.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        description: data.description,
        sortOrder: data.sortOrder || 0,
        status: FeeCategoryStatus.ACTIVE,
        archivedAt: null // Explicitly write null to ensure queries work on MongoDB
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_CATEGORY_CREATE',
      entityType: 'FeeCategory',
      entityId: category.id,
      newValues: category
    });

    return category;
  },

  async updateFeeCategory(
    tenantId: string,
    id: string,
    data: { name?: string; code?: string; description?: string; sortOrder?: number; status?: FeeCategoryStatus },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.feeCategory.findFirst({
      where: { id, tenantId, archivedAt: null }
    });
    if (!existing) throw new AppError(404, 'Fee category not found');

    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.feeCategory.findFirst({
        where: { tenantId, code: data.code, archivedAt: null }
      });
      if (duplicate) throw new AppError(400, 'Fee category code already exists');
    }

    const updated = await prisma.feeCategory.update({
      where: { id },
      data
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_CATEGORY_UPDATE',
      entityType: 'FeeCategory',
      entityId: id,
      oldValues: existing,
      newValues: updated
    });

    return updated;
  },

  async deleteFeeCategory(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const existing = await prisma.feeCategory.findFirst({
      where: { id, tenantId, archivedAt: null }
    });
    if (!existing) throw new AppError(404, 'Fee category not found');

    const inUse = await prisma.feeComponent.findFirst({
      where: { feeCategoryId: id, archivedAt: null }
    });
    if (inUse) throw new AppError(400, 'Cannot delete category because it is in use by components');

    const updated = await prisma.feeCategory.update({
      where: { id },
      data: { archivedAt: new Date(), status: FeeCategoryStatus.ARCHIVED }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_CATEGORY_DELETE',
      entityType: 'FeeCategory',
      entityId: id,
      newValues: updated
    });
  },

  // ==========================================
  // B. FEE COMPONENTS
  // ==========================================
  async listFeeComponents(tenantId: string) {
    return prisma.feeComponent.findMany({
      where: { tenantId, archivedAt: null },
      include: { category: true }
    });
  },

  async createFeeComponent(
    tenantId: string,
    data: { 
      feeCategoryId: string; 
      name: string; 
      code?: string; 
      description?: string; 
      componentType: FeeComponentType;
      isMandatoryDefault?: boolean;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const category = await prisma.feeCategory.findFirst({
      where: { id: data.feeCategoryId, tenantId, archivedAt: null }
    });
    if (!category) throw new AppError(404, 'Fee category not found');

    if (data.code) {
      const existing = await prisma.feeComponent.findFirst({
        where: { tenantId, code: data.code, archivedAt: null }
      });
      if (existing) throw new AppError(400, 'Fee component code already exists');
    }

    const component = await prisma.feeComponent.create({
      data: {
        tenantId,
        feeCategoryId: data.feeCategoryId,
        name: data.name,
        code: data.code,
        description: data.description,
        componentType: data.componentType,
        isMandatoryDefault: data.isMandatoryDefault !== undefined ? data.isMandatoryDefault : true,
        status: Status.ACTIVE,
        archivedAt: null // Explicitly write null to ensure queries work on MongoDB
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_COMPONENT_CREATE',
      entityType: 'FeeComponent',
      entityId: component.id,
      newValues: component
    });

    return component;
  },

  async updateFeeComponent(
    tenantId: string,
    id: string,
    data: { 
      name?: string; 
      code?: string; 
      description?: string; 
      componentType?: FeeComponentType;
      isMandatoryDefault?: boolean;
      status?: Status;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.feeComponent.findFirst({
      where: { id, tenantId, archivedAt: null }
    });
    if (!existing) throw new AppError(404, 'Fee component not found');

    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.feeComponent.findFirst({
        where: { tenantId, code: data.code, archivedAt: null }
      });
      if (duplicate) throw new AppError(400, 'Fee component code already exists');
    }

    const updated = await prisma.feeComponent.update({
      where: { id },
      data
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_COMPONENT_UPDATE',
      entityType: 'FeeComponent',
      entityId: id,
      oldValues: existing,
      newValues: updated
    });

    return updated;
  },

  async deleteFeeComponent(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const existing = await prisma.feeComponent.findFirst({
      where: { id, tenantId, archivedAt: null }
    });
    if (!existing) throw new AppError(404, 'Fee component not found');

    const inUse = await prisma.feeStructureItem.findFirst({
      where: { feeComponentId: id }
    });
    if (inUse) throw new AppError(400, 'Cannot delete component because it is in use by fee structures');

    const updated = await prisma.feeComponent.update({
      where: { id },
      data: { archivedAt: new Date(), status: Status.ARCHIVED }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_COMPONENT_DELETE',
      entityType: 'FeeComponent',
      entityId: id,
      newValues: updated
    });
  },

  // ==========================================
  // C. FEE STRUCTURES & ITEMS / INSTALLMENTS
  // ==========================================
  async listFeeStructures(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId, archivedAt: null };
    if (academicYearId) where.academicYearId = academicYearId;
    return prisma.feeStructure.findMany({
      where,
      include: {
        academicYear: true,
        items: { include: { component: true } },
        targets: { include: { class: true, section: true } },
        installments: true
      }
    });
  },

  async getFeeStructure(tenantId: string, id: string) {
    const structure = await prisma.feeStructure.findFirst({
      where: { id, tenantId, archivedAt: null },
      include: {
        academicYear: true,
        items: { include: { component: true } },
        targets: { include: { class: true, section: true } },
        installments: {
          include: {
            items: {
              include: {
                structureItem: {
                  include: { component: true }
                }
              }
            }
          }
        }
      }
    });
    if (!structure) throw new AppError(404, 'Fee structure not found');
    return structure;
  },

  async createFeeStructure(
    tenantId: string,
    data: {
      academicYearId: string;
      name: string;
      description?: string;
      currency?: string;
      items: { feeComponentId: string; amountMinor: number; isMandatory?: boolean }[];
      installments?: { name: string; dueDate: Date; items: { feeComponentId: string; amountMinor: number }[] }[];
      targets?: { classId: string; sectionId?: string | null }[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    // Check Academic Year exists
    const ay = await prisma.academicYear.findFirst({ where: { id: data.academicYearId, tenantId } });
    if (!ay) throw new AppError(404, 'Academic year not found');

    // Create the core structure first
    const structure = await prisma.feeStructure.create({
      data: {
        tenantId,
        academicYearId: data.academicYearId,
        name: data.name,
        description: data.description,
        currency: data.currency || 'INR',
        status: FeeStructureStatus.DRAFT,
        createdByUserId: actorUserId,
        archivedAt: null // Explicitly write null to ensure queries work on MongoDB
      }
    });

    // Add structure items
    const createdItems: any[] = [];
    for (const it of data.items) {
      const item = await prisma.feeStructureItem.create({
        data: {
          tenantId,
          feeStructureId: structure.id,
          feeComponentId: it.feeComponentId,
          amountMinor: it.amountMinor,
          isMandatory: it.isMandatory !== undefined ? it.isMandatory : true
        }
      });
      createdItems.push(item);
    }

    // Add installments if provided
    if (data.installments && data.installments.length > 0) {
      for (let i = 0; i < data.installments.length; i++) {
        const inst = data.installments[i];
        const installment = await prisma.feeInstallment.create({
          data: {
            tenantId,
            feeStructureId: structure.id,
            name: inst.name,
            dueDate: new Date(inst.dueDate),
            sequenceNumber: i + 1,
            status: Status.ACTIVE
          }
        });

        for (const instItem of inst.items) {
          const matchedItem = createdItems.find(it => it.feeComponentId === instItem.feeComponentId);
          if (matchedItem) {
            await prisma.feeInstallmentItem.create({
              data: {
                tenantId,
                feeInstallmentId: installment.id,
                feeStructureItemId: matchedItem.id,
                amountMinor: instItem.amountMinor
              }
            });
          }
        }
      }
    }

    // Add targets if provided
    if (data.targets && data.targets.length > 0) {
      for (const tgt of data.targets) {
        await prisma.feeStructureTarget.create({
          data: {
            tenantId,
            feeStructureId: structure.id,
            classId: tgt.classId,
            sectionId: tgt.sectionId || null
          }
        });
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_STRUCTURE_CREATE',
      entityType: 'FeeStructure',
      entityId: structure.id,
      newValues: structure
    });

    return structure;
  },

  async updateFeeStructureStatus(
    tenantId: string,
    id: string,
    status: FeeStructureStatus,
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.feeStructure.findFirst({
      where: { id, tenantId, archivedAt: null }
    });
    if (!existing) throw new AppError(404, 'Fee structure not found');

    const data: any = { status };
    if (status === FeeStructureStatus.ACTIVE && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.feeStructure.update({
      where: { id },
      data
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: `FEE_STRUCTURE_STATUS_${status}`,
      entityType: 'FeeStructure',
      entityId: id,
      oldValues: existing,
      newValues: updated
    });

    return updated;
  },

  async deleteFeeStructure(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const existing = await prisma.feeStructure.findFirst({
      where: { id, tenantId, archivedAt: null }
    });
    if (!existing) throw new AppError(404, 'Fee structure not found');

    // Check if in use
    const assigned = await prisma.studentFeeAssignment.findFirst({
      where: { feeStructureId: id, assignmentStatus: FeeAssignmentStatus.ACTIVE }
    });
    if (assigned) throw new AppError(400, 'Cannot delete structure because it is actively assigned to students');

    const updated = await prisma.feeStructure.update({
      where: { id },
      data: { archivedAt: new Date(), status: FeeStructureStatus.ARCHIVED }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_STRUCTURE_DELETE',
      entityType: 'FeeStructure',
      entityId: id,
      newValues: updated
    });
  },

  // ==========================================
  // D. STUDENT FEE ASSIGNMENTS & BULK ASSIGNMENT
  // ==========================================
  async listAssignments(tenantId: string, academicYearId: string) {
    return prisma.studentFeeAssignment.findMany({
      where: { tenantId, academicYearId },
      include: {
        student: true,
        structure: true
      }
    });
  },

  async previewBulkAssignmentStudents(tenantId: string, classId: string, sectionId?: string | null) {
    const where: any = { tenantId, isCurrent: true, status: 'ACTIVE', gradeLevelId: classId };
    if (sectionId) where.sectionId = sectionId;

    const enrollments = await prisma.studentEnrollment.findMany({
      where,
      include: { student: true }
    });

    return enrollments.map(e => ({
      studentId: e.studentId,
      admissionNumber: e.student.admissionNumber,
      firstName: e.student.firstName,
      lastName: e.student.lastName,
      enrollmentId: e.id
    }));
  },

  async assignFeeStructure(
    tenantId: string,
    academicYearId: string,
    feeStructureId: string,
    studentIds: string[],
    actorUserId: string,
    actorEmail: string
  ) {
    const structure = await this.getFeeStructure(tenantId, feeStructureId);
    if (!structure) throw new AppError(404, 'Fee structure not found');

    const results: any[] = [];
    for (const studId of studentIds) {
      const enrollment = await prisma.studentEnrollment.findFirst({
        where: { tenantId, studentId: studId, academicYearId, isCurrent: true, status: 'ACTIVE' }
      });
      if (!enrollment) continue;

      // Check if already assigned
      const existing = await prisma.studentFeeAssignment.findFirst({
        where: { tenantId, academicYearId, studentId: studId, feeStructureId, assignmentStatus: FeeAssignmentStatus.ACTIVE }
      });
      if (existing) continue;

      // Create Assignment record
      const assignment = await prisma.studentFeeAssignment.create({
        data: {
          tenantId,
          academicYearId,
          studentId: studId,
          studentEnrollmentId: enrollment.id,
          feeStructureId,
          assignmentStatus: FeeAssignmentStatus.ACTIVE,
          assignedByUserId: actorUserId
        }
      });

      // Generate Fee Charges
      if (structure.installments && structure.installments.length > 0) {
        for (const inst of structure.installments) {
          for (const instItem of inst.items) {
            await prisma.feeCharge.create({
              data: {
                tenantId,
                academicYearId,
                studentId: studId,
                studentEnrollmentId: enrollment.id,
                studentFeeAssignmentId: assignment.id,
                feeComponentId: instItem.structureItem.feeComponentId,
                feeInstallmentId: inst.id,
                description: `${instItem.structureItem.component.name} - ${inst.name}`,
                amountMinor: instItem.amountMinor,
                dueDate: inst.dueDate,
                chargeType: FeeChargeType.STRUCTURE,
                status: FeeChargeStatus.OPEN,
                createdByUserId: actorUserId
              }
            });
          }
        }
      } else {
        for (const it of structure.items) {
          await prisma.feeCharge.create({
            data: {
              tenantId,
              academicYearId,
              studentId: studId,
              studentEnrollmentId: enrollment.id,
              studentFeeAssignmentId: assignment.id,
              feeComponentId: it.feeComponentId,
              description: it.component.name,
              amountMinor: it.amountMinor,
              chargeType: FeeChargeType.STRUCTURE,
              status: FeeChargeStatus.OPEN,
              createdByUserId: actorUserId
            }
          });
        }
      }

      results.push(assignment);
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_ASSIGNMENT_BULK',
      entityType: 'StudentFeeAssignment',
      metadata: { studentCount: studentIds.length, feeStructureId }
    });

    return results;
  },

  // ==========================================
  // E. MANUAL CHARGES & REVERSALS
  // ==========================================
  async createManualCharge(
    tenantId: string,
    academicYearId: string,
    data: {
      studentId: string;
      feeComponentId: string;
      amountMinor: number;
      description: string;
      dueDate?: Date;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId: data.studentId, academicYearId, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) throw new AppError(404, 'Active student enrollment not found');

    const charge = await prisma.feeCharge.create({
      data: {
        tenantId,
        academicYearId,
        studentId: data.studentId,
        studentEnrollmentId: enrollment.id,
        feeComponentId: data.feeComponentId,
        description: data.description,
        amountMinor: data.amountMinor,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        chargeType: FeeChargeType.MANUAL,
        status: FeeChargeStatus.OPEN,
        createdByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_CHARGE_MANUAL_CREATE',
      entityType: 'FeeCharge',
      entityId: charge.id,
      newValues: charge
    });

    return charge;
  },

  async reverseCharge(tenantId: string, id: string, reason: string, actorUserId: string, actorEmail: string) {
    const charge = await prisma.feeCharge.findFirst({
      where: { id, tenantId }
    });
    if (!charge) throw new AppError(404, 'Charge not found');
    if (charge.status === FeeChargeStatus.REVERSED || charge.status === FeeChargeStatus.CANCELLED) {
      throw new AppError(400, 'Charge already reversed or cancelled');
    }

    const allocations = await prisma.paymentAllocation.findFirst({
      where: { feeChargeId: id, payment: { status: { in: [PaymentStatus.CONFIRMED, PaymentStatus.RECORDED] } } }
    });
    if (allocations) {
      throw new AppError(400, 'Cannot reverse a charge that has payments allocated to it. Reverse the payments first.');
    }

    const updated = await prisma.feeCharge.update({
      where: { id },
      data: { status: FeeChargeStatus.REVERSED, sourceReference: `Reversal Reason: ${reason}` }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FEE_CHARGE_REVERSE',
      entityType: 'FeeCharge',
      entityId: id,
      newValues: updated,
      metadata: { reason }
    });

    return updated;
  },

  // ==========================================
  // F. CONCESSIONS & SCHOLARSHIPS
  // ==========================================
  async listConcessionSchemes(tenantId: string) {
    return prisma.concessionScheme.findMany({ where: { tenantId } });
  },

  async createConcessionScheme(
    tenantId: string,
    data: { name: string; code?: string; description?: string; concessionType: ConcessionType; value: number; maximumAmountMinor?: number },
    actorUserId: string,
    actorEmail: string
  ) {
    if (data.code) {
      const existing = await prisma.concessionScheme.findFirst({ where: { tenantId, code: data.code } });
      if (existing) throw new AppError(400, 'Concession scheme code already exists');
    }

    const scheme = await prisma.concessionScheme.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        description: data.description,
        concessionType: data.concessionType,
        value: data.value,
        maximumAmountMinor: data.maximumAmountMinor || null,
        status: Status.ACTIVE
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'CONCESSION_SCHEME_CREATE',
      entityType: 'ConcessionScheme',
      entityId: scheme.id,
      newValues: scheme
    });

    return scheme;
  },

  async listStudentConcessions(tenantId: string, academicYearId: string) {
    return prisma.studentConcession.findMany({
      where: { tenantId, academicYearId },
      include: {
        student: true,
        scheme: true
      }
    });
  },

  async applyStudentConcession(
    tenantId: string,
    academicYearId: string,
    data: {
      studentId: string;
      concessionSchemeId: string;
      applicableFeeComponentId?: string;
      approvedAmountMinor?: number;
      percentageBasisPoints?: number;
      reason?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId: data.studentId, academicYearId, isCurrent: true, status: 'ACTIVE' }
    });
    if (!enrollment) throw new AppError(404, 'Active student enrollment not found');

    const scheme = await prisma.concessionScheme.findUnique({
      where: { id: data.concessionSchemeId }
    });
    if (!scheme) throw new AppError(404, 'Concession scheme not found');

    const approvedAmountMinor = data.approvedAmountMinor !== undefined 
      ? data.approvedAmountMinor 
      : (scheme.concessionType === ConcessionType.FIXED_AMOUNT ? scheme.value : null);

    const percentageBasisPoints = data.percentageBasisPoints !== undefined 
      ? data.percentageBasisPoints 
      : (scheme.concessionType === ConcessionType.PERCENTAGE ? scheme.value : null);

    const concession = await prisma.studentConcession.create({
      data: {
        tenantId,
        academicYearId,
        studentId: data.studentId,
        studentEnrollmentId: enrollment.id,
        concessionSchemeId: data.concessionSchemeId,
        applicableFeeComponentId: data.applicableFeeComponentId || null,
        approvedAmountMinor,
        percentageBasisPoints,
        reason: data.reason,
        status: ConcessionStatus.PENDING
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'STUDENT_CONCESSION_APPLY',
      entityType: 'StudentConcession',
      entityId: concession.id,
      newValues: concession
    });

    return concession;
  },

  async approveConcession(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const concession = await prisma.studentConcession.findFirst({ where: { id, tenantId } });
    if (!concession) throw new AppError(404, 'Concession request not found');
    if (concession.status !== ConcessionStatus.PENDING) throw new AppError(400, 'Only pending concessions can be approved');

    const updated = await prisma.studentConcession.update({
      where: { id },
      data: {
        status: ConcessionStatus.APPROVED,
        approvedByUserId: actorUserId,
        approvedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'STUDENT_CONCESSION_APPROVE',
      entityType: 'StudentConcession',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  async rejectConcession(tenantId: string, id: string, actorUserId: string, actorEmail: string) {
    const concession = await prisma.studentConcession.findFirst({ where: { id, tenantId } });
    if (!concession) throw new AppError(404, 'Concession request not found');
    if (concession.status !== ConcessionStatus.PENDING) throw new AppError(400, 'Only pending concessions can be rejected');

    const updated = await prisma.studentConcession.update({
      where: { id },
      data: {
        status: ConcessionStatus.REJECTED,
        approvedByUserId: actorUserId,
        approvedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'STUDENT_CONCESSION_REJECT',
      entityType: 'StudentConcession',
      entityId: id,
      newValues: updated
    });

    return updated;
  },

  // ==========================================
  // G. PAYMENTS & ALLOCATIONS & RECEIPTS
  // ==========================================
  async getSettings(tenantId: string) {
    let settings = await prisma.financeSettings.findUnique({ where: { tenantId } });
    if (!settings) {
      settings = await prisma.financeSettings.create({
        data: {
          tenantId,
          currency: 'INR',
          lateFeeEnabled: false,
          receiptPrefix: 'RCT/',
          receiptSequence: 1
        }
      });
    }
    return settings;
  },

  async updateSettings(tenantId: string, data: any, actorUserId: string, actorEmail: string) {
    const settings = await this.getSettings(tenantId);
    const updated = await prisma.financeSettings.update({
      where: { id: settings.id },
      data
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FINANCE_SETTINGS_UPDATE',
      entityType: 'FinanceSettings',
      entityId: settings.id,
      newValues: updated
    });

    return updated;
  },

  async listPayments(tenantId: string, academicYearId: string) {
    return prisma.payment.findMany({
      where: { tenantId, academicYearId },
      include: {
        student: true,
        allocations: { include: { charge: true } }
      },
      orderBy: { paymentDate: 'desc' }
    });
  },

  async recordPayment(
    tenantId: string,
    academicYearId: string,
    data: {
      studentId: string;
      amountMinor: number;
      paymentDate: Date;
      paymentMethod: PaymentMethod;
      referenceNumber?: string;
      bankName?: string;
      chequeNumber?: string;
      chequeDate?: Date;
      notes?: string;
      idempotencyKey?: string;
      manualAllocations?: { feeChargeId: string; amountMinor: number }[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    if (data.idempotencyKey) {
      const existing = await prisma.payment.findUnique({
        where: { idempotencyKey: data.idempotencyKey }
      });
      if (existing) return existing;
    }

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { tenantId, studentId: data.studentId, academicYearId, isCurrent: true, status: 'ACTIVE' }
    });

    const charges = await prisma.feeCharge.findMany({
      where: {
        tenantId,
        studentId: data.studentId,
        status: { in: [FeeChargeStatus.OPEN, FeeChargeStatus.PARTIALLY_PAID] }
      },
      include: { allocations: true },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }]
    });

    let allocs: { feeChargeId: string; amountMinor: number }[] = [];

    if (data.manualAllocations && data.manualAllocations.length > 0) {
      let sum = 0;
      for (const m of data.manualAllocations) {
        const c = charges.find(ch => ch.id === m.feeChargeId);
        if (!c) throw new AppError(400, `Open charge ${m.feeChargeId} not found`);
        
        const paid = c.allocations.reduce((acc, curr) => acc + curr.amountMinor, 0);
        const outstanding = c.amountMinor - paid;
        if (m.amountMinor > outstanding) {
          throw new AppError(400, `Allocation of ${m.amountMinor} exceeds outstanding balance of ${outstanding} for charge ${c.description}`);
        }
        sum += m.amountMinor;
        allocs.push({ feeChargeId: m.feeChargeId, amountMinor: m.amountMinor });
      }
      if (sum > data.amountMinor) {
        throw new AppError(400, `Sum of allocations (${sum}) exceeds total payment amount (${data.amountMinor})`);
      }
    } else {
      let remainingPayment = data.amountMinor;
      for (const c of charges) {
        if (remainingPayment <= 0) break;

        const paid = c.allocations.reduce((acc, curr) => acc + curr.amountMinor, 0);
        const outstanding = c.amountMinor - paid;

        if (outstanding > 0) {
          const allocate = Math.min(outstanding, remainingPayment);
          allocs.push({ feeChargeId: c.id, amountMinor: allocate });
          remainingPayment -= allocate;
        }
      }
    }

    const settings = await this.getSettings(tenantId);
    const receiptNumber = `${settings.receiptPrefix}${String(settings.receiptSequence).padStart(6, '0')}`;

    const payment = await prisma.payment.create({
      data: {
        tenantId,
        academicYearId,
        studentId: data.studentId,
        studentEnrollmentId: enrollment?.id || null,
        amountMinor: data.amountMinor,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        bankName: data.bankName,
        chequeNumber: data.chequeNumber,
        chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
        notes: data.notes,
        status: PaymentStatus.CONFIRMED,
        recordedByUserId: actorUserId,
        idempotencyKey: data.idempotencyKey
      }
    });

    for (const al of allocs) {
      await prisma.paymentAllocation.create({
        data: {
          tenantId,
          paymentId: payment.id,
          feeChargeId: al.feeChargeId,
          amountMinor: al.amountMinor
        }
      });

      const c = await prisma.feeCharge.findUnique({
        where: { id: al.feeChargeId },
        include: { allocations: true }
      });
      if (c) {
        const totalAllocated = c.allocations.reduce((acc, curr) => acc + curr.amountMinor, 0);
        if (totalAllocated >= c.amountMinor) {
          await prisma.feeCharge.update({ where: { id: c.id }, data: { status: FeeChargeStatus.PAID } });
        } else {
          await prisma.feeCharge.update({ where: { id: c.id }, data: { status: FeeChargeStatus.PARTIALLY_PAID } });
        }
      }
    }

    await prisma.financeSettings.update({
      where: { id: settings.id },
      data: { receiptSequence: settings.receiptSequence + 1 }
    });

    const student = await prisma.student.findUnique({ where: { id: data.studentId } });
    const receipt = await prisma.receipt.create({
      data: {
        tenantId,
        paymentId: payment.id,
        receiptNumber,
        issuedByUserId: actorUserId,
        status: ReceiptStatus.ISSUED,
        snapshotData: {
          receiptNumber,
          paymentId: payment.id,
          studentName: `${student?.firstName} ${student?.lastName}`,
          admissionNumber: student?.admissionNumber || '',
          amountMinor: data.amountMinor,
          paymentMethod: data.paymentMethod,
          paymentDate: payment.paymentDate,
          referenceNumber: data.referenceNumber,
          allocations: allocs
        } as any
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'PAYMENT_RECORDED',
      entityType: 'Payment',
      entityId: payment.id,
      newValues: { payment, receipt }
    });

    return payment;
  },

  async reversePayment(tenantId: string, id: string, reason: string, actorUserId: string, actorEmail: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, tenantId },
      include: { allocations: true, receipts: true }
    });
    if (!payment) throw new AppError(404, 'Payment not found');
    if (payment.status === PaymentStatus.REVERSED) throw new AppError(400, 'Payment already reversed');

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REVERSED }
    });

    if (payment.receipts.length > 0) {
      for (const rec of payment.receipts) {
        await prisma.receipt.update({
          where: { id: rec.id },
          data: { status: ReceiptStatus.VOID }
        });
      }
    }

    for (const alloc of payment.allocations) {
      await prisma.paymentAllocation.delete({ where: { id: alloc.id } });

      const charge = await prisma.feeCharge.findUnique({
        where: { id: alloc.feeChargeId },
        include: { allocations: true }
      });
      if (charge) {
        const totalAllocated = charge.allocations.reduce((acc, curr) => acc + curr.amountMinor, 0);
        if (totalAllocated === 0) {
          await prisma.feeCharge.update({ where: { id: charge.id }, data: { status: FeeChargeStatus.OPEN } });
        } else if (totalAllocated < charge.amountMinor) {
          await prisma.feeCharge.update({ where: { id: charge.id }, data: { status: FeeChargeStatus.PARTIALLY_PAID } });
        }
      }
    }

    const reversal = await prisma.paymentReversal.create({
      data: {
        tenantId,
        paymentId: payment.id,
        reason,
        reversedByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'PAYMENT_REVERSAL',
      entityType: 'Payment',
      entityId: id,
      newValues: { updatedPayment, reversal }
    });

    return updatedPayment;
  },

  // ==========================================
  // H. REFUNDS
  // ==========================================
  async listRefunds(tenantId: string) {
    return prisma.refundRecord.findMany({
      where: { tenantId },
      include: { student: true }
    });
  },

  async recordRefund(
    tenantId: string,
    data: {
      studentId: string;
      paymentId?: string;
      amountMinor: number;
      refundDate: Date;
      refundMethod: PaymentMethod;
      referenceNumber?: string;
      reason: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const refund = await prisma.refundRecord.create({
      data: {
        tenantId,
        studentId: data.studentId,
        paymentId: data.paymentId || null,
        amountMinor: data.amountMinor,
        refundDate: new Date(data.refundDate),
        refundMethod: data.refundMethod,
        referenceNumber: data.referenceNumber,
        reason: data.reason,
        status: RefundStatus.RECORDED,
        recordedByUserId: actorUserId
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'REFUND_RECORDED',
      entityType: 'RefundRecord',
      entityId: refund.id,
      newValues: refund
    });

    return refund;
  },

  // ==========================================
  // I. STUDENT LEDGER & BALANCES Fresh Calculation
  // ==========================================
  async getStudentFeeAccount(tenantId: string, studentId: string, academicYearId: string) {
    const charges = await prisma.feeCharge.findMany({
      where: { tenantId, studentId, academicYearId, status: { notIn: [FeeChargeStatus.REVERSED, FeeChargeStatus.CANCELLED] } }
    });

    const concessions = await prisma.studentConcession.findMany({
      where: { tenantId, studentId, academicYearId, status: ConcessionStatus.APPROVED }
    });

    const payments = await prisma.payment.findMany({
      where: { tenantId, studentId, academicYearId, status: PaymentStatus.CONFIRMED }
    });

    const refunds = await prisma.refundRecord.findMany({
      where: { tenantId, studentId, status: RefundStatus.RECORDED }
    });

    const totalCharges = charges.reduce((acc, curr) => acc + curr.amountMinor, 0);
    
    let totalConcessions = 0;
    for (const c of concessions) {
      if (c.approvedAmountMinor) {
        totalConcessions += c.approvedAmountMinor;
      } else if (c.percentageBasisPoints && c.applicableFeeComponentId) {
        const componentCharges = charges.filter(ch => ch.feeComponentId === c.applicableFeeComponentId);
        const componentSum = componentCharges.reduce((acc, curr) => acc + curr.amountMinor, 0);
        totalConcessions += Math.round((componentSum * c.percentageBasisPoints) / 10000);
      }
    }

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amountMinor, 0);
    const totalRefunded = refunds.reduce((acc, curr) => acc + curr.amountMinor, 0);
    const outstandingBalance = totalCharges - totalConcessions - totalPaid + totalRefunded;

    const today = new Date();
    const overdueCharges = charges.filter(c => c.status !== FeeChargeStatus.PAID && c.dueDate && new Date(c.dueDate) < today);
    const overdueAmount = overdueCharges.reduce((acc, curr) => {
      return acc + curr.amountMinor; 
    }, 0);

    return {
      totalCharges,
      totalConcessions,
      totalPaid,
      totalRefunded,
      outstandingBalance,
      overdueAmount
    };
  },

  async getStudentLedger(tenantId: string, studentId: string, academicYearId: string) {
    const charges = await prisma.feeCharge.findMany({
      where: { tenantId, studentId, academicYearId, status: { notIn: [FeeChargeStatus.REVERSED, FeeChargeStatus.CANCELLED] } },
      orderBy: { createdAt: 'asc' }
    });

    const payments = await prisma.payment.findMany({
      where: { tenantId, studentId, academicYearId, status: { notIn: [PaymentStatus.CANCELLED, PaymentStatus.REVERSED] } },
      orderBy: { paymentDate: 'asc' }
    });

    const concessions = await prisma.studentConcession.findMany({
      where: { tenantId, studentId, academicYearId, status: ConcessionStatus.APPROVED },
      include: { scheme: true }
    });

    const refunds = await prisma.refundRecord.findMany({
      where: { tenantId, studentId, status: RefundStatus.RECORDED },
      orderBy: { refundDate: 'asc' }
    });

    const ledger: any[] = [];

    for (const c of charges) {
      ledger.push({
        date: c.createdAt,
        type: 'DEBIT',
        description: c.description,
        amount: c.amountMinor,
        refId: c.id
      });
    }

    for (const p of payments) {
      ledger.push({
        date: p.paymentDate,
        type: 'CREDIT',
        description: `Payment Received - Ref #${p.referenceNumber || 'N/A'}`,
        amount: p.amountMinor,
        refId: p.id
      });
    }

    for (const con of concessions) {
      let amount = 0;
      if (con.approvedAmountMinor) {
        amount = con.approvedAmountMinor;
      } else if (con.percentageBasisPoints && con.applicableFeeComponentId) {
        const compCharges = charges.filter(ch => ch.feeComponentId === con.applicableFeeComponentId);
        const compSum = compCharges.reduce((acc, curr) => acc + curr.amountMinor, 0);
        amount = Math.round((compSum * con.percentageBasisPoints) / 10000);
      }

      ledger.push({
        date: con.approvedAt || con.createdAt,
        type: 'CREDIT',
        description: `Concession Approved: ${con.scheme.name}`,
        amount,
        refId: con.id
      });
    }

    for (const r of refunds) {
      ledger.push({
        date: r.refundDate,
        type: 'DEBIT',
        description: `Refund Processed: ${r.reason}`,
        amount: r.amountMinor,
        refId: r.id
      });
    }

    ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    const timeline = ledger.map(item => {
      if (item.type === 'DEBIT') {
        balance += item.amount;
      } else if (item.type === 'CREDIT') {
        balance -= item.amount;
      }
      return {
        ...item,
        balance
      };
    });

    return timeline;
  },

  // ==========================================
  // J. REPORTS & DASHBOARD
  // ==========================================
  async getFinanceDashboard(tenantId: string, academicYearId: string) {
    const charges = await prisma.feeCharge.findMany({
      where: { tenantId, academicYearId, status: { notIn: [FeeChargeStatus.REVERSED, FeeChargeStatus.CANCELLED] } }
    });

    const payments = await prisma.payment.findMany({
      where: { tenantId, academicYearId, status: PaymentStatus.CONFIRMED }
    });

    const concessions = await prisma.studentConcession.findMany({
      where: { tenantId, academicYearId, status: ConcessionStatus.APPROVED }
    });

    const totalCharges = charges.reduce((acc, curr) => acc + curr.amountMinor, 0);
    const totalCollected = payments.reduce((acc, curr) => acc + curr.amountMinor, 0);

    let totalConcessions = 0;
    for (const c of concessions) {
      if (c.approvedAmountMinor) {
        totalConcessions += c.approvedAmountMinor;
      } else if (c.percentageBasisPoints && c.applicableFeeComponentId) {
        const compCharges = charges.filter(ch => ch.feeComponentId === c.applicableFeeComponentId);
        const compSum = compCharges.reduce((acc, curr) => acc + curr.amountMinor, 0);
        totalConcessions += Math.round((compSum * c.percentageBasisPoints) / 10000);
      }
    }

    const totalOutstanding = totalCharges - totalCollected - totalConcessions;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayPayments = payments.filter(p => p.paymentDate >= startOfToday && p.paymentDate <= endOfToday);
    const todayCollection = todayPayments.reduce((acc, curr) => acc + curr.amountMinor, 0);

    return {
      totalCharges,
      totalCollected,
      totalOutstanding,
      todayCollection,
      totalConcessions,
      paymentsCount: payments.length
    };
  },

  async getDailyCollectionReport(tenantId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const payments = await prisma.payment.findMany({
      where: {
        tenantId,
        paymentDate: { gte: start, lte: end },
        status: PaymentStatus.CONFIRMED
      },
      include: { student: true }
    });

    const receipts = await prisma.receipt.findMany({
      where: { tenantId, createdAt: { gte: start, lte: end } }
    });

    return payments.map(p => {
      const rec = receipts.find(r => r.paymentId === p.id);
      return {
        receiptNumber: rec?.receiptNumber || 'N/A',
        studentName: `${p.student.firstName} ${p.student.lastName}`,
        admissionNumber: p.student.admissionNumber,
        amount: p.amountMinor,
        method: p.paymentMethod,
        reference: p.referenceNumber || 'N/A',
        status: p.status
      };
    });
  },

  async getOutstandingReport(tenantId: string, academicYearId: string) {
    const students = await prisma.student.findMany({
      where: { tenantId, status: 'ACTIVE' },
      include: {
        enrollments: { where: { academicYearId, isCurrent: true } }
      }
    });

    const report: any[] = [];
    for (const student of students) {
      if (student.enrollments.length === 0) continue;
      const account = await this.getStudentFeeAccount(tenantId, student.id, academicYearId);
      if (account.outstandingBalance > 0) {
        report.push({
          studentId: student.id,
          admissionNumber: student.admissionNumber,
          studentName: `${student.firstName} ${student.lastName}`,
          outstanding: account.outstandingBalance,
          totalDue: account.totalCharges,
          paid: account.totalPaid
        });
      }
    }

    return report;
  }
};
