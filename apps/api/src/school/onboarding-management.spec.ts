import { prisma } from '../prisma';
import { importService } from '../services/import.service';
import { inviteService } from '../services/invite.service';
import { onboardingService } from '../services/onboarding.service';
import { ImportJobStatus, ImportRowValidationStatus, ImportRowImportStatus, OnboardingRequestStatus, ChildClaimStatus, UserType } from '@prisma/client';

jest.setTimeout(30000);

describe('Student & Parent Onboarding Management (Integration & Integrity Tests)', () => {
  const testActorId = '60d5ec4b1234567890123456';
  const testActorEmail = 'actor@schoolsaas.com';
  
  let tenantId: string;
  let schoolId: string;
  let academicYearId: string;
  let gradeLevelId: string;
  let sectionId: string;

  beforeAll(async () => {
    // 1. Create Tenant & School
    const tenant = await prisma.tenant.create({
      data: { name: 'Onboarding Tenant', slug: `onb-tenant-${Date.now()}` }
    });
    tenantId = tenant.id;

    const school = await prisma.school.create({
      data: {
        tenantId,
        name: 'Onboarding School',
        code: `ONB-${Date.now()}`,
        slug: `onb-school-${Date.now()}`,
        schoolType: 'COMBINED',
        board: 'CBSE',
        officialEmail: `admin@onb-${Date.now()}.local`,
        officialPhone: '9898989898',
        addressLine1: 'Onboarding Street',
        city: 'City Onb',
        state: 'State Onb',
        postalCode: '111222'
      }
    });
    schoolId = school.id;

    // 2. Create Academic Year
    const yr = await prisma.academicYear.create({
      data: {
        tenantId,
        schoolId,
        name: '2026-27 Onb',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'ACTIVE',
        isCurrent: true
      }
    });
    academicYearId = yr.id;

    // 3. Create Grade Level
    const gr = await prisma.gradeLevel.create({
      data: {
        tenantId,
        schoolId,
        name: 'Grade 10 Onb',
        code: 'G10-ONB',
        displayOrder: 1,
        status: 'ACTIVE'
      }
    });
    gradeLevelId = gr.id;

    // 4. Create Section
    const sec = await prisma.section.create({
      data: {
        tenantId,
        schoolId,
        gradeLevelId,
        name: 'Sec A Onb',
        displayOrder: 1,
        status: 'ACTIVE'
      }
    });
    sectionId = sec.id;
  });

  afterAll(async () => {
    // Clean up in proper database integrity sequence
    await prisma.childClaimRequest.deleteMany({ where: { tenantId } });
    await prisma.studentOnboardingRequest.deleteMany({ where: { tenantId } });
    await prisma.schoolInvite.deleteMany({ where: { tenantId } });
    
    // Import schema relations
    await prisma.importRow.deleteMany({ where: { tenantId } });
    await prisma.importJob.deleteMany({ where: { tenantId } });

    // Student relations
    await prisma.studentGuardian.deleteMany({ where: { tenantId } });
    await prisma.studentEnrollment.deleteMany({ where: { tenantId } });
    await prisma.student.deleteMany({ where: { tenantId } });
    await prisma.guardian.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { tenantId } });
    await prisma.role.deleteMany({ where: { tenantId } });
    
    // Base entities
    await prisma.section.deleteMany({ where: { tenantId } });
    await prisma.gradeLevel.deleteMany({ where: { tenantId } });
    await prisma.academicYear.deleteMany({ where: { tenantId } });
    await prisma.school.deleteMany({ where: { id: schoolId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });

    await prisma.$disconnect();
  });

  describe('CSV Bulk Imports', () => {
    let jobId: string;

    it('should successfully stage a CSV upload and split rows', async () => {
      const csvContent = 
        `admissionNumber,firstName,middleName,lastName,dateOfBirth,gender,admissionDate,academicYear,class,section,rollNumber,studentEmail,studentPhone,guardianFirstName,guardianLastName,guardianRelationship,guardianPhone,guardianEmail,addressLine1,addressLine2,city,state,country,postalCode\n` +
        `ADM-ONB-01,Aryan,,Sen,2010-08-12,MALE,2026-06-01,2026-27 Onb,Grade 10 Onb,Sec A Onb,10,aryan@mail.local,9991112222,Dev,Sen,FATHER,8881112222,dev@mail.local,456 Lane,,City Onb,State Onb,India,111222\n` +
        `ADM-ONB-02,Riya,,Sen,2012-04-10,FEMALE,2026-06-01,2026-27 Onb,Grade 10 Onb,Sec A Onb,11,riya@mail.local,9991113333,Dev,Sen,FATHER,8881112222,dev@mail.local,456 Lane,,City Onb,State Onb,India,111222`;

      const job = await importService.createImportJob(
        tenantId,
        schoolId,
        'test_students.csv',
        csvContent,
        testActorId,
        testActorEmail
      );

      expect(job).toBeDefined();
      expect(job.status).toBe(ImportJobStatus.UPLOADED);
      expect(job.totalRows).toBe(2);
      jobId = job.id;

      const rowsCount = await prisma.importRow.count({ where: { importJobId: jobId } });
      expect(rowsCount).toBe(2);
    });

    it('should run row validations and flag items as ready', async () => {
      const validatedJob = await importService.validateImportJob(tenantId, schoolId, jobId);
      expect(validatedJob.status).toBe(ImportJobStatus.READY);
      expect(validatedJob.validRows).toBe(2);
      expect(validatedJob.invalidRows).toBe(0);

      const rows = await prisma.importRow.findMany({ where: { importJobId: jobId } });
      expect(rows[0].validationStatus).toBe(ImportRowValidationStatus.VALID);
      expect(rows[0].normalizedData).toBeDefined();
    });

    it('should execute import producing student, enrollment, and guardian profiles', async () => {
      const completedJob = await importService.executeImport(
        tenantId,
        schoolId,
        jobId,
        testActorId,
        testActorEmail
      );

      expect(completedJob.status).toBe(ImportJobStatus.COMPLETED);
      expect(completedJob.importedRows).toBe(2);

      // Verify Student 1 exists
      const student1 = await prisma.student.findFirst({
        where: { tenantId, schoolId, admissionNumber: 'ADM-ONB-01' },
        include: { enrollments: true, guardians: { include: { guardian: true } } }
      });
      expect(student1).toBeDefined();
      expect(student1?.firstName).toBe('Aryan');
      expect(student1?.enrollments).toHaveLength(1);
      expect(student1?.enrollments[0].gradeLevelId).toBe(gradeLevelId);
      expect(student1?.enrollments[0].sectionId).toBe(sectionId);
      expect(student1?.guardians).toHaveLength(1);
      expect(student1?.guardians[0].guardian.email).toBe('dev@mail.local');

      // Verify Student 2 links to same Guardian profile (Parent-Sibling linkage)
      const student2 = await prisma.student.findFirst({
        where: { tenantId, schoolId, admissionNumber: 'ADM-ONB-02' },
        include: { guardians: { include: { guardian: true } } }
      });
      expect(student2).toBeDefined();
      expect(student2?.guardians).toHaveLength(1);
      expect(student2?.guardians[0].guardianId).toBe(student1?.guardians[0].guardianId);
    });
  });

  describe('School Invites & Public Self-Registration', () => {
    let inviteCode: string;
    let inviteId: string;
    let requestId: string;

    it('should create an active school invite code', async () => {
      const invite = await inviteService.createInvite(
        tenantId,
        schoolId,
        {
          inviteType: 'SECTION',
          academicYearId,
          classId: gradeLevelId,
          sectionId,
          expiresInDays: 5,
          maxUses: 10,
          requireApproval: true
        },
        testActorId,
        testActorEmail
      );

      expect(invite).toBeDefined();
      expect(invite.status).toBe('ACTIVE');
      expect(invite.publicCode).toBeDefined();
      inviteCode = invite.publicCode;
      inviteId = invite.id;
    });

    it('should resolve minimal public invite scope safely without private metadata leaks', async () => {
      const resolved = await inviteService.resolveInvite(inviteCode);
      expect(resolved.schoolName).toBe('Onboarding School');
      expect(resolved.academicYear?.id).toBe(academicYearId);
      expect(resolved.class?.id).toBe(gradeLevelId);
      expect(resolved.section?.id).toBe(sectionId);
      expect(resolved.requireApproval).toBe(true);
      // Ensure codeHash or creator details are completely absent
      expect((resolved as any).codeHash).toBeUndefined();
      expect((resolved as any).createdByUserId).toBeUndefined();
    });

    it('should allow student registration request submission using public code', async () => {
      const request = await onboardingService.submitStudentRequest(inviteCode, {
        personalData: {
          firstName: 'Soham',
          lastName: 'Dutta',
          dateOfBirth: '2011-09-20',
          gender: 'MALE',
          personalEmail: 'soham@mail.local'
        },
        admissionData: {
          admissionNumber: 'ADM-ONB-03',
          admissionDate: '2026-06-01'
        },
        addressData: {
          currentAddressLine1: '789 Road',
          currentCity: 'City Onb',
          currentState: 'State Onb',
          currentCountry: 'India',
          currentPostalCode: '111222'
        },
        guardianData: {
          firstName: 'Mihir',
          lastName: 'Dutta',
          relationship: 'FATHER',
          phone: '9991114444',
          email: 'mihir@mail.local'
        }
      });

      expect(request).toBeDefined();
      expect(request.status).toBe(OnboardingRequestStatus.PENDING);
      expect(request.personalData).toHaveProperty('firstName', 'Soham');
      requestId = request.id;

      // Usage count incremented
      const updatedInvite = await prisma.schoolInvite.findUnique({ where: { id: inviteId } });
      expect(updatedInvite?.usageCount).toBe(1);
    });

    it('should allow admin approval of requests and create linked user login credentials', async () => {
      const approval = await onboardingService.reviewStudentRequest(
        tenantId,
        schoolId,
        requestId,
        'APPROVE',
        {
          createLoginAccount: true,
          loginEmail: 'soham@schoolsaas.local',
          temporaryPassword: 'SohamPassword123!'
        },
        testActorId,
        testActorEmail
      );

      expect(approval.status).toBe(OnboardingRequestStatus.APPROVED);
      expect(approval.createdStudentId).toBeDefined();

      const student = await prisma.student.findUnique({
        where: { id: approval.createdStudentId! },
        include: { user: true }
      });
      expect(student).toBeDefined();
      expect(student?.userId).toBeDefined();
      expect(student?.user?.email).toBe('soham@schoolsaas.local');
      expect(student?.user?.userType).toBe(UserType.STUDENT);
    });
  });

  describe('Child Claim Workflows', () => {
    let parentUserId: string;
    let claimId: string;

    beforeAll(async () => {
      // Create a test Parent User account
      const parentUser = await prisma.user.create({
        data: {
          tenantId,
          firstName: 'Anup',
          lastName: 'Sen',
          email: 'anup.sen@mail.local',
          passwordHash: 'dummyhash',
          userType: UserType.GUARDIAN,
          status: 'ACTIVE'
        }
      });
      parentUserId = parentUser.id;
    });

    it('should submit child claim mapping to existing student based on verified admission credentials', async () => {
      const claim = await onboardingService.submitChildClaimRequest(tenantId, parentUserId, {
        studentAdmissionNumber: 'ADM-ONB-01',
        studentDateOfBirth: '2010-08-12', // Matches Aryan Sen
        relationship: 'FATHER'
      });

      expect(claim).toBeDefined();
      expect(claim.status).toBe(ChildClaimStatus.PENDING);
      expect(claim.studentAdmissionNumber).toBe('ADM-ONB-01');
      claimId = claim.id;
    });

    it('should prevent child claims with mismatching DOB or admission codes', async () => {
      await expect(
        onboardingService.submitChildClaimRequest(tenantId, parentUserId, {
          studentAdmissionNumber: 'ADM-ONB-01',
          studentDateOfBirth: '2015-01-01', // Incorrect DOB
          relationship: 'FATHER'
        })
      ).rejects.toThrow();
    });

    it('should approve child claim, build profile links, and provision school PARENT role permissions', async () => {
      const approvedClaim = await onboardingService.reviewChildClaim(
        tenantId,
        schoolId,
        claimId,
        'APPROVE',
        undefined,
        testActorId,
        testActorEmail
      );

      expect(approvedClaim.status).toBe(ChildClaimStatus.APPROVED);

      // Verify Guardian profile was mapped
      const guardian = await prisma.guardian.findFirst({
        where: { tenantId, schoolId, userId: parentUserId }
      });
      expect(guardian).toBeDefined();

      // Verify StudentGuardian link created
      const link = await prisma.studentGuardian.findFirst({
        where: { tenantId, schoolId, guardianId: guardian!.id, relationship: 'FATHER' }
      });
      expect(link).toBeDefined();

      // Verify parent user assigned the PARENT role
      const user = await prisma.user.findUnique({
        where: { id: parentUserId },
        include: { role: true }
      });
      expect(user?.role?.code).toBe('PARENT');
    });
  });
});
