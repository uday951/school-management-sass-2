import { prisma } from '../prisma';
import { calendarOpsService } from '../services/calendar-ops.service';
import { visitorGateService } from '../services/visitor-gate.service';
import {
  SchoolType,
  BoardType,
  UserType,
  CalendarEventType,
  WorkingDayExceptionType,
  AnnouncementAudienceType,
  VisitRecordStatus,
  GatePassRequestType,
  GatePassStatus,
  EnrollmentStatus
} from '@prisma/client';

jest.setTimeout(180000);

describe('School Calendar & Visitor Management (E2E Integration & Security)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let academicYearAId: string;
  let studentAId: string;
  let enrollmentAId: string;
  let gradeLevelAId: string;
  let sectionAId: string;
  let userAId: string;
  
  const validActorId = '6a48d4072db586bacd5beb4a';
  const validActorEmail = 'admin@calvis.com';

  beforeAll(async () => {
    // Clean up
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['cal-vis-tenant-a', 'cal-vis-tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.visitRecord.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.visitor.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentGatePass.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.workingDayException.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.calendarEventAudience.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.calendarEvent.deleteMany({ where: { tenantId: { in: oldTenantIds } } });

      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // Create Tenants
    const tenantA = await prisma.tenant.create({ data: { name: 'Cal Vis Tenant A', slug: 'cal-vis-tenant-a' } });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({ data: { name: 'Cal Vis Tenant B', slug: 'cal-vis-tenant-b' } });
    tenantBId = tenantB.id;

    // School
    const schoolA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'School A',
        code: 'SCH-A-CV',
        slug: 'school-a-cv',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@schacv.com',
        officialPhone: '1212121212',
        addressLine1: 'Address A',
        city: 'City A',
        state: 'State A',
        country: 'India',
        postalCode: '110001'
      }
    });
    schoolAId = schoolA.id;

    // Academic Year
    const ay = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'AY 2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'ACTIVE',
        isCurrent: true
      }
    });
    academicYearAId = ay.id;

    // Grade Level & Section
    const grade = await prisma.gradeLevel.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Grade 10',
        code: 'G10',
        displayOrder: 10
      }
    });
    gradeLevelAId = grade.id;

    const sec = await prisma.section.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        gradeLevelId: gradeLevelAId,
        name: 'Section A',
        capacity: 40
      }
    });
    sectionAId = sec.id;

    // User & Student
    const user = await prisma.user.create({
      data: {
        tenantId: tenantAId,
        email: 'student@schacv.com',
        passwordHash: 'hashed',
        userType: UserType.STUDENT,
        firstName: 'Student',
        lastName: 'Name'
      }
    });
    userAId = user.id;

    const student = await prisma.student.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: userAId,
        admissionNumber: 'ADM-102',
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: new Date('2010-06-20'),
        gender: 'FEMALE',
        admissionDate: new Date(),
        currentAddressLine1: 'Addr',
        currentCity: 'City',
        currentState: 'State',
        currentCountry: 'India',
        currentPostalCode: '110001',
        permanentAddressLine1: 'Addr',
        permanentCity: 'City',
        permanentState: 'State',
        permanentCountry: 'India',
        permanentPostalCode: '110001'
      }
    });
    studentAId = student.id;

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        academicYearId: academicYearAId,
        gradeLevelId: gradeLevelAId,
        sectionId: sectionAId,
        rollNumber: '11',
        enrollmentDate: new Date(),
        status: EnrollmentStatus.ACTIVE,
        isCurrent: true
      }
    });
    enrollmentAId = enrollment.id;
  });

  describe('Calendar & Exceptions Tests', () => {
    test('should declare holiday and create working day exception automatically', async () => {
      const holidayDateStr = '2026-08-15';
      const event = await calendarOpsService.createEvent(
        tenantAId,
        {
          academicYearId: academicYearAId,
          title: 'Independence Day',
          eventType: CalendarEventType.HOLIDAY,
          startAt: `${holidayDateStr}T00:00:00.000Z`,
          endAt: `${holidayDateStr}T23:59:59.900Z`,
          allDay: true,
          audiences: [{ audienceType: AnnouncementAudienceType.ALL_SCHOOL }]
        },
        validActorId,
        validActorEmail
      );
      expect(event.title).toBe('Independence Day');

      const isWorking = await calendarOpsService.isWorkingDay(tenantAId, holidayDateStr);
      expect(isWorking).toBe(false);
    });

    test('should allow custom working day exception to override weekends', async () => {
      const sundayStr = '2026-08-16';
      const normalSundayIsWorking = await calendarOpsService.isWorkingDay(tenantAId, sundayStr);
      expect(normalSundayIsWorking).toBe(false);

      await calendarOpsService.createException(
        tenantAId,
        {
          academicYearId: academicYearAId,
          date: sundayStr,
          exceptionType: WorkingDayExceptionType.WORKING_DAY,
          reason: 'Compensatory working day for local holidays'
        },
        validActorId,
        validActorEmail
      );

      const exceptionSundayIsWorking = await calendarOpsService.isWorkingDay(tenantAId, sundayStr);
      expect(exceptionSundayIsWorking).toBe(true);
    });
  });

  describe('Visitor & Gate Pass Tests', () => {
    let visitorId: string;
    let visitId: string;
    let passId: string;

    test('should manage visitor logs checkins and checkouts', async () => {
      const record = await visitorGateService.checkInVisitor(
        tenantAId,
        {
          fullName: 'Guest Alice',
          phone: '9876543210',
          purpose: 'Parent Teacher Meeting',
          badgeNumber: 'B-042'
        },
        validActorId,
        validActorEmail
      );
      visitId = record.id;
      visitorId = record.visitorId;

      expect(record.status).toBe(VisitRecordStatus.CHECKED_IN);
      expect(record.badgeNumber).toBe('B-042');

      const out = await visitorGateService.checkOutVisitor(tenantAId, visitId, validActorId, validActorEmail);
      expect(out.status).toBe(VisitRecordStatus.CHECKED_OUT);
      expect(out.checkOutAt).toBeDefined();
    });

    test('should process student gate pass approvals exit triggers and returns', async () => {
      const pass = await visitorGateService.createGatePass(
        tenantAId,
        {
          studentId: studentAId,
          studentEnrollmentId: enrollmentAId,
          requestType: GatePassRequestType.EARLY_EXIT,
          reason: 'Doctor appointment',
          requestedExitAt: new Date().toISOString()
        },
        validActorId,
        validActorEmail
      );
      passId = pass.id;
      expect(pass.status).toBe(GatePassStatus.PENDING);

      const approved = await visitorGateService.approveGatePass(tenantAId, passId, validActorId, validActorEmail, 'Granted');
      expect(approved.status).toBe(GatePassStatus.APPROVED);

      const exited = await visitorGateService.recordExit(tenantAId, passId, validActorId, validActorEmail);
      expect(exited.status).toBe(GatePassStatus.EXITED);
      expect(exited.actualExitAt).toBeDefined();

      const returned = await visitorGateService.recordReturn(tenantAId, passId, validActorId, validActorEmail);
      expect(returned.status).toBe(GatePassStatus.RETURNED);
      expect(returned.actualReturnAt).toBeDefined();
    });
  });
});
