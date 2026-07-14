import { prisma } from '../prisma';
import { feesService } from '../services/fees.service';
import { 
  SchoolType,
  BoardType,
  UserType,
  Status,
  StudentStatus,
  PaymentMethod,
  PaymentStatus,
  FeeChargeStatus,
  ConcessionType,
  ConcessionStatus,
  AdjustmentType
} from '@prisma/client';

jest.setTimeout(180000);

describe('Fees & Financial Ledger Management (E2E Integration & Security Tests)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let schoolBId: string;
  let academicYearAId: string;
  let academicYearBId: string;
  let classAId: string;
  let studentAId: string;
  let studentBId: string;
  let enrollmentAId: string;
  let categoryAId: string;
  let componentAId: string;
  let structureAId: string;

  const validActorId = '6a48d4072db586bacd5beb4c';

  beforeAll(async () => {
    // 1. Clean up lingering test data from previous runs
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['fees-tenant-a', 'fees-tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.receipt.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.paymentAllocation.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.paymentReversal.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.payment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.refundRecord.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeAdjustment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentConcession.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.concessionScheme.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeCharge.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentFeeAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeInstallmentItem.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeInstallment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeStructureTarget.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeStructureItem.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeStructure.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeComponent.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.feeCategory.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.financeSettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // 2. Create Tenant A
    const tenantA = await prisma.tenant.create({
      data: { name: 'Fees Tenant A', slug: 'fees-tenant-a' }
    });
    tenantAId = tenantA.id;

    // Create Tenant B
    const tenantB = await prisma.tenant.create({
      data: { name: 'Fees Tenant B', slug: 'fees-tenant-b' }
    });
    tenantBId = tenantB.id;

    // 3. Create Schools
    const schoolA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'School A',
        code: 'SCH-A-FEES',
        slug: 'school-a-fees',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@scha-fees.com',
        officialPhone: '1234567890',
        addressLine1: 'Address A',
        city: 'City A',
        state: 'State A',
        postalCode: '123456'
      }
    });
    schoolAId = schoolA.id;

    const schoolB = await prisma.school.create({
      data: {
        tenantId: tenantBId,
        name: 'School B',
        code: 'SCH-B-FEES',
        slug: 'school-b-fees',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@schb-fees.com',
        officialPhone: '0987654321',
        addressLine1: 'Address B',
        city: 'City B',
        state: 'State B',
        postalCode: '654321'
      }
    });
    schoolBId = schoolB.id;

    // 4. Create Academic Years
    const ayA = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'AY 2026-27 A',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        isCurrent: true
      }
    });
    academicYearAId = ayA.id;

    const ayB = await prisma.academicYear.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        name: 'AY 2026-27 B',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        isCurrent: true
      }
    });
    academicYearBId = ayB.id;

    // 5. Create GradeLevel (Class) under Tenant A
    const classA = await prisma.gradeLevel.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Grade 10',
        code: 'G10-FEES'
      }
    });
    classAId = classA.id;

    // 6. Create Student profile under Tenant A
    const studentA = await prisma.student.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        admissionNumber: 'AD-101-FEES',
        firstName: 'Amit',
        lastName: 'Sharma',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'MALE',
        currentAddressLine1: 'Add 1',
        currentCity: 'City',
        currentState: 'State',
        currentCountry: 'India',
        currentPostalCode: '110001',
        permanentAddressLine1: 'Add 1',
        permanentCity: 'City',
        permanentState: 'State',
        permanentCountry: 'India',
        permanentPostalCode: '110001',
        admissionDate: new Date()
      }
    });
    studentAId = studentA.id;

    // Create active enrollment for Student A
    const enrollA = await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        academicYearId: academicYearAId,
        gradeLevelId: classAId,
        sectionId: '6a48d4072db586bacd5beb4c', // valid 12-byte hex ObjectID
        enrollmentDate: new Date(),
        isCurrent: true
      }
    });
    enrollmentAId = enrollA.id;

    // Create Student under Tenant B
    const studentB = await prisma.student.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        admissionNumber: 'AD-202-FEES',
        firstName: 'Rahul',
        lastName: 'Patel',
        dateOfBirth: new Date('2010-06-20'),
        gender: 'MALE',
        currentAddressLine1: 'Add 2',
        currentCity: 'City',
        currentState: 'State',
        currentCountry: 'India',
        currentPostalCode: '110002',
        permanentAddressLine1: 'Add 2',
        permanentCity: 'City',
        permanentState: 'State',
        permanentCountry: 'India',
        permanentPostalCode: '110002',
        admissionDate: new Date()
      }
    });
    studentBId = studentB.id;
  });

  afterAll(async () => {
    // Clean up created entities
    await prisma.receipt.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.paymentAllocation.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.paymentReversal.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.payment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.refundRecord.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeAdjustment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.studentConcession.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.concessionScheme.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeCharge.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.studentFeeAssignment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeInstallmentItem.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeInstallment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeStructureTarget.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeStructureItem.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeStructure.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeComponent.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.feeCategory.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.student.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.academicYear.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.school.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.financeSettings.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
  });

  describe('1. Basic Configuration Setup', () => {
    it('should successfully create fee categories and components', async () => {
      const cat = await feesService.createFeeCategory(
        tenantAId,
        { name: 'Academic', code: 'ACAD', sortOrder: 1 },
        validActorId,
        'actor@test.com'
      );
      categoryAId = cat.id;
      expect(cat.name).toBe('Academic');

      const comp = await feesService.createFeeComponent(
        tenantAId,
        {
          feeCategoryId: categoryAId,
          name: 'Tuition Fee',
          code: 'TUITION',
          componentType: 'CUSTOM',
          isMandatoryDefault: true
        },
        validActorId,
        'actor@test.com'
      );
      componentAId = comp.id;
      expect(comp.name).toBe('Tuition Fee');
    });

    it('should prevent cross-tenant code duplication', async () => {
      const catB = await feesService.createFeeCategory(
        tenantBId,
        { name: 'Academic', code: 'ACAD', sortOrder: 1 },
        validActorId,
        'actor@test.com'
      );
      expect(catB.id).toBeDefined();

      await expect(
        feesService.createFeeCategory(
          tenantAId,
          { name: 'Duplicate Acad', code: 'ACAD', sortOrder: 2 },
          validActorId,
          'actor@test.com'
        )
      ).rejects.toThrow('Fee category code already exists');
    });
  });

  describe('2. Fee Structures & Target Mappings', () => {
    it('should create structure, items, installments, and targets', async () => {
      const struct = await feesService.createFeeStructure(
        tenantAId,
        {
          academicYearId: academicYearAId,
          name: 'Grade 10 General Structure',
          currency: 'INR',
          items: [{ feeComponentId: componentAId, amountMinor: 3000000, isMandatory: true }],
          installments: [
            {
              name: 'Installment 1',
              dueDate: new Date('2026-06-10'),
              items: [{ feeComponentId: componentAId, amountMinor: 1500000 }]
            },
            {
              name: 'Installment 2',
              dueDate: new Date('2026-10-10'),
              items: [{ feeComponentId: componentAId, amountMinor: 1500000 }]
            }
          ],
          targets: [{ classId: classAId }]
        },
        validActorId,
        'actor@test.com'
      );
      structureAId = struct.id;
      expect(struct.name).toBe('Grade 10 General Structure');

      const fullStruct = await feesService.getFeeStructure(tenantAId, structureAId);
      expect(fullStruct.installments.length).toBe(2);
      expect(fullStruct.targets.length).toBe(1);
    });

    it('should prevent Tenant B from reading Tenant A fee structures (Tenant Isolation)', async () => {
      await expect(
        feesService.getFeeStructure(tenantBId, structureAId)
      ).rejects.toThrow('Fee structure not found');
    });
  });

  describe('3. Student Fee Assignment & Charges Billing', () => {
    it('should bulk assign fee structure and generate charges', async () => {
      const assignments = await feesService.assignFeeStructure(
        tenantAId,
        academicYearAId,
        structureAId,
        [studentAId],
        validActorId,
        'actor@test.com'
      );
      expect(assignments.length).toBe(1);

      const charges = await prisma.feeCharge.findMany({
        where: { tenantId: tenantAId, studentId: studentAId }
      });
      expect(charges.length).toBe(2);
      expect(charges[0].amountMinor).toBe(1500000);
      expect(charges[1].amountMinor).toBe(1500000);
    });

    it('should reject assigning Tenant B student to Tenant A fee structure (Cross-tenant assignment)', async () => {
      const assignments = await feesService.assignFeeStructure(
        tenantAId,
        academicYearAId,
        structureAId,
        [studentBId],
        validActorId,
        'actor@test.com'
      );
      expect(assignments.length).toBe(0);
    });

    it('should prevent duplicate active fee structure assignment', async () => {
      const assignments = await feesService.assignFeeStructure(
        tenantAId,
        academicYearAId,
        structureAId,
        [studentAId],
        validActorId,
        'actor@test.com'
      );
      expect(assignments.length).toBe(0);
    });
  });

  describe('4. Ledger & Balance Money Arithmetic', () => {
    it('should calculate initial ledger and balance using integer minor units', async () => {
      const account = await feesService.getStudentFeeAccount(tenantAId, studentAId, academicYearAId);
      expect(account.totalCharges).toBe(3000000);
      expect(account.totalPaid).toBe(0);
      expect(account.outstandingBalance).toBe(3000000);
    });

    it('should handle concessions correctly once approved', async () => {
      const scheme = await feesService.createConcessionScheme(
        tenantAId,
        {
          name: 'Merit Scholarship',
          code: 'MERIT',
          concessionType: ConcessionType.FIXED_AMOUNT,
          value: 500000
        },
        validActorId,
        'actor@test.com'
      );

      const concession = await feesService.applyStudentConcession(
        tenantAId,
        academicYearAId,
        {
          studentId: studentAId,
          concessionSchemeId: scheme.id,
          reason: 'A grade standard'
        },
        validActorId,
        'actor@test.com'
      );

      let account = await feesService.getStudentFeeAccount(tenantAId, studentAId, academicYearAId);
      expect(account.totalConcessions).toBe(0);
      expect(account.outstandingBalance).toBe(3000000);

      await feesService.approveConcession(tenantAId, concession.id, validActorId, 'admin@test.com');

      account = await feesService.getStudentFeeAccount(tenantAId, studentAId, academicYearAId);
      expect(account.totalConcessions).toBe(500000);
      expect(account.outstandingBalance).toBe(2500000);
    });
  });

  describe('5. Payments, Allocations & Reversals', () => {
    it('should process partial payments and auto-allocate FIFO', async () => {
      const payment = await feesService.recordPayment(
        tenantAId,
        academicYearAId,
        {
          studentId: studentAId,
          amountMinor: 1000000,
          paymentDate: new Date(),
          paymentMethod: PaymentMethod.UPI,
          referenceNumber: 'UPI-TXN-101'
        },
        validActorId,
        'actor@test.com'
      );
      expect(payment.id).toBeDefined();

      const allocs = await prisma.paymentAllocation.findMany({
        where: { paymentId: payment.id }
      });
      expect(allocs.length).toBe(1);
      expect(allocs[0].amountMinor).toBe(1000000);

      const account = await feesService.getStudentFeeAccount(tenantAId, studentAId, academicYearAId);
      expect(account.totalPaid).toBe(1000000);
      expect(account.outstandingBalance).toBe(1500000);
    });

    it('should generate a unique receipt matching sequence settings', async () => {
      const receipt = await prisma.receipt.findFirst({
        where: { tenantId: tenantAId }
      });
      expect(receipt?.receiptNumber).toContain('RCT/');
    });

    it('should prevent Tenant B from reading Tenant A payments', async () => {
      await expect(
        feesService.listPayments(tenantBId, academicYearAId)
      ).resolves.toEqual([]);
    });

    it('should support payment reversal', async () => {
      const payments = await feesService.listPayments(tenantAId, academicYearAId);
      const activePayment = payments.find(p => p.status === PaymentStatus.CONFIRMED);
      expect(activePayment).toBeDefined();

      await feesService.reversePayment(tenantAId, activePayment!.id, 'Bounced transaction', validActorId, 'actor@test.com');

      const account = await feesService.getStudentFeeAccount(tenantAId, studentAId, academicYearAId);
      expect(account.totalPaid).toBe(0);
      expect(account.outstandingBalance).toBe(2500000);
    });
  });
});
