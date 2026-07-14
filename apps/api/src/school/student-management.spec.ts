import { studentService } from '../services/student.service';
import { prisma } from '../prisma';

describe('Student & Guardian Management (Tenant Isolation & Data Integrity Tests)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let schoolBId: string;
  let academicYearAId: string;
  let academicYearBId: string;
  let gradeLevelAId: string;
  let gradeLevelBId: string;
  let sectionAId: string;
  let sectionBId: string;

  beforeAll(async () => {
    // 1. Create Tenant A & School A
    const tA = await prisma.tenant.create({
      data: { name: 'Test Tenant A', slug: `tenant-a-${Date.now()}` },
    });
    tenantAId = tA.id;

    const sA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'Test School A',
        code: `TSA-${Date.now()}`,
        slug: `school-a-${Date.now()}`,
        schoolType: 'COMBINED',
        board: 'CBSE',
        officialEmail: `admin@school-a-${Date.now()}.local`,
        officialPhone: '9999999999',
        addressLine1: 'School A Street',
        city: 'City A',
        state: 'State A',
        postalCode: '111111',
      },
    });
    schoolAId = sA.id;

    // 2. Create Tenant B & School B
    const tB = await prisma.tenant.create({
      data: { name: 'Test Tenant B', slug: `tenant-b-${Date.now()}` },
    });
    tenantBId = tB.id;

    const sB = await prisma.school.create({
      data: {
        tenantId: tenantBId,
        name: 'Test School B',
        code: `TSB-${Date.now()}`,
        slug: `school-b-${Date.now()}`,
        schoolType: 'COMBINED',
        board: 'CBSE',
        officialEmail: `admin@school-b-${Date.now()}.local`,
        officialPhone: '8888888888',
        addressLine1: 'School B Street',
        city: 'City B',
        state: 'State B',
        postalCode: '222222',
      },
    });
    schoolBId = sB.id;

    // 3. Create Academic Years
    const ayA = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: '2026-27 A',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        isCurrent: true,
      },
    });
    academicYearAId = ayA.id;

    const ayB = await prisma.academicYear.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        name: '2026-27 B',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        isCurrent: true,
      },
    });
    academicYearBId = ayB.id;

    // 4. Create Grade Levels
    const glA = await prisma.gradeLevel.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, name: 'Grade 10 A', code: 'G10A' },
    });
    gradeLevelAId = glA.id;

    const glB = await prisma.gradeLevel.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, name: 'Grade 10 B', code: 'G10B' },
    });
    gradeLevelBId = glB.id;

    // 5. Create Sections
    const secA = await prisma.section.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, gradeLevelId: gradeLevelAId, name: 'Sec A', capacity: 30 },
    });
    sectionAId = secA.id;

    const secB = await prisma.section.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, gradeLevelId: gradeLevelBId, name: 'Sec B', capacity: 30 },
    });
    sectionBId = secB.id;
  });

  afterAll(async () => {
    // Delete test records to keep db clean
    await prisma.studentDocument.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.studentGuardian.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.guardian.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.student.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.section.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.academicYear.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.school.deleteMany({ where: { id: { in: [schoolAId, schoolBId] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await prisma.$disconnect();
  });

  describe('Student Onboarding & Verification', () => {
    it('should successfully enroll student A inside Tenant A with new guardian details', async () => {
      const result = await studentService.createStudent(
        tenantAId,
        schoolAId,
        {
          firstName: 'Arjun',
          lastName: 'Kumar',
          dateOfBirth: '2012-05-15',
          gender: 'MALE',
          admissionNumber: 'ADM-TA-001',
          admissionDate: '2026-06-01',
          currentAddressLine1: 'Address A',
          currentCity: 'City A',
          currentState: 'State A',
          currentCountry: 'India',
          currentPostalCode: '111111',
          sameAsCurrentAddress: true,
          enrollment: {
            academicYearId: academicYearAId,
            gradeLevelId: gradeLevelAId,
            sectionId: sectionAId,
            rollNumber: '10',
          },
          guardians: [
            {
              firstName: 'Ravi',
              lastName: 'Kumar',
              phone: '9876543210',
              relationship: 'Father',
              isPrimary: true,
              isEmergencyContact: true,
              isAuthorizedPickup: true,
              receivesAcademicUpdates: true,
              receivesAttendanceUpdates: true,
              receivesFeeUpdates: true,
              hasPortalAccess: false,
            },
          ],
        },
        '6a48ca4a087f52c65c92c707', // Mock Actor
        'admin@platform.local',
      );

      expect(result.student.firstName).toBe('Arjun');
      expect(result.student.admissionNumber).toBe('ADM-TA-001');
      expect(result.enrollment.rollNumber).toBe('10');
    });

    it('should reject creating student with duplicate admission number in same school', async () => {
      await expect(
        studentService.createStudent(
          tenantAId,
          schoolAId,
          {
            firstName: 'Sibling',
            lastName: 'Kumar',
            dateOfBirth: '2014-08-20',
            gender: 'FEMALE',
            admissionNumber: 'ADM-TA-001', // Duplicate
            admissionDate: '2026-06-01',
            currentAddressLine1: 'Address A',
            currentCity: 'City A',
            currentState: 'State A',
            currentCountry: 'India',
            currentPostalCode: '111111',
            sameAsCurrentAddress: true,
            enrollment: {
              academicYearId: academicYearAId,
              gradeLevelId: gradeLevelAId,
              sectionId: sectionAId,
            },
            guardians: [
              {
                firstName: 'Ravi',
                lastName: 'Kumar',
                phone: '9876543210',
                relationship: 'Father',
                isPrimary: true,
                isEmergencyContact: true,
                isAuthorizedPickup: true,
                receivesAcademicUpdates: true,
                receivesAttendanceUpdates: true,
                receivesFeeUpdates: true,
                hasPortalAccess: false,
              },
            ],
          },
          '6a48ca4a087f52c65c92c707',
          'admin@platform.local',
        ),
      ).rejects.toThrow('already registered in this school');
    });

    it('should reject enrollment mappings containing cross-tenant references (foreign class levels)', async () => {
      await expect(
        studentService.createStudent(
          tenantAId,
          schoolAId,
          {
            firstName: 'Arjun',
            lastName: 'Kumar',
            dateOfBirth: '2012-05-15',
            gender: 'MALE',
            admissionNumber: 'ADM-TA-002',
            admissionDate: '2026-06-01',
            currentAddressLine1: 'Address A',
            currentCity: 'City A',
            currentState: 'State A',
            currentCountry: 'India',
            currentPostalCode: '111111',
            sameAsCurrentAddress: true,
            enrollment: {
              academicYearId: academicYearAId,
              gradeLevelId: gradeLevelBId, // Foreign Tenant Class
              sectionId: sectionAId,
            },
            guardians: [],
          },
          '6a48ca4a087f52c65c92c707',
          'admin@platform.local',
        ),
      ).rejects.toThrow();
    });
  });

  describe('Tenant isolation check', () => {
    it('should block Tenant B from querying Tenant A students list', async () => {
      const list = await studentService.listStudents(tenantBId, schoolBId, { page: 1, limit: 10 });
      // Student enrolled in Tenant A should not show up here
      const hasA = list.data.some((s) => s.admissionNumber === 'ADM-TA-001');
      expect(hasA).toBe(false);
    });

    it('should block Tenant B from retrieving Tenant A student details profile', async () => {
      const studentA = await prisma.student.findFirst({ where: { tenantId: tenantAId, admissionNumber: 'ADM-TA-001' } });
      expect(studentA).not.toBeNull();

      await expect(
        studentService.getStudentProfile(tenantBId, schoolBId, studentA!.id),
      ).rejects.toThrow();
    });
  });

  describe('Sibling Link support', () => {
    it('should allow enrolling a sibling (Student B) and link them to the same existing guardian', async () => {
      // Find Ravi Kumar (father created for student A)
      const ravi = await prisma.guardian.findFirst({ where: { tenantId: tenantAId, phone: '9876543210' } });
      expect(ravi).not.toBeNull();

      const siblingResult = await studentService.createStudent(
        tenantAId,
        schoolAId,
        {
          firstName: 'Ananya',
          lastName: 'Kumar',
          dateOfBirth: '2015-09-10',
          gender: 'FEMALE',
          admissionNumber: 'ADM-TA-003',
          admissionDate: '2026-06-01',
          currentAddressLine1: 'Address A',
          currentCity: 'City A',
          currentState: 'State A',
          currentCountry: 'India',
          currentPostalCode: '111111',
          sameAsCurrentAddress: true,
          enrollment: {
            academicYearId: academicYearAId,
            gradeLevelId: gradeLevelAId,
            sectionId: sectionAId,
            rollNumber: '11',
          },
          guardians: [
            {
              guardianId: ravi!.id, // Link to existing guardian
              relationship: 'Father',
              isPrimary: true,
              isEmergencyContact: true,
              isAuthorizedPickup: true,
              receivesAcademicUpdates: true,
              receivesAttendanceUpdates: true,
              receivesFeeUpdates: true,
              hasPortalAccess: false,
            },
          ],
        },
        '6a48ca4a087f52c65c92c707',
        'admin@platform.local',
      );

      expect(siblingResult.student.firstName).toBe('Ananya');

      // Check that ravi has 2 linked students
      const raviProfile = await studentService.getGuardianProfile(tenantAId, schoolAId, ravi!.id);
      expect(raviProfile.students.length).toBe(2);
    });
  });
});
