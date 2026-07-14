import { employeeService } from '../services/employee.service';
import { prisma } from '../prisma';

jest.setTimeout(30000);

describe('Employee & Academic Assignment Management (Tenant Isolation & Integrity Tests)', () => {
  const testActorId = '60d5ec4b1234567890123456';
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
  let deptAId: string;
  let deptBId: string;
  let roleAId: string;
  let roleBId: string;

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
    const yrA = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: '2026-27 A',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'ACTIVE',
        isCurrent: true,
      },
    });
    academicYearAId = yrA.id;

    const yrB = await prisma.academicYear.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        name: '2026-27 B',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'ACTIVE',
        isCurrent: true,
      },
    });
    academicYearBId = yrB.id;

    // 4. Create Grade Levels
    const grA = await prisma.gradeLevel.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, name: 'Grade 10 A', code: 'G10A', displayOrder: 10 },
    });
    gradeLevelAId = grA.id;

    const grB = await prisma.gradeLevel.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, name: 'Grade 10 B', code: 'G10B', displayOrder: 10 },
    });
    gradeLevelBId = grB.id;

    // 5. Create Sections
    const secA = await prisma.section.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, gradeLevelId: gradeLevelAId, name: 'Sec A', capacity: 30 },
    });
    sectionAId = secA.id;

    const secB = await prisma.section.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, gradeLevelId: gradeLevelBId, name: 'Sec B', capacity: 30 },
    });
    sectionBId = secB.id;

    // 6. Create Departments
    const dA = await prisma.department.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, name: 'Science Dept A', code: 'SCDA', type: 'ACADEMIC' },
    });
    deptAId = dA.id;

    const dB = await prisma.department.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, name: 'Science Dept B', code: 'SCDB', type: 'ACADEMIC' },
    });
    deptBId = dB.id;

    // 7. Create Roles
    const rA = await prisma.role.create({
      data: { tenantId: tenantAId, schoolId: schoolAId, name: 'Teacher Role A', code: 'TRA', isSystem: false },
    });
    roleAId = rA.id;

    const rB = await prisma.role.create({
      data: { tenantId: tenantBId, schoolId: schoolBId, name: 'Teacher Role B', code: 'TRB', isSystem: false },
    });
    roleBId = rB.id;
  });

  afterAll(async () => {
    // Cleanup everything
    await prisma.classTeacherAssignment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.teacherAssignment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.departmentHeadAssignment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.employeeQualification.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.employeeExperience.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.employeeDepartment.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    
    // Delete employees first so user deletions don't trigger SetNull cascades violating unique constraints
    await prisma.employee.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.user.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });

    await prisma.role.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.department.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.subject.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.section.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.academicYear.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.school.deleteMany({ where: { id: { in: [schoolAId, schoolBId] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await prisma.$disconnect();
  });

  describe('Employee Onboarding & Scope Integrity', () => {
    let empAId: string;

    it('should successfully onboard a new employee A under tenant A', async () => {
      const emp = await employeeService.createEmployee(
        tenantAId,
        schoolAId,
        {
          firstName: 'Rohan',
          lastName: 'Sharma',
          employeeType: 'TEACHING',
          employmentType: 'FULL_TIME',
          designation: 'Senior Faculty',
          joiningDate: '2026-06-01',
          primaryDepartmentId: deptAId,
          sameAsCurrentAddress: true,
        },
        testActorId,
        'actor@school.com',
      );

      expect(emp).toBeDefined();
      expect(emp.firstName).toBe('Rohan');
      expect(emp.employeeNumber).toMatch(/^EMP-/);
      empAId = emp.id;
    });

    it('should prevent cross-tenant queries for employee profiles', async () => {
      await expect(
        employeeService.getEmployeeProfile(tenantBId, schoolBId, empAId)
      ).rejects.toThrow();
    });

    it('should support adding qualifications and experience logs dynamically', async () => {
      const q = await employeeService.addQualification(tenantAId, schoolAId, empAId, {
        qualificationName: 'M.Tech Computer Science',
        institution: 'IIT Delhi',
        completionYear: 2020,
      });

      expect(q).toBeDefined();
      expect(q.qualificationName).toBe('M.Tech Computer Science');

      const exp = await employeeService.addExperience(tenantAId, schoolAId, empAId, {
        organizationName: 'Global High School',
        designation: 'Lecturer',
        startDate: '2021-01-01',
        endDate: '2024-05-30',
      });

      expect(exp).toBeDefined();
      expect(exp.designation).toBe('Lecturer');

      // Profile should return qualifications and experience arrays
      const profile = await employeeService.getEmployeeProfile(tenantAId, schoolAId, empAId);
      expect(profile.qualifications).toHaveLength(1);
      expect(profile.experiences).toHaveLength(1);
    });

    it('should handle optional user account creation & permission role assignment', async () => {
      const user = await employeeService.createAccount(
        tenantAId,
        schoolAId,
        empAId,
        {
          loginEmail: `rohan-${Date.now()}@schoolsaas.com`,
          schoolRoleId: roleAId,
          temporaryPassword: 'TempPassword123!',
        },
        testActorId,
        'actor@school.com',
      );

      expect(user).toBeDefined();
      expect(user.roleId).toBe(roleAId);

      const profile = await employeeService.getEmployeeProfile(tenantAId, schoolAId, empAId);
      expect(profile.userId).toBe(user.id);
    });
  });

  describe('Academic Assignments', () => {
    let teacherId: string;
    let subjectId: string;

    beforeAll(async () => {
      // Create a teacher and a subject
      const teacher = await employeeService.createEmployee(
        tenantAId,
        schoolAId,
        {
          firstName: 'Simran',
          lastName: 'Kaur',
          employeeType: 'TEACHING',
          employmentType: 'FULL_TIME',
          designation: 'Math Specialist',
          joiningDate: '2026-06-01',
          sameAsCurrentAddress: true,
        },
        testActorId,
        'actor@school.com',
      );
      teacherId = teacher.id;

      const sub = await prisma.subject.create({
        data: {
          tenantId: tenantAId,
          schoolId: schoolAId,
          name: 'Mathematics',
          code: `MATH-${Date.now()}`,
          status: 'ACTIVE',
        },
      });
      subjectId = sub.id;
    });

    it('should assign teacher to a subject-section mapping', async () => {
      const assignment = await employeeService.createTeacherAssignment(
        tenantAId,
        schoolAId,
        {
          academicYearId: academicYearAId,
          employeeId: teacherId,
          subjectId,
          gradeLevelId: gradeLevelAId,
          sectionId: sectionAId,
        },
        testActorId,
        'actor@school.com',
      );

      expect(assignment).toBeDefined();
      expect(assignment.assignmentType).toBe('PRIMARY');
    });

    it('should prevent assigning non-teaching employees to academic workload', async () => {
      const support = await employeeService.createEmployee(
        tenantAId,
        schoolAId,
        {
          firstName: 'Amit',
          lastName: 'Goyal',
          employeeType: 'SUPPORT',
          employmentType: 'CONTRACT',
          designation: 'Lab Assistant',
          joiningDate: '2026-06-01',
          sameAsCurrentAddress: true,
        },
        testActorId,
        'actor@school.com',
      );

      await expect(
        employeeService.createTeacherAssignment(tenantAId, schoolAId, {
          academicYearId: academicYearAId,
          employeeId: support.id,
          subjectId,
          gradeLevelId: gradeLevelAId,
          sectionId: sectionAId,
        }, testActorId, 'actor@school.com')
      ).rejects.toThrow();
    });

    it('should deactivate the previous primary class teacher when assigning a new one', async () => {
      // 1. Assign Teacher 1 as class teacher for Sec A
      const assign1 = await employeeService.assignClassTeacher(
        tenantAId,
        schoolAId,
        {
          academicYearId: academicYearAId,
          gradeLevelId: gradeLevelAId,
          sectionId: sectionAId,
          employeeId: teacherId,
          isPrimary: true,
        },
        testActorId,
        'actor@school.com',
      );
      expect(assign1.isPrimary).toBe(true);

      // 2. Create another teacher
      const teacher2 = await employeeService.createEmployee(
        tenantAId,
        schoolAId,
        {
          firstName: 'Vikram',
          lastName: 'Mehra',
          employeeType: 'TEACHING',
          employmentType: 'FULL_TIME',
          designation: 'Physics Expert',
          joiningDate: '2026-06-01',
          sameAsCurrentAddress: true,
        },
        testActorId,
        'actor@school.com',
      );

      // 3. Assign Teacher 2 as primary class teacher for Sec A
      const assign2 = await employeeService.assignClassTeacher(
        tenantAId,
        schoolAId,
        {
          academicYearId: academicYearAId,
          gradeLevelId: gradeLevelAId,
          sectionId: sectionAId,
          employeeId: teacher2.id,
          isPrimary: true,
        },
        testActorId,
        'actor@school.com',
      );
      expect(assign2.isPrimary).toBe(true);

      // 4. Verify Teacher 1's assignment is now inactive
      const prevAssign = await prisma.classTeacherAssignment.findUnique({
        where: { id: assign1.id },
      });
      expect(prevAssign?.status).toBe('INACTIVE');
      expect(prevAssign?.isPrimary).toBe(false);
    });
  });
});
