import { prisma } from '../prisma';
import { communicationService } from '../services/communication.service';
import { learningService } from '../services/learning.service';
import { 
  SchoolType,
  BoardType,
  UserType,
  EmployeeType,
  EmploymentType,
  EmployeeStatus,
  StudentStatus,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAudienceType,
  HomeworkStatus,
  AssignmentStatus,
  SubmissionStatus,
  StudyMaterialType
} from '@prisma/client';

jest.setTimeout(180000);

describe('Communication & Learning Modules (E2E Integration & Security)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let academicYearAId: string;
  let classAId: string;
  let sectionAId: string;
  let subjectAId: string;

  let teacherAEmployeeId: string;
  let teacherAUserId: string;
  let studentAId: string;
  let studentAUserId: string;
  let guardianAUserId: string;

  const validActorId = '6a48d4072db586bacd5beb4b';

  beforeAll(async () => {
    // 1. Clean up lingering test data from previous runs
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['comm-tenant-a', 'comm-tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.announcementRecipient.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.announcementAudience.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.announcement.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.notification.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.assignmentGrade.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.assignmentSubmission.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.assignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.homework.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studyMaterial.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.teacherAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.classSubject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentGuardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.guardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.subject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // 2. Create Tenant A & B
    const tenantA = await prisma.tenant.create({
      data: { name: 'Comm Tenant A', slug: 'comm-tenant-a' }
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: { name: 'Comm Tenant B', slug: 'comm-tenant-b' }
    });
    tenantBId = tenantB.id;

    // 3. Create Schools
    const schoolA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'School A',
        code: 'SCH-A-COMM',
        slug: 'school-a-comm',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@scha-comm.com',
        officialPhone: '1234567890',
        addressLine1: 'Address A',
        city: 'City A',
        state: 'State A',
        postalCode: '123456'
      }
    });
    schoolAId = schoolA.id;

    // 4. Create Academic Year
    const acadYearA = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: '2026-2027 Academic Year',
        startDate: new Date('2026-06-01T00:00:00Z'),
        endDate: new Date('2027-05-31T00:00:00Z'),
        isCurrent: true
      }
    });
    academicYearAId = acadYearA.id;

    // 5. Create Academics Structure
    const gradeLevel = await prisma.gradeLevel.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Grade 10',
        code: 'G10'
      }
    });
    classAId = gradeLevel.id;

    const section = await prisma.section.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        gradeLevelId: classAId,
        name: 'Section A',
        code: 'SEC-A'
      }
    });
    sectionAId = section.id;

    const subject = await prisma.subject.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Mathematics',
        code: 'MATH101'
      }
    });
    subjectAId = subject.id;

    // 6. Create Users
    const teacherUser = await prisma.user.create({
      data: {
        firstName: 'Teach',
        lastName: 'A',
        email: 'teacher@scha.com',
        passwordHash: 'hash',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantAId
      }
    });
    teacherAUserId = teacherUser.id;

    const studentUser = await prisma.user.create({
      data: {
        firstName: 'Stud',
        lastName: 'A',
        email: 'student@scha.com',
        passwordHash: 'hash',
        userType: UserType.STUDENT,
        tenantId: tenantAId
      }
    });
    studentAUserId = studentUser.id;

    const guardianUser = await prisma.user.create({
      data: {
        firstName: 'Guard',
        lastName: 'A',
        email: 'guardian@scha.com',
        passwordHash: 'hash',
        userType: UserType.GUARDIAN,
        tenantId: tenantAId
      }
    });
    guardianAUserId = guardianUser.id;

    // 7. Create Employee & Student Profiles
    const emp = await prisma.employee.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: teacherAUserId,
        employeeNumber: 'EMP-T1',
        firstName: 'Teach',
        lastName: 'A',
        employeeType: EmployeeType.TEACHING,
        employmentType: EmploymentType.FULL_TIME,
        designation: 'Maths Teacher',
        joiningDate: new Date('2026-06-01T00:00:00Z'),
        status: EmployeeStatus.ACTIVE
      }
    });
    teacherAEmployeeId = emp.id;

    const student = await prisma.student.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: studentAUserId,
        admissionNumber: 'STUD-001',
        firstName: 'Stud',
        lastName: 'A',
        dateOfBirth: new Date('2012-05-15T00:00:00Z'),
        gender: 'MALE',
        currentAddressLine1: 'Address Student',
        currentCity: 'City',
        currentState: 'State',
        currentCountry: 'India',
        currentPostalCode: '123456',
        permanentAddressLine1: 'Address Student',
        permanentCity: 'City',
        permanentState: 'State',
        permanentCountry: 'India',
        permanentPostalCode: '123456',
        admissionDate: new Date('2026-06-01T00:00:00Z'),
        status: StudentStatus.ACTIVE
      }
    });
    studentAId = student.id;

    // Enroll student
    await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        academicYearId: academicYearAId,
        gradeLevelId: classAId,
        sectionId: sectionAId,
        enrollmentDate: new Date('2026-06-01T00:00:00Z'),
        status: 'ACTIVE',
        isCurrent: true
      }
    });

    // Create guardian
    const guard = await prisma.guardian.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: guardianAUserId,
        firstName: 'Guard',
        lastName: 'A',
        phone: '1234567890'
      }
    });

    // Link student & guardian
    await prisma.studentGuardian.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        guardianId: guard.id,
        relationship: 'FATHER',
        isPrimary: true
      }
    });

    // Create TeacherAssignment
    await prisma.teacherAssignment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        academicYearId: academicYearAId,
        employeeId: teacherAEmployeeId,
        subjectId: subjectAId,
        gradeLevelId: classAId,
        sectionId: sectionAId,
        assignmentType: 'PRIMARY',
        status: 'ACTIVE'
      }
    });
  });

  describe('1. Announcements Notice Board', () => {
    let announcementId: string;

    it('should successfully create announcement drafts', async () => {
      const ann = await communicationService.createAnnouncement(
        tenantAId,
        {
          title: 'Exam Schedule Out',
          body: 'The finals schedule is published in the downloads desk.',
          announcementType: AnnouncementType.EXAM,
          priority: AnnouncementPriority.IMPORTANT,
          requiresAcknowledgement: true,
          audiences: [
            { audienceType: AnnouncementAudienceType.ALL_SCHOOL }
          ]
        },
        validActorId,
        'actor@scha.com'
      );

      expect(ann).toBeDefined();
      expect(ann.requiresAcknowledgement).toBe(true);
      announcementId = ann.id;
    });

    it('should resolve targets and build recipient lists on publish', async () => {
      const published = await communicationService.publishAnnouncement(
        tenantAId,
        announcementId,
        validActorId,
        'actor@scha.com'
      );

      expect(published.status).toBe('PUBLISHED');

      // Verify recipient logs exist for student User
      const rec = await prisma.announcementRecipient.findUnique({
        where: {
          tenantId_announcementId_userId: {
            tenantId: tenantAId,
            announcementId,
            userId: studentAUserId
          }
        }
      });
      expect(rec).toBeDefined();
      expect(rec?.readAt).toBeNull();
    });

    it('should record read and acknowledgement timestamps', async () => {
      // Mark read
      await communicationService.markAsRead(tenantAId, announcementId, studentAUserId);
      let rec = await prisma.announcementRecipient.findUnique({
        where: {
          tenantId_announcementId_userId: {
            tenantId: tenantAId,
            announcementId,
            userId: studentAUserId
          }
        }
      });
      expect(rec?.readAt).toBeDefined();
      expect(rec?.acknowledgedAt).toBeNull();

      // Acknowledge
      await communicationService.acknowledge(tenantAId, announcementId, studentAUserId);
      rec = await prisma.announcementRecipient.findUnique({
        where: {
          tenantId_announcementId_userId: {
            tenantId: tenantAId,
            announcementId,
            userId: studentAUserId
          }
        }
      });
      expect(rec?.acknowledgedAt).toBeDefined();
    });

    it('should verify target scope isolation (Tenant B user cannot access Tenant A notices)', async () => {
      const list = await communicationService.listAnnouncementsForUser(tenantBId, studentAUserId, UserType.STUDENT);
      expect(list.length).toBe(0);
    });
  });

  describe('2. Homework Operations', () => {
    let homeworkId: string;

    it('should allow teacher to create homework for authorized subjects', async () => {
      const hw = await learningService.createHomework(
        tenantAId,
        teacherAEmployeeId,
        {
          academicYearId: academicYearAId,
          classId: classAId,
          sectionId: sectionAId,
          subjectId: subjectAId,
          title: 'Algebra Worksheet',
          description: 'Solve questions 1 to 10 on linear equations.',
          assignedDate: '2026-07-10',
          dueDate: '2026-07-15'
        },
        validActorId,
        'actor@scha.com'
      );

      expect(hw).toBeDefined();
      expect(hw.status).toBe(HomeworkStatus.DRAFT);
      homeworkId = hw.id;
    });

    it('should block teacher from creating homework for unauthorized classes/subjects', async () => {
      await expect(
        learningService.createHomework(
          tenantAId,
          teacherAEmployeeId,
          {
            academicYearId: academicYearAId,
            classId: classAId,
            sectionId: sectionAId,
            subjectId: '6a48d4072db586bacd5beb99', // Random subjectId
            title: 'Chemistry Worksheet',
            description: 'Read chapter 3.',
            assignedDate: '2026-07-10'
          },
          validActorId,
          'actor@scha.com'
        )
      ).rejects.toThrow('Teacher is not assigned to this class, section, and subject');
    });

    it('should expose published homework to student class feed', async () => {
      await learningService.publishHomework(tenantAId, homeworkId, validActorId, 'actor@scha.com');

      const list = await learningService.listHomeworkForStudent(tenantAId, studentAId, academicYearAId);
      expect(list.length).toBe(1);
      expect(list[0].title).toBe('Algebra Worksheet');
    });
  });

  describe('3. Assignments & Submissions grading workflow', () => {
    let assignmentId: string;
    let submissionId: string;

    it('should create and publish assignments', async () => {
      const assign = await learningService.createAssignment(
        tenantAId,
        teacherAEmployeeId,
        {
          academicYearId: academicYearAId,
          classId: classAId,
          sectionId: sectionAId,
          subjectId: subjectAId,
          title: 'Maths Weekly Test',
          description: 'Submit PDF answer sheet.',
          assignedAt: '2026-07-10T09:00:00Z',
          dueAt: '2026-07-20T18:00:00Z',
          maximumMarks: 100,
          allowLateSubmission: true
        },
        validActorId,
        'actor@scha.com'
      );

      expect(assign).toBeDefined();
      assignmentId = assign.id;

      await learningService.publishAssignment(tenantAId, assignmentId, validActorId, 'actor@scha.com');
    });

    it('should accept student submission with attachment link', async () => {
      const sub = await learningService.submitAssignment(
        tenantAId,
        studentAId,
        assignmentId,
        {
          textResponse: 'Here is my submission text details.',
          attachmentUrl: 'https://drive.google.com/test-submission'
        },
        academicYearAId
      );

      expect(sub).toBeDefined();
      expect(sub.status).toBe(SubmissionStatus.SUBMITTED);
      submissionId = sub.id;
    });

    it('should block non-linked users from viewing another student submission', async () => {
      await expect(
        learningService.getSubmission(tenantAId, submissionId, 'other-student-id')
      ).rejects.toThrow('Unauthorized access to other student submission');
    });

    it('should validate marks <= maximumMarks and register grade feedback', async () => {
      // Try grading above limit (120/100)
      await expect(
        learningService.gradeSubmission(
          tenantAId,
          submissionId,
          { marksAwarded: 120, feedback: 'Excellent effort but overscored' },
          validActorId,
          'actor@scha.com'
        )
      ).rejects.toThrow('Marks awarded cannot exceed maximum marks');

      // Grade correctly
      const result = await learningService.gradeSubmission(
        tenantAId,
        submissionId,
        { marksAwarded: 95, feedback: 'Great job!' },
        validActorId,
        'actor@scha.com'
      );

      expect(result.grade.marksAwarded).toBe(95);
      expect(result.submission.status).toBe(SubmissionStatus.GRADED);
    });
  });
});
