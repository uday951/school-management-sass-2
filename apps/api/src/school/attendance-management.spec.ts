import { attendanceService } from '../services/attendance.service';
import { prisma } from '../prisma';
import { AttendanceType, AttendanceStatus, AttendanceSessionStatus, CorrectionRequestStatus, Status, UserType } from '@prisma/client';

jest.setTimeout(30000);

describe('Attendance Management System (E2E Integration & Security Tests)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let schoolBId: string;
  let academicYearAId: string;
  let academicYearBId: string;
  let classAId: string;
  let classBId: string;
  let sectionAId: string;
  let sectionBId: string;

  let teacherAUserId: string;
  let teacherBUserId: string;
  let teacherAEmployeeId: string;
  let teacherBEmployeeId: string;

  let studentAId: string;
  let studentBId: string;
  let enrollmentAId: string;
  let enrollmentBId: string;

  let guardianAUserId: string;
  let guardianAProfileId: string;

  beforeAll(async () => {
    // 1. Create Tenant A & School A
    const tA = await prisma.tenant.create({
      data: { name: 'Tenant A', slug: `t-a-${Date.now()}` }
    });
    tenantAId = tA.id;

    const sA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'School A',
        code: `SA-${Date.now()}`,
        slug: `s-a-${Date.now()}`,
        schoolType: 'COMBINED',
        board: 'CBSE',
        officialEmail: `admin@sa-${Date.now()}.local`,
        officialPhone: '1111111111',
        addressLine1: 'Street A',
        city: 'City A',
        state: 'State A',
        postalCode: '123456'
      }
    });
    schoolAId = sA.id;

    // 2. Create Tenant B & School B
    const tB = await prisma.tenant.create({
      data: { name: 'Tenant B', slug: `t-b-${Date.now()}` }
    });
    tenantBId = tB.id;

    const sB = await prisma.school.create({
      data: {
        tenantId: tenantBId,
        name: 'School B',
        code: `SB-${Date.now()}`,
        slug: `s-b-${Date.now()}`,
        schoolType: 'COMBINED',
        board: 'CBSE',
        officialEmail: `admin@sb-${Date.now()}.local`,
        officialPhone: '2222222222',
        addressLine1: 'Street B',
        city: 'City B',
        state: 'State B',
        postalCode: '654321'
      }
    });
    schoolBId = sB.id;

    // 3. Create Academic Years
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

    // 4. Create Grade Levels & Sections
    const glA = await prisma.gradeLevel.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, name: 'Grade 10 A', code: 'G10A' }
    });
    classAId = glA.id;

    const glB = await prisma.gradeLevel.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, name: 'Grade 10 B', code: 'G10B' }
    });
    classBId = glB.id;

    const secA = await prisma.section.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, gradeLevelId: classAId, name: 'Section A' }
    });
    sectionAId = secA.id;

    const secB = await prisma.section.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, gradeLevelId: classBId, name: 'Section B' }
    });
    sectionBId = secB.id;

    // 5. Create Teachers
    const uTeacherA = await prisma.user.create({
      data: {
        firstName: 'Teacher',
        lastName: 'A',
        email: `teacher.a-${Date.now()}@sa.local`,
        passwordHash: 'hash',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantAId
      }
    });
    teacherAUserId = uTeacherA.id;

    const empA = await prisma.employee.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: teacherAUserId,
        employeeNumber: `EMP-${Date.now()}-A`,
        firstName: 'Teacher',
        lastName: 'A',
        employeeType: 'TEACHING',
        employmentType: 'FULL_TIME',
        designation: 'Math Teacher',
        joiningDate: new Date(),
        status: 'ACTIVE'
      }
    });
    teacherAEmployeeId = empA.id;

    const uTeacherB = await prisma.user.create({
      data: {
        firstName: 'Teacher',
        lastName: 'B',
        email: `teacher.b-${Date.now()}@sb.local`,
        passwordHash: 'hash',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantBId
      }
    });
    teacherBUserId = uTeacherB.id;

    const empB = await prisma.employee.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        userId: teacherBUserId,
        employeeNumber: `EMP-${Date.now()}-B`,
        firstName: 'Teacher',
        lastName: 'B',
        employeeType: 'TEACHING',
        employmentType: 'FULL_TIME',
        designation: 'Math Teacher',
        joiningDate: new Date(),
        status: 'ACTIVE'
      }
    });
    teacherBEmployeeId = empB.id;

    // Map Class Teacher Assignment for Teacher A inside Section A
    await prisma.classTeacherAssignment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        academicYearId: academicYearAId,
        gradeLevelId: classAId,
        sectionId: sectionAId,
        employeeId: teacherAEmployeeId,
        isPrimary: true,
        status: Status.ACTIVE
      }
    });

    // 6. Create Students & Enrollments
    const studA = await prisma.student.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        admissionNumber: `ADM-${Date.now()}-A`,
        firstName: 'Arjun',
        lastName: 'A',
        dateOfBirth: new Date('2012-05-15'),
        gender: 'MALE',
        admissionDate: new Date('2026-06-01'),
        currentAddressLine1: 'Street A',
        currentCity: 'City A',
        currentState: 'State A',
        currentCountry: 'India',
        currentPostalCode: '111111',
        permanentAddressLine1: 'Street A',
        permanentCity: 'City A',
        permanentState: 'State A',
        permanentCountry: 'India',
        permanentPostalCode: '111111',
        sameAsCurrentAddress: true,
        status: 'ACTIVE'
      }
    });
    studentAId = studA.id;

    const enrA = await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        academicYearId: academicYearAId,
        gradeLevelId: classAId,
        sectionId: sectionAId,
        enrollmentDate: new Date('2026-06-01'),
        status: 'ACTIVE',
        isCurrent: true,
        startDate: new Date('2026-06-01')
      }
    });
    enrollmentAId = enrA.id;

    const studB = await prisma.student.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        admissionNumber: `ADM-${Date.now()}-B`,
        firstName: 'Rahul',
        lastName: 'B',
        dateOfBirth: new Date('2012-05-15'),
        gender: 'MALE',
        admissionDate: new Date('2026-06-01'),
        currentAddressLine1: 'Street B',
        currentCity: 'City B',
        currentState: 'State B',
        currentCountry: 'India',
        currentPostalCode: '222222',
        permanentAddressLine1: 'Street B',
        permanentCity: 'City B',
        permanentState: 'State B',
        permanentCountry: 'India',
        permanentPostalCode: '222222',
        sameAsCurrentAddress: true,
        status: 'ACTIVE'
      }
    });
    studentBId = studB.id;

    const enrB = await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        studentId: studentBId,
        academicYearId: academicYearBId,
        gradeLevelId: classBId,
        sectionId: sectionBId,
        enrollmentDate: new Date('2026-06-01'),
        status: 'ACTIVE',
        isCurrent: true,
        startDate: new Date('2026-06-01')
      }
    });
    enrollmentBId = enrB.id;

    // 7. Create Guardian & Link to Student A
    const uGuard = await prisma.user.create({
      data: {
        firstName: 'Parent',
        lastName: 'A',
        email: `parent.a-${Date.now()}@sa.local`,
        passwordHash: 'hash',
        userType: UserType.GUARDIAN,
        tenantId: tenantAId
      }
    });
    guardianAUserId = uGuard.id;

    const guardProfile = await prisma.guardian.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: guardianAUserId,
        firstName: 'Parent',
        lastName: 'A',
        phone: '9876543210',
        email: uGuard.email,
        status: Status.ACTIVE
      }
    });
    guardianAProfileId = guardProfile.id;

    await prisma.studentGuardian.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        guardianId: guardianAProfileId,
        relationship: 'FATHER',
        isPrimary: true
      }
    });
  });

  afterAll(async () => {
    // Wipe test data in correct dependency order
    await prisma.attendanceCorrectionItem.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.attendanceCorrectionRequest.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.attendanceRecord.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.attendanceSession.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.attendancePolicy.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.studentGuardian.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.guardian.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.studentEnrollment.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.student.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.classTeacherAssignment.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.employee.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [teacherAUserId, teacherBUserId, guardianAUserId] } }
    });
    await prisma.section.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.gradeLevel.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.academicYear.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.school.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } }
    });
    await prisma.tenant.deleteMany({
      where: { id: { in: [tenantAId, tenantBId] } }
    });
  });

  // Test cases
  it('should enforce tenant isolation on settings/policy', async () => {
    // Tenant A fetches settings
    const policyA = await attendanceService.getPolicy(tenantAId, schoolAId);
    expect(policyA.tenantId).toBe(tenantAId);

    // Tenant B fetches settings
    const policyB = await attendanceService.getPolicy(tenantBId, schoolBId);
    expect(policyB.tenantId).toBe(tenantBId);
    expect(policyA.id).not.toBe(policyB.id);
  });

  it('should verify teacher authorization constraints', async () => {
    // Teacher A (assigned in Section A) should be authorized for Section A
    const auth1 = await attendanceService.checkTeacherAuthorization(
      tenantAId,
      schoolAId,
      academicYearAId,
      classAId,
      sectionAId,
      teacherAUserId,
      UserType.SCHOOL_ADMIN
    );
    expect(auth1.isAuthorized).toBe(true);

    // Teacher B (from Tenant B) should NOT be authorized for Section A in Tenant A
    const auth2 = await attendanceService.checkTeacherAuthorization(
      tenantAId,
      schoolAId,
      academicYearAId,
      classAId,
      sectionAId,
      teacherBUserId,
      UserType.SCHOOL_ADMIN
    );
    expect(auth2.isAuthorized).toBe(false);
  });

  it('should compute roster lists correctly from active enrollments', async () => {
    const roster = await attendanceService.resolveRoster(
      tenantAId,
      schoolAId,
      academicYearAId,
      classAId,
      sectionAId,
      new Date('2026-07-15')
    );
    expect(roster.length).toBe(1);
    expect(roster[0].studentId).toBe(studentAId);
  });

  it('should save a daily attendance draft successfully and support upserting', async () => {
    const dateStr = '2026-07-15';
    
    // Save draft
    const draft = await attendanceService.saveDraft(
      tenantAId,
      schoolAId,
      academicYearAId,
      classAId,
      sectionAId,
      dateStr,
      {
        attendanceType: AttendanceType.DAILY,
        records: [{ studentId: studentAId, studentEnrollmentId: enrollmentAId, status: AttendanceStatus.PRESENT }]
      },
      teacherAUserId,
      'teacher.a@sa.local',
      UserType.SCHOOL_ADMIN
    );

    expect(draft.status).toBe(AttendanceSessionStatus.DRAFT);

    // Check saved record
    const records = await prisma.attendanceRecord.findMany({
      where: { attendanceSessionId: draft.id }
    });
    expect(records.length).toBe(1);
    expect(records[0].status).toBe(AttendanceStatus.PRESENT);

    // Update draft to ABSENT (upsert check)
    const draft2 = await attendanceService.saveDraft(
      tenantAId,
      schoolAId,
      academicYearAId,
      classAId,
      sectionAId,
      dateStr,
      {
        attendanceType: AttendanceType.DAILY,
        records: [{ studentId: studentAId, studentEnrollmentId: enrollmentAId, status: AttendanceStatus.ABSENT }]
      },
      teacherAUserId,
      'teacher.a@sa.local',
      UserType.SCHOOL_ADMIN
    );

    expect(draft2.id).toBe(draft.id);

    const records2 = await prisma.attendanceRecord.findMany({
      where: { attendanceSessionId: draft.id }
    });
    expect(records2.length).toBe(1);
    expect(records2[0].status).toBe(AttendanceStatus.ABSENT);
  });

  it('should exclude draft sessions from reporting totals', async () => {
    // Currently, 2026-07-15 is in DRAFT. Class report should return total: 0
    const report = await attendanceService.getClassReport(
      tenantAId,
      schoolAId,
      academicYearAId,
      classAId,
      sectionAId,
      '2026-07-01',
      '2026-07-31'
    );
    expect(report.length).toBe(1);
    expect(report[0].total).toBe(0);
  });

  it('should submit daily session and lock changes', async () => {
    const dateStr = '2026-07-15';
    const session = await prisma.attendanceSession.findFirst({
      where: { tenantId: tenantAId, schoolId: schoolAId, classId: classAId, sectionId: sectionAId }
    });
    expect(session).toBeTruthy();

    const submitted = await attendanceService.submitAttendance(
      tenantAId,
      schoolAId,
      session!.id,
      {
        records: [{ studentId: studentAId, studentEnrollmentId: enrollmentAId, status: AttendanceStatus.PRESENT }]
      },
      teacherAUserId,
      'teacher.a@sa.local',
      UserType.SCHOOL_ADMIN
    );

    expect(submitted.status).toBe(AttendanceSessionStatus.SUBMITTED);

    // Class report should now show 1 total session
    const report = await attendanceService.getClassReport(
      tenantAId,
      schoolAId,
      academicYearAId,
      classAId,
      sectionAId,
      '2026-07-01',
      '2026-07-31'
    );
    expect(report[0].total).toBe(1);
    expect(report[0].present).toBe(1);

    // Admin locks session
    const locked = await attendanceService.lockSession(
      tenantAId,
      schoolAId,
      session!.id,
      teacherAUserId,
      'teacher.a@sa.local'
    );
    expect(locked.status).toBe(AttendanceSessionStatus.LOCKED);

    // Trying to save draft or submit again on a locked session should fail
    await expect(
      attendanceService.submitAttendance(
        tenantAId,
        schoolAId,
        session!.id,
        { records: [] },
        teacherAUserId,
        'teacher.a@sa.local',
        UserType.SCHOOL_ADMIN
      )
    ).rejects.toThrow();
  });

  it('should manage correction workflow requests and approvals', async () => {
    const session = await prisma.attendanceSession.findFirst({
      where: { tenantId: tenantAId, schoolId: schoolAId, classId: classAId, sectionId: sectionAId }
    });
    const record = await prisma.attendanceRecord.findFirst({
      where: { attendanceSessionId: session!.id }
    });

    // Request correction: PRESENT -> ABSENT
    const request = await attendanceService.requestCorrection(
      tenantAId,
      schoolAId,
      session!.id,
      {
        reason: 'Forgot sick note',
        items: [{
          attendanceRecordId: record!.id,
          oldStatus: record!.status,
          requestedStatus: AttendanceStatus.ABSENT,
          reason: 'Sick leave validated'
        }]
      },
      teacherAUserId,
      'teacher.a@sa.local'
    );

    expect(request.status).toBe(CorrectionRequestStatus.PENDING);

    // Approve request
    const approved = await attendanceService.reviewCorrection(
      tenantAId,
      schoolAId,
      request.id,
      'APPROVE',
      'Slip validated',
      teacherAUserId,
      'teacher.a@sa.local'
    );
    expect(approved.status).toBe(CorrectionRequestStatus.APPROVED);

    // Verify record has mutated to ABSENT
    const updatedRecord = await prisma.attendanceRecord.findUnique({
      where: { id: record!.id }
    });
    expect(updatedRecord!.status).toBe(AttendanceStatus.ABSENT);
  });

  it('should enforce portal restrictions for student and guardian readings', async () => {
    // Student A reads their own summary
    const summary = await attendanceService.getStudentSummary(tenantAId, studentAId);
    expect(summary.percentage).toBe(0.0); // 1 unexcused absence = 0%
    expect(summary.stats.total).toBe(1);

    // Guardian A reads linked child Student A summary
    const guardSummary = await attendanceService.getGuardianChildSummary(
      tenantAId,
      guardianAUserId,
      studentAId
    );
    expect(guardSummary.percentage).toBe(0.0);

    // Guardian A tries to read Student B (unlinked child in Tenant B) -> throws
    await expect(
      attendanceService.getGuardianChildSummary(tenantAId, guardianAUserId, studentBId)
    ).rejects.toThrow();
  });
});
