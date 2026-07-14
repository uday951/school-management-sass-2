import { prisma } from '../prisma';
import { examsService } from '../services/exams.service';
import { 
  AcademicTermType, 
  ExamCycleStatus, 
  ExamType, 
  ExamStatus, 
  ResultStatus, 
  GradingMode, 
  AssessmentComponentType, 
  GradeScaleBasis, 
  EntryStatus, 
  SpecialStatus, 
  CorrectionStatus, 
  SubjectResultStatus, 
  OverallResultStatus,
  SchoolType,
  BoardType,
  UserType,
  Status,
  EmployeeType,
  EmploymentType,
  StudentStatus
} from '@prisma/client';

jest.setTimeout(60000);

describe('Exams, Marks, Results & Report Cards Management (E2E Integration & Security Tests)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let schoolBId: string;
  let academicYearAId: string;
  let classAId: string;
  let sectionAId: string;
  let teacherAUserId: string; // User
  let teacherBUserId: string; // User
  let teacherAId: string; // Employee
  let subjectMathId: string;
  let studentAId: string;
  let studentAUserId: string;
  let enrollmentAId: string;
  let adminAUserId: string;

  beforeAll(async () => {
    // 1. Clean up lingering test data from previous runs
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['exams-tenant-a', 'exams-tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.coScholasticEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.coScholasticArea.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentExamRemark.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.reportCard.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.reportCardTemplate.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentResult.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.subjectResult.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.resultPolicy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.marksCorrectionRequest.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.marksSubmission.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.marksEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeBoundary.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeScale.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.assessmentComponent.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.examSubject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.examTarget.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.exam.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.examCycle.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicTerm.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.teacherAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.subject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // 2. Setup Tenants
    const tenantA = await prisma.tenant.create({ data: { name: 'Exams Tenant A', slug: 'exams-tenant-a' } });
    tenantAId = tenantA.id;
    const tenantB = await prisma.tenant.create({ data: { name: 'Exams Tenant B', slug: 'exams-tenant-b' } });
    tenantBId = tenantB.id;

    // 3. Setup Schools
    const schoolA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'Exams School A',
        code: 'EX-SCH-A',
        slug: 'exams-school-a',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'info@examsa.com',
        officialPhone: '1111111111',
        addressLine1: 'Exams Street',
        city: 'Exams City',
        state: 'Exams State',
        postalCode: '123456',
        status: 'ACTIVE'
      }
    });
    schoolAId = schoolA.id;

    const schoolB = await prisma.school.create({
      data: {
        tenantId: tenantBId,
        name: 'Exams School B',
        code: 'EX-SCH-B',
        slug: 'exams-school-b',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'info@examsb.com',
        officialPhone: '2222222222',
        addressLine1: 'Exams Street B',
        city: 'Exams City B',
        state: 'Exams State B',
        postalCode: '654321',
        status: 'ACTIVE'
      }
    });
    schoolBId = schoolB.id;

    // 4. Setup Academic Session
    const ay = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: '2026-2027',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        status: 'ACTIVE',
        isCurrent: true
      }
    });
    academicYearAId = ay.id;

    // 5. Setup Grade Levels (Classes) & Sections
    const clsA = await prisma.gradeLevel.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Class 10',
        code: 'C10',
        displayOrder: 1,
        status: Status.ACTIVE
      }
    });
    classAId = clsA.id;

    const secA = await prisma.section.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        gradeLevelId: classAId,
        name: 'A',
        code: 'C10-A',
        capacity: 40,
        status: Status.ACTIVE
      }
    });
    sectionAId = secA.id;

    // 6. Setup Subject
    const subMath = await prisma.subject.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Mathematics',
        code: 'MATH10',
        status: Status.ACTIVE
      }
    });
    subjectMathId = subMath.id;

    // 7. Setup Users (Admin, Teachers, Students)
    const admin = await prisma.user.create({
      data: {
        firstName: 'Exams',
        lastName: 'Admin',
        email: 'admin@examsa.com',
        passwordHash: 'dummy',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantAId,
        status: 'ACTIVE'
      }
    });
    adminAUserId = admin.id;

    const tAUser = await prisma.user.create({
      data: {
        firstName: 'Math',
        lastName: 'Teacher',
        email: 'teacher@examsa.com',
        passwordHash: 'dummy',
        userType: UserType.SCHOOL_ADMIN, // Set to admin or teacher
        tenantId: tenantAId,
        status: 'ACTIVE'
      }
    });
    teacherAUserId = tAUser.id;

    const tBUser = await prisma.user.create({
      data: {
        firstName: 'Other',
        lastName: 'Teacher',
        email: 'teacher@examsb.com',
        passwordHash: 'dummy',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantBId,
        status: 'ACTIVE'
      }
    });
    teacherBUserId = tBUser.id;

    // 8. Create Employee Profile for Teacher A
    const emp = await prisma.employee.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: teacherAUserId,
        employeeNumber: 'EMP-001',
        firstName: 'Math',
        lastName: 'Teacher',
        designation: 'Teacher',
        gender: 'MALE',
        dateOfBirth: new Date('1990-01-01'),
        joiningDate: new Date('2025-01-01'),
        status: Status.ACTIVE,
        employeeType: EmployeeType.TEACHING,
        employmentType: EmploymentType.FULL_TIME
      }
    });
    teacherAId = emp.id;

    // 9. Assign Teacher A to Class 10-A Math
    await prisma.teacherAssignment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        employeeId: teacherAId,
        gradeLevelId: classAId,
        sectionId: sectionAId,
        subjectId: subjectMathId,
        academicYearId: academicYearAId,
        status: Status.ACTIVE
      }
    });

    // 10. Setup Student Profile & Enroll in Class 10-A
    const studAUser = await prisma.user.create({
      data: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul@examsa.com',
        passwordHash: 'dummy',
        userType: UserType.STUDENT,
        tenantId: tenantAId,
        status: 'ACTIVE'
      }
    });
    studentAUserId = studAUser.id;

    const studA = await prisma.student.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: studentAUserId,
        admissionNumber: 'ADM-2026-001',
        firstName: 'Rahul',
        lastName: 'Sharma',
        dateOfBirth: new Date('2012-05-15'),
        gender: 'MALE',
        admissionDate: new Date('2026-05-01'),
        status: StudentStatus.ACTIVE,
        currentAddressLine1: 'Street 1',
        currentCity: 'City',
        currentState: 'State',
        currentCountry: 'India',
        currentPostalCode: '110001',
        permanentAddressLine1: 'Street 1',
        permanentCity: 'City',
        permanentState: 'State',
        permanentCountry: 'India',
        permanentPostalCode: '110001'
      }
    });
    studentAId = studA.id;

    const enrol = await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        academicYearId: academicYearAId,
        gradeLevelId: classAId,
        sectionId: sectionAId,
        rollNumber: '15',
        enrollmentDate: new Date('2026-06-01'),
        status: 'ACTIVE',
        isCurrent: true
      }
    });
    enrollmentAId = enrol.id;
  });

  afterAll(async () => {
    // Final cleanup of the test tenants
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['exams-tenant-a', 'exams-tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.coScholasticEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.coScholasticArea.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentExamRemark.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.reportCard.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.reportCardTemplate.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentResult.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.subjectResult.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.resultPolicy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.marksCorrectionRequest.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.marksSubmission.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.marksEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeBoundary.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeScale.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.assessmentComponent.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.examSubject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.examTarget.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.exam.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.examCycle.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicTerm.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.teacherAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.subject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }
  });

  // ==========================================
  // TESTS
  // ==========================================

  it('should create and update Academic Terms & Exam Cycles', async () => {
    // 1. Create Term
    const term = await examsService.createAcademicTerm(
      tenantAId,
      schoolAId,
      {
        academicYearId: academicYearAId,
        name: 'First Semester',
        code: 'SEM-1',
        termType: AcademicTermType.SEMESTER,
        startDate: '2026-06-01',
        endDate: '2026-11-30'
      },
      adminAUserId,
      'admin@examsa.com'
    );
    expect(term.id).toBeDefined();
    expect(term.name).toBe('First Semester');

    // 2. Create Cycle linked to Term
    const cycle = await examsService.createExamCycle(
      tenantAId,
      schoolAId,
      {
        academicYearId: academicYearAId,
        academicTermId: term.id,
        name: 'Mid Term Exams',
        code: 'MID-1'
      },
      adminAUserId,
      'admin@examsa.com'
    );
    expect(cycle.id).toBeDefined();
    expect(cycle.academicTermId).toBe(term.id);
  });

  it('should enforce tenant isolation on Academic Terms and Cycles lookup', async () => {
    // Tenant B attempts to fetch Tenant A terms
    const termList = await examsService.listAcademicTerms(tenantBId, schoolBId, academicYearAId);
    expect(termList.length).toBe(0);
  });

  it('should configure Grade Scale and validate overlapping boundaries', async () => {
    const scale = await examsService.createGradeScale(
      tenantAId,
      schoolAId,
      {
        name: 'A-F Percent Scale',
        calculationBasis: GradeScaleBasis.PERCENTAGE,
        isDefault: true
      },
      adminAUserId,
      'admin@examsa.com'
    );
    expect(scale.isDefault).toBe(true);

    // Save overlapping boundaries (should fail)
    await expect(
      examsService.setGradeBoundaries(
        tenantAId,
        schoolAId,
        scale.id,
        [
          { grade: 'A', minimumValue: 80, maximumValue: 100, sortOrder: 1 },
          { grade: 'B', minimumValue: 70, maximumValue: 85, sortOrder: 2 } // Overlaps with A (80-85)
        ],
        adminAUserId,
        'admin@examsa.com'
      )
    ).rejects.toThrow('Overlapping grade ranges detected');

    // Save valid boundaries
    const bounds = await examsService.setGradeBoundaries(
      tenantAId,
      schoolAId,
      scale.id,
      [
        { grade: 'A', minimumValue: 80, maximumValue: 100, sortOrder: 1 },
        { grade: 'B', minimumValue: 60, maximumValue: 79.99, sortOrder: 2 },
        { grade: 'C', minimumValue: 40, maximumValue: 59.99, sortOrder: 3 },
        { grade: 'F', minimumValue: 0, maximumValue: 39.99, sortOrder: 4 }
      ],
      adminAUserId,
      'admin@examsa.com'
    );
    expect(bounds.length).toBe(4);
  });

  it('should configure Exam targets and validate ExamSubject components weightages', async () => {
    // 1. Create Exam
    const exam = await examsService.createExam(
      tenantAId,
      schoolAId,
      {
        academicYearId: academicYearAId,
        name: 'Half Yearly Examination',
        examType: ExamType.MID_TERM,
        startDate: '2026-09-10',
        endDate: '2026-09-25'
      },
      adminAUserId,
      'admin@examsa.com'
    );

    // 2. Set targets
    await examsService.setExamTargets(
      tenantAId,
      schoolAId,
      exam.id,
      [{ classId: classAId, sectionId: sectionAId }],
      adminAUserId,
      'admin@examsa.com'
    );

    // 3. Add ExamSubject Math
    const exSub = await examsService.addExamSubject(
      tenantAId,
      schoolAId,
      {
        examId: exam.id,
        classId: classAId,
        subjectId: subjectMathId,
        maximumMarks: 100,
        passMarks: 40,
        gradingMode: GradingMode.MARKS_AND_GRADE
      },
      adminAUserId,
      'admin@examsa.com'
    );

    // 4. Configure sub-components (should fail if sum != subject max)
    await expect(
      examsService.setAssessmentComponents(
        tenantAId,
        schoolAId,
        exSub.id,
        [
          { name: 'Theory', componentType: AssessmentComponentType.THEORY, maximumMarks: 70 },
          { name: 'Practical', componentType: AssessmentComponentType.PRACTICAL, maximumMarks: 20 } // Total = 90, expected 100
        ],
        adminAUserId,
        'admin@examsa.com'
      )
    ).rejects.toThrow('The sum of component maximum marks (90) must exactly equal');

    // Configure valid components splits (Theory = 80, Internal = 20)
    const comps = await examsService.setAssessmentComponents(
      tenantAId,
      schoolAId,
      exSub.id,
      [
        { name: 'Theory', componentType: AssessmentComponentType.THEORY, maximumMarks: 80 },
        { name: 'Internal', componentType: AssessmentComponentType.INTERNAL, maximumMarks: 20 }
      ],
      adminAUserId,
      'admin@examsa.com'
    );
    expect(comps.length).toBe(2);
  });

  it('should enforce Teacher Authorization on marks contexts', async () => {
    // Resolve examSubject ID
    const examsList = await examsService.listExams(tenantAId, schoolAId, academicYearAId);
    const hYExam = examsList.find(e => e.name === 'Half Yearly Examination')!;
    const exSubId = hYExam.subjects[0].id;

    // Teacher A (assigned to Class 10-A Math) should have access to roster
    const rosterA = await examsService.getMarksRoster(tenantAId, schoolAId, exSubId, sectionAId, teacherAUserId);
    expect(rosterA.roster.length).toBe(1);
    expect(rosterA.roster[0].studentName).toBe('Rahul Sharma');

    // Teacher B (from Tenant B) should get rejected
    await expect(
      examsService.getMarksRoster(tenantAId, schoolAId, exSubId, sectionAId, teacherBUserId)
    ).rejects.toThrow('Access denied: not an active employee');
  });

  it('should validate marks input ranges, save draft, submit, and lock entries', async () => {
    const examsList = await examsService.listExams(tenantAId, schoolAId, academicYearAId);
    const hYExam = examsList.find(e => e.name === 'Half Yearly Examination')!;
    const exSub = hYExam.subjects[0];
    const compTheoryId = exSub.components.find(c => c.name === 'Theory')!.id;
    const compInternalId = exSub.components.find(c => c.name === 'Internal')!.id;

    // 1. Save draft with invalid marks ( Theory max = 80, saving 85)
    await expect(
      examsService.saveMarksDraft(
        tenantAId,
        schoolAId,
        {
          examSubjectId: exSub.id,
          sectionId: sectionAId,
          entries: [
            {
              studentId: studentAId,
              enrollmentId: enrollmentAId,
              componentId: compTheoryId,
              marksObtained: 85 // exceeding 85/80
            }
          ]
        },
        teacherAUserId,
        'teacher@examsa.com'
      )
    ).rejects.toThrow('must be between 0 and component max marks');

    // 2. Save valid draft
    await examsService.saveMarksDraft(
      tenantAId,
      schoolAId,
      {
        examSubjectId: exSub.id,
        sectionId: sectionAId,
        entries: [
          { studentId: studentAId, enrollmentId: enrollmentAId, componentId: compTheoryId, marksObtained: 72 },
          { studentId: studentAId, enrollmentId: enrollmentAId, componentId: compInternalId, marksObtained: 18 }
        ]
      },
      teacherAUserId,
      'teacher@examsa.com'
    );

    // Roster should show entries in DRAFT
    let roster = await examsService.getMarksRoster(tenantAId, schoolAId, exSub.id, sectionAId, teacherAUserId);
    expect(roster.roster[0].marks[0].marksObtained).toBe(72);
    expect(roster.roster[0].marks[0].entryStatus).toBe('DRAFT');

    // 3. Final Submit
    await examsService.submitMarks(tenantAId, schoolAId, exSub.id, sectionAId, teacherAUserId, 'teacher@examsa.com');

    // Roster should show SUBMITTED
    roster = await examsService.getMarksRoster(tenantAId, schoolAId, exSub.id, sectionAId, teacherAUserId);
    expect(roster.roster[0].marks[0].entryStatus).toBe('SUBMITTED');

    // 4. Admin locks submission context
    const subs = await examsService.getMarksSubmissionsStatus(tenantAId, schoolAId, hYExam.id);
    const subRow = subs.find(s => s.examSubjectId === exSub.id && s.sectionId === sectionAId)!;
    
    await examsService.lockMarks(tenantAId, schoolAId, subRow.id, adminAUserId, 'admin@examsa.com');

    // 5. Try updating locked marks draft (should fail)
    await expect(
      examsService.saveMarksDraft(
        tenantAId,
        schoolAId,
        {
          examSubjectId: exSub.id,
          sectionId: sectionAId,
          entries: [{ studentId: studentAId, enrollmentId: enrollmentAId, componentId: compTheoryId, marksObtained: 75 }]
        },
        teacherAUserId,
        'teacher@examsa.com'
      )
    ).rejects.toThrow('context is locked and cannot be edited');
  });

  it('should run locked marks correction request and review approval workflow', async () => {
    const examsList = await examsService.listExams(tenantAId, schoolAId, academicYearAId);
    const hYExam = examsList.find(e => e.name === 'Half Yearly Examination')!;
    const exSub = hYExam.subjects[0];
    const compTheoryId = exSub.components.find(c => c.name === 'Theory')!.id;

    // Get current marks entry ID
    const entry = await prisma.marksEntry.findFirst({
      where: { tenantId: tenantAId, examId: hYExam.id, examSubjectId: exSub.id, assessmentComponentId: compTheoryId, studentId: studentAId }
    });
    expect(entry).toBeDefined();

    // 1. Teacher requests correction from 72 to 76
    const req = await examsService.requestMarksCorrection(
      tenantAId,
      schoolAId,
      {
        examId: hYExam.id,
        marksEntryId: entry!.id,
        requestedValue: 76,
        reason: 'Addition calculation error'
      },
      teacherAUserId,
      'teacher@examsa.com'
    );
    expect(req.status).toBe(CorrectionStatus.PENDING);
    expect(req.oldValue).toBe(72);
    expect(req.requestedValue).toBe(76);

    // 2. Admin approves correction request
    const approved = await examsService.approveCorrectionRequest(
      tenantAId,
      schoolAId,
      req.id,
      'Approved after verification of answer sheet',
      adminAUserId,
      'admin@examsa.com'
    );
    expect(approved.status).toBe(CorrectionStatus.APPROVED);

    // 3. Roster marks obtained should be updated to 76
    const roster = await examsService.getMarksRoster(tenantAId, schoolAId, exSub.id, sectionAId, teacherAUserId);
    const updatedTheoryMark = roster.roster[0].marks.find((m: any) => m.componentId === compTheoryId)!;
    expect(updatedTheoryMark.marksObtained).toBe(76);
  });

  it('should run result calculation engine, apply grading boundaries, compute ranks and test published visibility checks', async () => {
    const examsList = await examsService.listExams(tenantAId, schoolAId, academicYearAId);
    const hYExam = examsList.find(e => e.name === 'Half Yearly Examination')!;

    // 1. Calculate results (Theory: 76, Internal: 18 -> Total: 94/100 -> Percentage: 94% -> Grade A)
    const results = await examsService.calculateResults(
      tenantAId,
      schoolAId,
      hYExam.id,
      classAId,
      sectionAId,
      adminAUserId,
      'admin@examsa.com'
    );
    expect(results.length).toBe(1);
    expect(results[0].studentResult.totalMarksObtained).toBe(94);
    expect(results[0].studentResult.percentage).toBe(94);
    expect(results[0].studentResult.overallGrade).toBe('A'); // matched A boundary [80 - 100]
    expect(results[0].studentResult.rank).toBe(1);

    // 2. Verify results are hidden from student portal before approval & publishing
    await expect(
      examsService.getStudentPortalExamDetail(tenantAId, studentAUserId, hYExam.id)
    ).rejects.toThrow('Result not published or not found');

    // 3. Admin approves and publishes results
    await examsService.approveResults(tenantAId, schoolAId, hYExam.id, adminAUserId, 'admin@examsa.com');
    await examsService.publishResults(tenantAId, schoolAId, hYExam.id, adminAUserId, 'admin@examsa.com');

    // 4. Verify student can now see results
    const portalRes = await examsService.getStudentPortalExamDetail(tenantAId, studentAUserId, hYExam.id);
    expect(portalRes.overall.totalMarksObtained).toBe(94);
    expect(portalRes.subjects[0].totalMarksObtained).toBe(94);
    expect(portalRes.subjects[0].resultStatus).toBe(SubjectResultStatus.PASS);
  });
});
