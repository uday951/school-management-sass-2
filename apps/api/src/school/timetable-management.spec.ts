import { prisma } from '../prisma';
import { timetableService } from '../services/timetable.service';
import { attendanceService } from '../services/attendance.service';
import { 
  BellPeriodType, 
  TimetableStatus, 
  TimetableEntryType, 
  AvailabilityType, 
  OverrideType, 
  SubstitutionStatus, 
  RoomType,
  Status,
  UserType,
  EmployeeType,
  EmploymentType,
  SchoolType,
  BoardType,
  EnrollmentStatus
} from '@prisma/client';

jest.setTimeout(60000);

describe('Timetable & Period Scheduling Management (E2E Integration & Security Tests)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let schoolBId: string;
  let academicYearAId: string;
  let classAId: string;
  let sectionAId: string;
  let teacherAId: string; // Employee
  let teacherBId: string; // Employee
  let teacherAUserId: string; // User
  let teacherBUserId: string; // User
  let subjectMathId: string;
  let subjectEngId: string;
  let studentAId: string;
  let studentAUserId: string;
  let guardianAUserId: string;
  let adminAUserId: string;

  beforeAll(async () => {

    // Clean up any potential lingering test data from previous failed runs
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['tenant-a', 'tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.substitution.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.scheduleOverride.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.teacherAvailability.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.timetableEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.timetable.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.room.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.workingDaySchedule.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.bellPeriod.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.bellSchedule.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.schoolWorkingDay.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentGuardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.guardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.teacherAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.classSubject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.subject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // 1. Setup isolated Tenants
    const tenantA = await prisma.tenant.create({ data: { name: 'Tenant A', slug: 'tenant-a' } });
    tenantAId = tenantA.id;
    const tenantB = await prisma.tenant.create({ data: { name: 'Tenant B', slug: 'tenant-b' } });
    tenantBId = tenantB.id;

    // 2. Setup Schools
    const schoolA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'School A',
        code: 'SCH-A',
        slug: 'school-a',
        schoolType: SchoolType.PRIMARY,
        board: BoardType.CBSE,
        officialEmail: 'info@schoola.com',
        officialPhone: '1234567890',
        addressLine1: 'Street A',
        city: 'City A',
        state: 'State A',
        postalCode: '111111',
        status: 'ACTIVE'
      }
    });
    schoolAId = schoolA.id;

    const schoolB = await prisma.school.create({
      data: {
        tenantId: tenantBId,
        name: 'School B',
        code: 'SCH-B',
        slug: 'school-b',
        schoolType: SchoolType.PRIMARY,
        board: BoardType.CBSE,
        officialEmail: 'info@schoolb.com',
        officialPhone: '0987654321',
        addressLine1: 'Street B',
        city: 'City B',
        state: 'State B',
        postalCode: '222222',
        status: 'ACTIVE'
      }
    });
    schoolBId = schoolB.id;

    // 3. Setup users
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'A',
        email: 'admin.a@schoola.com',
        passwordHash: 'dummy',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantAId
      }
    });
    adminAUserId = adminUser.id;

    const tAUser = await prisma.user.create({
      data: {
        firstName: 'Teacher',
        lastName: 'A',
        email: 'teacher.a@schoola.com',
        passwordHash: 'dummy',
        userType: UserType.STUDENT, // using dummy user types just for login resolver
        tenantId: tenantAId
      }
    });
    teacherAUserId = tAUser.id;

    const tBUser = await prisma.user.create({
      data: {
        firstName: 'Teacher',
        lastName: 'B',
        email: 'teacher.b@schoola.com',
        passwordHash: 'dummy',
        userType: UserType.STUDENT,
        tenantId: tenantAId
      }
    });
    teacherBUserId = tBUser.id;

    const sUser = await prisma.user.create({
      data: {
        firstName: 'Student',
        lastName: 'A',
        email: 'student.a@schoola.com',
        passwordHash: 'dummy',
        userType: UserType.STUDENT,
        tenantId: tenantAId
      }
    });
    studentAUserId = sUser.id;

    const gUser = await prisma.user.create({
      data: {
        firstName: 'Guardian',
        lastName: 'A',
        email: 'guardian.a@schoola.com',
        passwordHash: 'dummy',
        userType: UserType.GUARDIAN,
        tenantId: tenantAId
      }
    });
    guardianAUserId = gUser.id;

    // 4. Setup Academic Structures in School A
    const yearA = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: '2026-2027',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        isCurrent: true,
        status: 'ACTIVE'
      }
    });
    academicYearAId = yearA.id;

    const classA = await prisma.gradeLevel.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Grade 10',
        code: 'G10'
      }
    });
    classAId = classA.id;

    const sectionA = await prisma.section.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        gradeLevelId: classAId,
        name: 'Section A'
      }
    });
    sectionAId = sectionA.id;

    // 5. Setup Subjects & Assignments
    const subMath = await prisma.subject.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Mathematics',
        code: 'MATH101'
      }
    });
    subjectMathId = subMath.id;

    const subEng = await prisma.subject.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'English',
        code: 'ENG101'
      }
    });
    subjectEngId = subEng.id;

    // Map ClassSubjects
    await prisma.classSubject.createMany({
      data: [
        {
          tenantId: tenantAId,
          schoolId: schoolAId,
          gradeLevelId: classAId,
          subjectId: subjectMathId,
          academicYearId: academicYearAId
        },
        {
          tenantId: tenantAId,
          schoolId: schoolAId,
          gradeLevelId: classAId,
          subjectId: subjectEngId,
          academicYearId: academicYearAId
        }
      ]
    });

    // Create Teachers (Employees)
    const empA = await prisma.employee.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: teacherAUserId,
        employeeNumber: 'EMP-001',
        firstName: 'Priya',
        lastName: 'Sharma',
        employeeType: EmployeeType.TEACHING,
        employmentType: EmploymentType.FULL_TIME,
        designation: 'Teacher',
        joiningDate: new Date()
      }
    });
    teacherAId = empA.id;

    const empB = await prisma.employee.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: teacherBUserId,
        employeeNumber: 'EMP-002',
        firstName: 'Ravi',
        lastName: 'Kumar',
        employeeType: EmployeeType.TEACHING,
        employmentType: EmploymentType.FULL_TIME,
        designation: 'Teacher',
        joiningDate: new Date()
      }
    });
    teacherBId = empB.id;

    // Create Teacher Assignments
    await prisma.teacherAssignment.createMany({
      data: [
        {
          tenantId: tenantAId,
          schoolId: schoolAId,
          academicYearId: academicYearAId,
          employeeId: teacherAId,
          subjectId: subjectMathId,
          gradeLevelId: classAId,
          sectionId: sectionAId
        },
        {
          tenantId: tenantAId,
          schoolId: schoolAId,
          academicYearId: academicYearAId,
          employeeId: teacherBId,
          subjectId: subjectEngId,
          gradeLevelId: classAId,
          sectionId: sectionAId
        }
      ]
    });

    // Create Student & Enrollment
    const stud = await prisma.student.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: studentAUserId,
        admissionNumber: 'ADM-1001',
        firstName: 'Amit',
        lastName: 'Patel',
        dateOfBirth: new Date('2011-04-15'),
        gender: 'MALE',
        admissionDate: new Date(),
        currentAddressLine1: 'Line 1',
        currentCity: 'City',
        currentState: 'State',
        currentCountry: 'India',
        currentPostalCode: '111111',
        permanentAddressLine1: 'Line 1',
        permanentCity: 'City',
        permanentState: 'State',
        permanentCountry: 'India',
        permanentPostalCode: '111111'
      }
    });
    studentAId = stud.id;

    await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        academicYearId: academicYearAId,
        gradeLevelId: classAId,
        sectionId: sectionAId,
        enrollmentDate: new Date(),
        status: EnrollmentStatus.ACTIVE,
        isCurrent: true
      }
    });

    // Map Guardian
    const guard = await prisma.guardian.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: guardianAUserId,
        firstName: 'Raj',
        lastName: 'Patel',
        phone: '1234567890'
      }
    });

    await prisma.studentGuardian.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        guardianId: guard.id,
        relationship: 'FATHER'
      }
    });
  });

  afterAll(async () => {
    if (tenantAId && tenantBId) {
      // Cleanup databases safely
      await prisma.substitution.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.scheduleOverride.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.teacherAvailability.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.timetableEntry.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.timetable.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.room.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.workingDaySchedule.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.bellPeriod.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.bellSchedule.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.schoolWorkingDay.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.studentGuardian.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.guardian.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.teacherAssignment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.employee.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.classSubject.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.subject.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
      await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    }
  });

  describe('1. Working Days Configuration', () => {
    it('should seed default working days when fetched', async () => {
      const days = await timetableService.getWorkingDays(tenantAId, schoolAId);
      expect(days.length).toBe(7);
      expect(days.find(d => d.dayOfWeek === 'MONDAY')?.isWorkingDay).toBe(true);
      expect(days.find(d => d.dayOfWeek === 'SUNDAY')?.isWorkingDay).toBe(false);
    });

    it('should modify working days configuration successfully', async () => {
      const updates = [
        { dayOfWeek: 'SATURDAY', isWorkingDay: true },
        { dayOfWeek: 'SUNDAY', isWorkingDay: false }
      ];

      await timetableService.updateWorkingDays(tenantAId, schoolAId, updates, adminAUserId, 'admin.a@schoola.com');
      const days = await timetableService.getWorkingDays(tenantAId, schoolAId);
      expect(days.find(d => d.dayOfWeek === 'SATURDAY')?.isWorkingDay).toBe(true);
    });
  });

  describe('2. Bell Schedules & Overlapping validation', () => {
    let schedId: string;

    it('should support creating a bell schedule', async () => {
      const sched = await timetableService.createBellSchedule(
        tenantAId,
        schoolAId,
        { name: 'Regular Schedule', description: 'Standard daily slots', isDefault: true },
        adminAUserId,
        'admin.a@schoola.com'
      );
      schedId = sched.id;
      expect(sched.name).toBe('Regular Schedule');
      expect(sched.isDefault).toBe(true);
    });

    it('should throw an error if periods overlap', async () => {
      const invalidPeriods = [
        { name: 'Period 1', startTime: '09:00', endTime: '09:45', periodType: BellPeriodType.TEACHING, sortOrder: 1 },
        { name: 'Period 2', startTime: '09:30', endTime: '10:15', periodType: BellPeriodType.TEACHING, sortOrder: 2 } // overlapping
      ];

      await expect(
        timetableService.setBellPeriods(tenantAId, schoolAId, schedId, invalidPeriods, adminAUserId, 'admin.a@schoola.com')
      ).rejects.toThrow('overlapping time intervals');
    });

    it('should accept valid non-overlapping periods', async () => {
      const validPeriods = [
        { name: 'Period 1', periodNumber: 1, startTime: '09:00', endTime: '09:45', periodType: BellPeriodType.TEACHING, sortOrder: 1 },
        { name: 'Period 2', periodNumber: 2, startTime: '09:45', endTime: '10:30', periodType: BellPeriodType.TEACHING, sortOrder: 2 },
        { name: 'Break', startTime: '10:30', endTime: '10:45', periodType: BellPeriodType.BREAK, sortOrder: 3 }
      ];

      const res = await timetableService.setBellPeriods(tenantAId, schoolAId, schedId, validPeriods, adminAUserId, 'admin.a@schoola.com');
      expect(res.count).toBe(3);
    });
  });

  describe('3. Timetable building & Conflict detection', () => {
    let timetableId: string;
    let period1Id: string;
    let period2Id: string;
    let roomId: string;

    beforeAll(async () => {
      // Resolve periods
      const bs = await prisma.bellSchedule.findFirst({
        where: { tenantId: tenantAId, isDefault: true },
        include: { bellPeriods: true }
      });
      period1Id = bs!.bellPeriods.find(p => p.startTime === '09:00')!.id;
      period2Id = bs!.bellPeriods.find(p => p.startTime === '09:45')!.id;

      // Create a Room
      const rm = await timetableService.createRoom(
        tenantAId,
        schoolAId,
        { name: 'Room 101', code: 'R101', roomType: RoomType.CLASSROOM, capacity: 40 },
        adminAUserId,
        'admin.a@schoola.com'
      );
      roomId = rm.id;
    });

    it('should successfully establish a timetable draft', async () => {
      const timetable = await timetableService.createTimetableDraft(
        tenantAId,
        schoolAId,
        academicYearAId,
        classAId,
        sectionAId,
        adminAUserId,
        'admin.a@schoola.com'
      );
      timetableId = timetable.id;
      expect(timetable.status).toBe(TimetableStatus.DRAFT);
      expect(timetable.versionNumber).toBe(1);
    });

    it('should validate and save a valid timetable slot entry', async () => {
      const entry = await timetableService.addTimetableEntry(
        tenantAId,
        schoolAId,
        timetableId,
        {
          dayOfWeek: 'MONDAY',
          bellPeriodId: period1Id,
          subjectId: subjectMathId,
          employeeId: teacherAId,
          roomId,
          entryType: TimetableEntryType.SUBJECT
        },
        adminAUserId,
        'admin.a@schoola.com'
      );

      expect(entry.id).toBeDefined();
      expect(entry.employeeId).toBe(teacherAId);
    });

    it('should reject a teacher double booking at overlapping times', async () => {
      // Create a parallel section draft
      const section2 = await prisma.section.create({
        data: { tenantId: tenantAId, schoolId: schoolAId, gradeLevelId: classAId, name: 'Section B' }
      });

      // Map teacher assignment for Ravi to SubjectMath in Section B
      await prisma.teacherAssignment.create({
        data: {
          tenantId: tenantAId,
          schoolId: schoolAId,
          academicYearId: academicYearAId,
          employeeId: teacherAId, // Priyas Sharma again
          subjectId: subjectMathId,
          gradeLevelId: classAId,
          sectionId: section2.id
        }
      });

      const timetableB = await timetableService.createTimetableDraft(
        tenantAId,
        schoolAId,
        academicYearAId,
        classAId,
        section2.id,
        adminAUserId,
        'admin.a@schoola.com'
      );

      // Attempt to schedule Priya Sharma to Section B during same day/period (MONDAY, period 1)
      await expect(
        timetableService.addTimetableEntry(
          tenantAId,
          schoolAId,
          timetableB.id,
          {
            dayOfWeek: 'MONDAY',
            bellPeriodId: period1Id,
            subjectId: subjectMathId,
            employeeId: teacherAId,
            roomId,
            entryType: TimetableEntryType.SUBJECT
          },
          adminAUserId,
          'admin.a@schoola.com'
        )
      ).rejects.toThrow('Conflict detected: Teacher is already booked');
    });

    it('should reject booking a teacher during their unavailable window', async () => {
      // Mark teacher B (Ravi) as unavailable on Monday 09:45 to 10:30
      await timetableService.createTeacherAvailability(
        tenantAId,
        schoolAId,
        {
          employeeId: teacherBId,
          dayOfWeek: 'MONDAY',
          startTime: '09:45',
          endTime: '10:30',
          availabilityType: AvailabilityType.UNAVAILABLE,
          reason: 'Medical check'
        },
        adminAUserId,
        'admin.a@schoola.com'
      );

      // Try scheduling Ravi for English on Monday during period 2 (09:45-10:30)
      await expect(
        timetableService.addTimetableEntry(
          tenantAId,
          schoolAId,
          timetableId,
          {
            dayOfWeek: 'MONDAY',
            bellPeriodId: period2Id,
            subjectId: subjectEngId,
            employeeId: teacherBId,
            roomId,
            entryType: TimetableEntryType.SUBJECT
          },
          adminAUserId,
          'admin.a@schoola.com'
        )
      ).rejects.toThrow('Conflict detected: Teacher is marked as UNAVAILABLE');
    });
  });

  describe('4. Draft vs Published access & Portals', () => {
    let timetableId: string;
    let period1Id: string;

    beforeAll(async () => {
      const timetables = await prisma.timetable.findMany({ where: { tenantId: tenantAId } });
      timetableId = timetables[0].id;
      const bs = await prisma.bellSchedule.findFirst({
        where: { tenantId: tenantAId, isDefault: true },
        include: { bellPeriods: true }
      });
      period1Id = bs!.bellPeriods.find(p => p.startTime === '09:00')!.id;
    });

    it('should NOT allow students to see timetable details while in DRAFT status', async () => {
      const res = await timetableService.getStudentTimetable(tenantAId, studentAUserId);
      expect(res.entries.length).toBe(0);
    });

    it('should publish draft timetable and make it visible in portals', async () => {
      await timetableService.publishTimetable(tenantAId, schoolAId, timetableId, adminAUserId, 'admin.a@schoola.com');
      
      const res = (await timetableService.getStudentTimetable(tenantAId, studentAUserId)) as any;
      expect(res.status).toBe(TimetableStatus.PUBLISHED);
      expect(res.entries.length).toBeGreaterThan(0);
    });

    it('should restrict student portal access to own placement enrollment only', async () => {
      // Query should be bound by their resolved login context, cannot query other sections
      const schedule = (await timetableService.getStudentTimetable(tenantAId, studentAUserId)) as any;
      expect(schedule.classId).toBe(classAId);
      expect(schedule.sectionId).toBe(sectionAId);
    });

    it('should restrict guardian access to linked children profiles only', async () => {
      const schedule = await timetableService.getGuardianChildTimetable(tenantAId, guardianAUserId, studentAId);
      expect(schedule.entries.length).toBeGreaterThan(0);

      // Attempt to access unlinked student ID should fail
      await expect(
        timetableService.getGuardianChildTimetable(tenantAId, guardianAUserId, '6a4929915c56af655b567b18')
      ).rejects.toThrow('Permission denied: this student child is not mapped');
    });
  });

  describe('5. Teacher Substitutions & Period Attendance Authorization', () => {
    let entryId: string;

    beforeAll(async () => {
      const entry = await prisma.timetableEntry.findFirst({
        where: { tenantId: tenantAId }
      });
      entryId = entry!.id;
    });

    it('should assign Ravi Teacher (Teacher B) as substitute for Priya (Teacher A) on a specific date', async () => {
      const dateStr = '2026-07-13';
      const sub = await timetableService.assignSubstitute(
        tenantAId,
        schoolAId,
        {
          date: dateStr,
          timetableEntryId: entryId,
          substituteEmployeeId: teacherBId,
          reason: 'Sick leave'
        },
        adminAUserId,
        'admin.a@schoola.com'
      );

      expect(sub.substituteEmployeeId).toBe(teacherBId);
      expect(sub.status).toBe(SubstitutionStatus.ASSIGNED);
    });

    it('should authorize the substitute teacher to mark period attendance on the substitute date', async () => {
      const date = new Date('2026-07-13');

      // substitute teacher Ravi (teacherBUserId) checks authorization
      const checkSub = await attendanceService.checkTeacherAuthorization(
        tenantAId,
        schoolAId,
        academicYearAId,
        classAId,
        sectionAId,
        teacherBUserId, // Ravi
        UserType.STUDENT, // using Student as dummy type
        date,
        1, // period Number 1
        subjectMathId
      );

      expect(checkSub.isAuthorized).toBe(true);

      // original teacher Priya (teacherAUserId) checks authorization on that day
      const checkOrig = await attendanceService.checkTeacherAuthorization(
        tenantAId,
        schoolAId,
        academicYearAId,
        classAId,
        sectionAId,
        teacherAUserId, // Priya
        UserType.STUDENT,
        date,
        1,
        subjectMathId
      );

      expect(checkOrig.isAuthorized).toBe(false); // replaces original teacher access
    });
  });

  describe('6. Tenant Isolation Boundaries', () => {
    it('should prevent Tenant B from accessing Tenant A timetables list', async () => {
      const res = await timetableService.listTimetables(tenantBId, schoolBId);
      expect(res.length).toBe(0);
    });

    it('should prevent Tenant B from querying Tenant A specific timetable', async () => {
      const timetables = await prisma.timetable.findMany({ where: { tenantId: tenantAId } });
      const timetableAId = timetables[0].id;

      await expect(
        timetableService.getTimetable(tenantBId, schoolBId, timetableAId)
      ).rejects.toThrow('Timetable not found');
    });
  });
});
