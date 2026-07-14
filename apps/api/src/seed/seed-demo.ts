/**
 * Phase 12.5 – Complete Connected School Simulation Seed
 *
 * Greenfield International School (GIS-DEMO-2026)
 * + Riverside Demo School (isolation testing)
 *
 * SAFE: Only touches slugs greenfield-demo / riverside-demo.
 * IDEMPOTENT: Cleans previous run before seeding.
 * NEVER touches production data.
 */

import {
  PrismaClient,
  SchoolType,
  BoardType,
  EmployeeType,
  EmploymentType,
  TimetableEntryType,
  BellPeriodType,
  DepartmentType,
  SubjectType,
  AttendanceStatus,
  AttendanceType,
  AttendanceSessionStatus,
  LeaveRequestStatus,
  AnnouncementStatus,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAudienceType,
  HomeworkStatus,
  AssignmentStatus,
  SubmissionStatus,
  StudyMaterialStatus,
  StudyMaterialType,
  BookCopyStatus,
  BorrowerType,
  LoanStatus,
  TripType,
  PaymentMethod,
  PaymentStatus,
  FeeChargeType,
  FeeChargeStatus,
  FeeAssignmentStatus,
  VisitRecordStatus,
  GatePassStatus,
  GatePassRequestType,
  CalendarEventType,
  CalendarEventStatus,
  ExamType,
  ExamStatus,
  ResultStatus,
  GradingMode,
  EntryStatus,
  OverallResultStatus,
  SubjectResultStatus,
  GradeScaleBasis,
  StaffAttendanceStatus,
  StaffAttendanceSource,
  Status,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL?.includes('connectTimeoutMS')
        ? process.env.DATABASE_URL
        : (process.env.DATABASE_URL || '') + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connectTimeoutMS=60000&socketTimeoutMS=60000&serverSelectionTimeoutMS=60000',
    },
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD || 'password123';

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = today();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = today();
  d.setDate(d.getDate() + n);
  return d;
}

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
function todayDayName(): string {
  return DAYS[new Date().getDay()];
}

// ---------------------------------------------------------------------------
// Cleanup helpers
// ---------------------------------------------------------------------------

async function cleanDemoTenants(oldTenantIds: string[], oldUserIds: string[]) {
  if (oldTenantIds.length === 0) return;
  console.log('  🧹 Cleaning old demo records...');

  // Delete in dependency order (children before parents)
  await prisma.assignmentGrade.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.assignmentSubmission.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.assignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studyMaterial.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.homework.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.announcementRecipient.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.announcementAudience.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.announcement.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.notification.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.calendarEventAudience.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.workingDayException.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.calendarEvent.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.visitRecord.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.visitor.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentGatePass.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.transportAttendance.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.transportOverride.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentTransportAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.transportTrip.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.routeStop.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.transportRoute.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.transportStop.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.driverProfile.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.vehicle.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.libraryFine.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.libraryLoan.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.bookReservation.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.bookAuthor.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.bookCopy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.book.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.author.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.publisher.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.bookCategory.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.reportCard.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentExamRemark.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.coScholasticEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.coScholasticArea.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.subjectResult.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentResult.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.marksCorrectionRequest.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.marksEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.marksSubmission.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.assessmentComponent.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.examSubject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.examTarget.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.exam.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.examCycle.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.academicTerm.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.gradeBoundary.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.gradeScale.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.paymentAllocation.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.receipt.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.payment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeAdjustment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentConcession.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeCharge.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeInstallmentItem.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeInstallment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeStructureItem.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeStructureTarget.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentFeeAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeStructure.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeComponent.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.feeCategory.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.attendanceCorrectionItem.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.attendanceCorrectionRequest.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.attendanceRecord.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.attendanceSession.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.staffAttendanceRecord.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.leaveRequest.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.employeeLeaveBalance.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.leaveType.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.substitution.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.scheduleOverride.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.timetableEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.timetable.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.bellPeriod.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.workingDaySchedule.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.bellSchedule.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.schoolWorkingDay.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.classSubject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.classTeacherAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.teacherAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.departmentHeadAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.employeeDepartment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentGuardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.guardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.subject.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.department.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.role.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.refreshSession.deleteMany({ where: { userId: { in: oldUserIds } } });
  await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.reportCardTemplate.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.resultPolicy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.attendancePolicy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.librarySettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.transportSettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.financeSettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.staffAttendanceSettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.concessionScheme.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.teacherAvailability.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.leavePolicyRule.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.leavePolicy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
  await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🌱 Phase 12.5 – Greenfield International School Connected Seed');
  console.log('   Actual date:', new Date().toDateString(), '|', todayDayName());

  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  // ---- 1. Clean previous demo tenants ----
  const oldTenants = await prisma.tenant.findMany({
    where: { slug: { in: ['greenfield-demo', 'riverside-demo'] } },
  });
  const oldTenantIds = oldTenants.map(t => t.id);
  const oldUsers = await prisma.user.findMany({ where: { tenantId: { in: oldTenantIds } }, select: { id: true } });
  await cleanDemoTenants(oldTenantIds, oldUsers.map(u => u.id));

  // ==========================================================================
  // A. GREENFIELD INTERNATIONAL SCHOOL
  // ==========================================================================

  console.log('\n📚 Creating Greenfield International School...');

  const gTenant = await prisma.tenant.create({ data: { name: 'Greenfield International School', slug: 'greenfield-demo' } });
  const tId = gTenant.id;

  const gSchool = await prisma.school.create({
    data: {
      tenantId: tId,
      name: 'Greenfield International School',
      code: 'GIS-DEMO-2026',
      slug: 'gis-demo-2026',
      schoolType: SchoolType.COMBINED,
      board: BoardType.CBSE,
      officialEmail: 'info@greenfield.test',
      officialPhone: '9900011122',
      addressLine1: '45 Greenfield Sector, Fictional Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
      status: 'ACTIVE',
    },
  });
  const sId = gSchool.id;

  // --- Academic Year ---
  // Determine if current date falls in 2026–2027 range or adjust
  const now = new Date();
  const ayStart = new Date('2026-06-01');
  const ayEnd = new Date('2027-04-30');
  
  // If today is before the academic year start, use current year range for demo
  let academicYearStart = ayStart;
  let academicYearEnd = ayEnd;
  let academicYearName = '2026–2027';
  
  if (now < ayStart) {
    // Use current year for demo so timetable/attendance data is meaningful today
    const yr = now.getFullYear();
    academicYearStart = new Date(`${yr}-06-01`);
    academicYearEnd = new Date(`${yr + 1}-04-30`);
    academicYearName = `${yr}–${yr + 1}`;
    console.log(`  ℹ️  Today is before 2026-06-01. Using ${academicYearName} as the demo academic year.`);
  }

  const ay = await prisma.academicYear.create({
    data: {
      tenantId: tId,
      schoolId: sId,
      name: academicYearName,
      startDate: academicYearStart,
      endDate: academicYearEnd,
      status: 'ACTIVE',
      isCurrent: true,
    },
  });
  const ayId = ay.id;

  // --- Academic Term ---
  const term1 = await prisma.academicTerm.create({
    data: {
      tenantId: tId,
      schoolId: sId,
      academicYearId: ayId,
      name: 'Term 1',
      code: 'T1',
      startDate: academicYearStart,
      endDate: new Date(academicYearStart.getFullYear(), 9, 31), // ~Oct end
      sortOrder: 1,
    },
  });

  // --- Working Days ---
  const workingDayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const day of workingDayNames) {
    await prisma.schoolWorkingDay.create({ data: { tenantId: tId, schoolId: sId, dayOfWeek: day, isWorkingDay: true } });
  }
  for (const day of ['SATURDAY', 'SUNDAY']) {
    await prisma.schoolWorkingDay.create({ data: { tenantId: tId, schoolId: sId, dayOfWeek: day, isWorkingDay: false } });
  }

  // --- Departments ---
  const deptDefs = [
    { name: 'Management', code: 'MGMT', type: DepartmentType.ADMINISTRATIVE },
    { name: 'Administration', code: 'ADMIN', type: DepartmentType.ADMINISTRATIVE },
    { name: 'Academics', code: 'ACAD', type: DepartmentType.ACADEMIC },
    { name: 'Finance', code: 'FIN', type: DepartmentType.ADMINISTRATIVE },
    { name: 'Library', code: 'LIB', type: DepartmentType.SUPPORT },
    { name: 'Transport', code: 'TRNS', type: DepartmentType.SUPPORT },
    { name: 'Front Office', code: 'FRON', type: DepartmentType.SUPPORT },
    { name: 'Support Services', code: 'SUPP', type: DepartmentType.SUPPORT },
  ];
  const depts: Record<string, string> = {};
  for (const d of deptDefs) {
    const dept = await prisma.department.create({ data: { tenantId: tId, schoolId: sId, ...d } });
    depts[d.code] = dept.id;
  }

  // --- Roles ---
  const principalRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'Principal', code: 'PRINCIPAL',
      permissions: ['DASHBOARD_VIEW', 'LEAVE_APPROVE', 'GATEPASS_APPROVE', 'VISITOR_VIEW', 'FINANCE_VIEW', 'RESULTS_VIEW', 'ATTENDANCE_VIEW'],
    },
  });
  const vpRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'Vice Principal', code: 'VICE_PRINCIPAL',
      permissions: ['DASHBOARD_VIEW', 'ATTENDANCE_VIEW', 'ACADEMIC_VIEW'],
    },
  });
  const adminRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'School Admin', code: 'SCHOOL_ADMIN',
      permissions: ['ADMIN_ALL'],
    },
  });
  const accountantRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'Accountant', code: 'ACCOUNTANT',
      permissions: ['FINANCE_VIEW', 'FINANCE_MANAGE'],
    },
  });
  const librarianRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'Librarian', code: 'LIBRARIAN',
      permissions: ['LIBRARY_MANAGE'],
    },
  });
  const transportRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'Transport Manager', code: 'TRANSPORT_MGR',
      permissions: ['TRANSPORT_MANAGE'],
    },
  });
  const gateRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'Gate Staff', code: 'GATE_STAFF',
      permissions: ['VISITOR_MANAGE', 'GATEPASS_MANAGE'],
    },
  });
  const teacherRole = await prisma.role.create({
    data: {
      tenantId: tId, schoolId: sId, name: 'Teacher', code: 'TEACHER',
      permissions: ['CLASS_ATTENDANCE_MARK', 'MARKS_ENTRY', 'HOMEWORK_CREATE', 'ASSIGNMENT_CREATE'],
    },
  });

  // --- Employees ---
  console.log('  👥 Creating employees...');

  interface EmpDef {
    number: string;
    firstName: string;
    lastName: string;
    email: string;
    type: EmployeeType;
    designation: string;
    deptCode: string;
    roleId?: string;
  }

  const empDefs: EmpDef[] = [
    { number: 'EMP-001', firstName: 'Arjun', lastName: 'Mehta', email: 'arjun@greenfield.test', type: EmployeeType.MANAGEMENT, designation: 'Principal', deptCode: 'MGMT', roleId: principalRole.id },
    { number: 'EMP-002', firstName: 'Kavya', lastName: 'Nair', email: 'kavya@greenfield.test', type: EmployeeType.MANAGEMENT, designation: 'Vice Principal', deptCode: 'MGMT', roleId: vpRole.id },
    { number: 'EMP-003', firstName: 'Ananya', lastName: 'Rao', email: 'ananya@greenfield.test', type: EmployeeType.ADMINISTRATIVE, designation: 'School Administrator', deptCode: 'ADMIN', roleId: adminRole.id },
    { number: 'EMP-004', firstName: 'Rohan', lastName: 'Iyer', email: 'rohan@greenfield.test', type: EmployeeType.ADMINISTRATIVE, designation: 'Accountant', deptCode: 'FIN', roleId: accountantRole.id },
    { number: 'EMP-005', firstName: 'Meera', lastName: 'Joshi', email: 'meera@greenfield.test', type: EmployeeType.SUPPORT, designation: 'Librarian', deptCode: 'LIB', roleId: librarianRole.id },
    { number: 'EMP-006', firstName: 'Sanjay', lastName: 'Verma', email: 'sanjay@greenfield.test', type: EmployeeType.SUPPORT, designation: 'Transport Manager', deptCode: 'TRNS', roleId: transportRole.id },
    { number: 'EMP-007', firstName: 'Priya', lastName: 'Shah', email: 'priya@greenfield.test', type: EmployeeType.SUPPORT, designation: 'Reception/Gate Staff', deptCode: 'FRON', roleId: gateRole.id },
    { number: 'EMP-008', firstName: 'Neha', lastName: 'Kulkarni', email: 'neha@greenfield.test', type: EmployeeType.TEACHING, designation: 'Mathematics Teacher', deptCode: 'ACAD', roleId: teacherRole.id },
    { number: 'EMP-009', firstName: 'Vikram', lastName: 'Reddy', email: 'vikram@greenfield.test', type: EmployeeType.TEACHING, designation: 'Science Teacher', deptCode: 'ACAD', roleId: teacherRole.id },
    { number: 'EMP-010', firstName: 'Aisha', lastName: 'Khan', email: 'aisha@greenfield.test', type: EmployeeType.TEACHING, designation: 'English Teacher', deptCode: 'ACAD', roleId: teacherRole.id },
    { number: 'EMP-011', firstName: 'Rahul', lastName: 'Das', email: 'rahul@greenfield.test', type: EmployeeType.TEACHING, designation: 'Social Studies Teacher', deptCode: 'ACAD', roleId: teacherRole.id },
    { number: 'EMP-012', firstName: 'Manoj', lastName: 'Kumar', email: 'manoj@greenfield.test', type: EmployeeType.SUPPORT, designation: 'Support Staff', deptCode: 'SUPP' },
  ];

  const empMap: Record<string, { empId: string; userId: string }> = {};
  const adminUserId = ''; // will be filled

  for (const e of empDefs) {
    const user = await prisma.user.create({
      data: {
        tenantId: tId,
        email: e.email,
        passwordHash,
        firstName: e.firstName,
        lastName: e.lastName,
        userType: 'SCHOOL_ADMIN',
        roleId: e.roleId || null,
        status: 'ACTIVE',
      },
    });
    const emp = await prisma.employee.create({
      data: {
        tenantId: tId,
        schoolId: sId,
        userId: user.id,
        employeeNumber: e.number,
        firstName: e.firstName,
        lastName: e.lastName,
        employeeType: e.type,
        employmentType: EmploymentType.FULL_TIME,
        designation: e.designation,
        primaryDepartmentId: depts[e.deptCode],
        joiningDate: new Date('2024-06-01'),
        status: 'ACTIVE',
      },
    });
    await prisma.employeeDepartment.create({
      data: { tenantId: tId, schoolId: sId, employeeId: emp.id, departmentId: depts[e.deptCode], isPrimary: true },
    });
    empMap[e.number] = { empId: emp.id, userId: user.id };
  }

  const adminUser = empMap['EMP-003'];

  // --- Grade Levels ---
  console.log('  🏫 Creating classes and sections...');
  const glDefs = [
    { name: 'Grade 6', code: 'G6', order: 6 },
    { name: 'Grade 7', code: 'G7', order: 7 },
    { name: 'Grade 8', code: 'G8', order: 8 },
  ];
  const glMap: Record<string, string> = {};
  for (const g of glDefs) {
    const gl = await prisma.gradeLevel.create({ data: { tenantId: tId, schoolId: sId, name: g.name, code: g.code, displayOrder: g.order } });
    glMap[g.code] = gl.id;
  }

  // --- Sections ---
  const secDefs = [
    { grade: 'G6', name: 'Section A', code: 'G6-A' },
    { grade: 'G7', name: 'Section A', code: 'G7-A' },
    { grade: 'G8', name: 'Section A', code: 'G8-A' },
    { grade: 'G8', name: 'Section B', code: 'G8-B' },
  ];
  const secMap: Record<string, string> = {};
  for (const s of secDefs) {
    const sec = await prisma.section.create({ data: { tenantId: tId, schoolId: sId, gradeLevelId: glMap[s.grade], name: s.name, code: s.code } });
    secMap[s.code] = sec.id;
  }

  // --- Subjects ---
  const subDefs = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'English', code: 'ENG' },
    { name: 'Social Studies', code: 'SST' },
  ];
  const subMap: Record<string, string> = {};
  for (const s of subDefs) {
    const sub = await prisma.subject.create({ data: { tenantId: tId, schoolId: sId, name: s.name, code: s.code, departmentId: depts['ACAD'] } });
    subMap[s.code] = sub.id;
  }

  // --- Class Subjects (for each grade) ---
  for (const glCode of ['G6', 'G7', 'G8']) {
    for (const subCode of ['MATH', 'SCI', 'ENG', 'SST']) {
      await prisma.classSubject.create({
        data: { tenantId: tId, schoolId: sId, gradeLevelId: glMap[glCode], subjectId: subMap[subCode], academicYearId: ayId },
      });
    }
  }

  // --- Teacher Assignments ---
  // Neha: MATH → G6-A, G7-A
  // Vikram: SCI → G6-A, G8-A
  // Aisha: ENG → G7-A, G8-A, G8-B
  // Rahul: SST → G6-A, G7-A, G8-A
  const taMatrix: Array<{ empNum: string; sub: string; gl: string; sec: string }> = [
    { empNum: 'EMP-008', sub: 'MATH', gl: 'G6', sec: 'G6-A' },
    { empNum: 'EMP-008', sub: 'MATH', gl: 'G7', sec: 'G7-A' },
    { empNum: 'EMP-009', sub: 'SCI', gl: 'G6', sec: 'G6-A' },
    { empNum: 'EMP-009', sub: 'SCI', gl: 'G8', sec: 'G8-A' },
    { empNum: 'EMP-010', sub: 'ENG', gl: 'G7', sec: 'G7-A' },
    { empNum: 'EMP-010', sub: 'ENG', gl: 'G8', sec: 'G8-A' },
    { empNum: 'EMP-010', sub: 'ENG', gl: 'G8', sec: 'G8-B' },
    { empNum: 'EMP-011', sub: 'SST', gl: 'G6', sec: 'G6-A' },
    { empNum: 'EMP-011', sub: 'SST', gl: 'G7', sec: 'G7-A' },
    { empNum: 'EMP-011', sub: 'SST', gl: 'G8', sec: 'G8-A' },
  ];
  const taMap: Record<string, string> = {};
  for (const ta of taMatrix) {
    const r = await prisma.teacherAssignment.create({
      data: {
        tenantId: tId, schoolId: sId, academicYearId: ayId,
        employeeId: empMap[ta.empNum].empId,
        subjectId: subMap[ta.sub],
        gradeLevelId: glMap[ta.gl],
        sectionId: secMap[ta.sec],
      },
    });
    taMap[`${ta.empNum}-${ta.sub}-${ta.sec}`] = r.id;
  }

  // --- Class Teacher Assignments ---
  // 6-A → Neha, 7-A → Aisha, 8-A → Vikram, 8-B → Rahul
  const ctMatrix = [
    { empNum: 'EMP-008', gl: 'G6', sec: 'G6-A' },
    { empNum: 'EMP-010', gl: 'G7', sec: 'G7-A' },
    { empNum: 'EMP-009', gl: 'G8', sec: 'G8-A' },
    { empNum: 'EMP-011', gl: 'G8', sec: 'G8-B' },
  ];
  for (const ct of ctMatrix) {
    await prisma.classTeacherAssignment.create({
      data: {
        tenantId: tId, schoolId: sId, academicYearId: ayId,
        gradeLevelId: glMap[ct.gl],
        sectionId: secMap[ct.sec],
        employeeId: empMap[ct.empNum].empId,
        isPrimary: true,
      },
    });
  }

  // --- Bell Schedule ---
  console.log('  🔔 Creating bell schedule and timetables...');
  const bell = await prisma.bellSchedule.create({
    data: { tenantId: tId, schoolId: sId, name: 'Standard Day', isDefault: true },
  });

  interface BellPeriodDef {
    name: string;
    number?: number;
    type: BellPeriodType;
    start: string;
    end: string;
    order: number;
  }
  const periodDefs: BellPeriodDef[] = [
    { name: 'Period 1', number: 1, type: BellPeriodType.TEACHING, start: '09:00', end: '09:45', order: 1 },
    { name: 'Period 2', number: 2, type: BellPeriodType.TEACHING, start: '09:45', end: '10:30', order: 2 },
    { name: 'Break', type: BellPeriodType.BREAK, start: '10:30', end: '10:45', order: 3 },
    { name: 'Period 3', number: 3, type: BellPeriodType.TEACHING, start: '10:45', end: '11:30', order: 4 },
    { name: 'Period 4', number: 4, type: BellPeriodType.TEACHING, start: '11:30', end: '12:15', order: 5 },
    { name: 'Lunch', type: BellPeriodType.LUNCH, start: '12:15', end: '13:00', order: 6 },
    { name: 'Period 5', number: 5, type: BellPeriodType.TEACHING, start: '13:00', end: '13:45', order: 7 },
    { name: 'Period 6', number: 6, type: BellPeriodType.TEACHING, start: '13:45', end: '14:30', order: 8 },
  ];
  const pMap: Record<string, string> = {}; // 'Period 1' → id
  for (const p of periodDefs) {
    const bp = await prisma.bellPeriod.create({
      data: {
        tenantId: tId, bellScheduleId: bell.id, name: p.name,
        periodNumber: p.number || null, periodType: p.type,
        startTime: p.start, endTime: p.end, sortOrder: p.order,
      },
    });
    pMap[p.name] = bp.id;
  }

  // Assign bell schedule to each working day
  for (const day of workingDayNames) {
    await prisma.workingDaySchedule.create({ data: { tenantId: tId, schoolId: sId, dayOfWeek: day, bellScheduleId: bell.id } });
  }

  // --- Timetables & Entries ---
  // We create one timetable per section. Entries cover Mon-Fri.
  // Using realistic conflict-free scheduling:
  // Period 1: MATH G6-A (Neha), SCI G8-A (Vikram), ENG G7-A (Aisha), SST G6-A
  // etc.

  interface TTEntry {
    day: string;
    period: string;
    sub: string;
    emp: string;
    sec: string;
    gl: string;
  }
  const ttEntries: TTEntry[] = [
    // Grade 6-A
    { day: 'MONDAY', period: 'Period 1', sub: 'MATH', emp: 'EMP-008', sec: 'G6-A', gl: 'G6' },
    { day: 'MONDAY', period: 'Period 2', sub: 'SCI', emp: 'EMP-009', sec: 'G6-A', gl: 'G6' },
    { day: 'MONDAY', period: 'Period 3', sub: 'ENG', emp: 'EMP-010', sec: 'G6-A', gl: 'G6' },  // Aisha also teaches 6-A ENG if needed for demo
    { day: 'MONDAY', period: 'Period 4', sub: 'SST', emp: 'EMP-011', sec: 'G6-A', gl: 'G6' },
    { day: 'TUESDAY', period: 'Period 1', sub: 'SCI', emp: 'EMP-009', sec: 'G6-A', gl: 'G6' },
    { day: 'TUESDAY', period: 'Period 2', sub: 'MATH', emp: 'EMP-008', sec: 'G6-A', gl: 'G6' },
    { day: 'WEDNESDAY', period: 'Period 1', sub: 'MATH', emp: 'EMP-008', sec: 'G6-A', gl: 'G6' },
    { day: 'THURSDAY', period: 'Period 1', sub: 'SST', emp: 'EMP-011', sec: 'G6-A', gl: 'G6' },
    { day: 'FRIDAY', period: 'Period 1', sub: 'MATH', emp: 'EMP-008', sec: 'G6-A', gl: 'G6' },
    // Grade 7-A
    { day: 'MONDAY', period: 'Period 5', sub: 'MATH', emp: 'EMP-008', sec: 'G7-A', gl: 'G7' },
    { day: 'MONDAY', period: 'Period 6', sub: 'ENG', emp: 'EMP-010', sec: 'G7-A', gl: 'G7' },
    { day: 'TUESDAY', period: 'Period 3', sub: 'MATH', emp: 'EMP-008', sec: 'G7-A', gl: 'G7' },
    { day: 'TUESDAY', period: 'Period 4', sub: 'SST', emp: 'EMP-011', sec: 'G7-A', gl: 'G7' },
    { day: 'WEDNESDAY', period: 'Period 3', sub: 'ENG', emp: 'EMP-010', sec: 'G7-A', gl: 'G7' },
    { day: 'THURSDAY', period: 'Period 3', sub: 'MATH', emp: 'EMP-008', sec: 'G7-A', gl: 'G7' },
    // Grade 8-A
    { day: 'MONDAY', period: 'Period 1', sub: 'SCI', emp: 'EMP-009', sec: 'G8-A', gl: 'G8' },  // conflict check: EMP-009 in G6-A P1 Mon – adjust
    { day: 'TUESDAY', period: 'Period 5', sub: 'SCI', emp: 'EMP-009', sec: 'G8-A', gl: 'G8' },
    { day: 'WEDNESDAY', period: 'Period 5', sub: 'ENG', emp: 'EMP-010', sec: 'G8-A', gl: 'G8' },
    { day: 'THURSDAY', period: 'Period 5', sub: 'SST', emp: 'EMP-011', sec: 'G8-A', gl: 'G8' },
    // Grade 8-B
    { day: 'TUESDAY', period: 'Period 6', sub: 'ENG', emp: 'EMP-010', sec: 'G8-B', gl: 'G8' },
    { day: 'WEDNESDAY', period: 'Period 6', sub: 'SST', emp: 'EMP-011', sec: 'G8-B', gl: 'G8' },
    { day: 'THURSDAY', period: 'Period 6', sub: 'ENG', emp: 'EMP-010', sec: 'G8-B', gl: 'G8' },
  ];

  // Build per-section timetable records
  const ttSecMap: Record<string, string> = {};
  for (const secCode of ['G6-A', 'G7-A', 'G8-A', 'G8-B']) {
    const [gl] = secCode.split('-');
    const tt = await prisma.timetable.create({
      data: {
        tenantId: tId, schoolId: sId, academicYearId: ayId,
        classId: glMap[`G${gl.slice(-1)}`] || Object.values(glMap)[0],
        sectionId: secMap[secCode],
        name: `Timetable ${secCode}`,
        status: 'PUBLISHED',
        createdByUserId: adminUser.userId,
      },
    });
    ttSecMap[secCode] = tt.id;
  }

  // Resolve GL from section code
  function glFromSec(sec: string): string {
    if (sec.startsWith('G6')) return glMap['G6'];
    if (sec.startsWith('G7')) return glMap['G7'];
    return glMap['G8'];
  }

  // Track conflict: empId+day+period must be unique
  const conflictSet = new Set<string>();
  const ttEntryMap: Array<{ id: string; day: string; period: string; sec: string }> = [];

  for (const e of ttEntries) {
    const conflictKey = `${empMap[e.emp].empId}-${e.day}-${pMap[e.period]}`;
    if (conflictSet.has(conflictKey)) {
      console.log(`  ⚠️  Skipping conflict: ${e.emp} on ${e.day} ${e.period} for ${e.sec}`);
      continue;
    }
    conflictSet.add(conflictKey);

    const entry = await prisma.timetableEntry.create({
      data: {
        tenantId: tId,
        timetableId: ttSecMap[e.sec],
        dayOfWeek: e.day,
        bellPeriodId: pMap[e.period],
        subjectId: subMap[e.sub],
        employeeId: empMap[e.emp].empId,
        entryType: TimetableEntryType.SUBJECT,
      },
    });
    ttEntryMap.push({ id: entry.id, day: e.day, period: e.period, sec: e.sec });
  }

  // --- Students ---
  console.log('  👨‍🎓 Creating students...');
  interface StudDef {
    roll: string;
    firstName: string;
    lastName: string;
    email: string;
    sec: string;
    gl: string;
    rollNum: string;
  }
  const studDefs: StudDef[] = [
    { roll: 'STU-2026-001', firstName: 'Aarav', lastName: 'Sharma', email: 'aarav@gis.test', sec: 'G6-A', gl: 'G6', rollNum: '1' },
    { roll: 'STU-2026-002', firstName: 'Diya', lastName: 'Patel', email: 'diya@gis.test', sec: 'G6-A', gl: 'G6', rollNum: '2' },
    { roll: 'STU-2026-003', firstName: 'Ishaan', lastName: 'Reddy', email: 'ishaan@gis.test', sec: 'G6-A', gl: 'G6', rollNum: '3' },
    { roll: 'STU-2026-004', firstName: 'Sara', lastName: 'Khan', email: 'sara@gis.test', sec: 'G6-A', gl: 'G6', rollNum: '4' },
    { roll: 'STU-2026-005', firstName: 'Aditya', lastName: 'Verma', email: 'aditya@gis.test', sec: 'G7-A', gl: 'G7', rollNum: '1' },
    { roll: 'STU-2026-006', firstName: 'Meera', lastName: 'Nair', email: 'meera.s@gis.test', sec: 'G7-A', gl: 'G7', rollNum: '2' },
    { roll: 'STU-2026-007', firstName: 'Riya', lastName: 'Das', email: 'riya@gis.test', sec: 'G7-A', gl: 'G7', rollNum: '3' },
    { roll: 'STU-2026-008', firstName: 'Kabir', lastName: 'Joshi', email: 'kabir@gis.test', sec: 'G7-A', gl: 'G7', rollNum: '4' },
    { roll: 'STU-2026-009', firstName: 'Arjun', lastName: 'Patel', email: 'arjun.s@gis.test', sec: 'G8-A', gl: 'G8', rollNum: '1' },
    { roll: 'STU-2026-010', firstName: 'Nisha', lastName: 'Rao', email: 'nisha@gis.test', sec: 'G8-A', gl: 'G8', rollNum: '2' },
    { roll: 'STU-2026-011', firstName: 'Zoya', lastName: 'Khan', email: 'zoya@gis.test', sec: 'G8-A', gl: 'G8', rollNum: '3' },
    { roll: 'STU-2026-012', firstName: 'Vihaan', lastName: 'Mehta', email: 'vihaan@gis.test', sec: 'G8-B', gl: 'G8', rollNum: '1' },
  ];

  const studMap: Record<string, { studId: string; userId: string; enrollId: string }> = {};

  for (const s of studDefs) {
    const user = await prisma.user.create({
      data: { tenantId: tId, email: s.email, passwordHash, firstName: s.firstName, lastName: s.lastName, userType: 'STUDENT', status: 'ACTIVE' },
    });
    const stud = await prisma.student.create({
      data: {
        tenantId: tId, schoolId: sId, userId: user.id,
        admissionNumber: s.roll, firstName: s.firstName, lastName: s.lastName,
        dateOfBirth: new Date('2014-06-15'), gender: 'Prefer not to say',
        personalEmail: s.email,
        currentAddressLine1: '12 Fictional Road', currentCity: 'Bangalore', currentState: 'Karnataka', currentCountry: 'India', currentPostalCode: '560001',
        permanentAddressLine1: '12 Fictional Road', permanentCity: 'Bangalore', permanentState: 'Karnataka', permanentCountry: 'India', permanentPostalCode: '560001',
        admissionDate: academicYearStart,
      },
    });
    const enroll = await prisma.studentEnrollment.create({
      data: {
        tenantId: tId, schoolId: sId, studentId: stud.id,
        academicYearId: ayId, gradeLevelId: glMap[`G${s.gl.slice(-1)}`],
        sectionId: secMap[s.sec], rollNumber: s.rollNum,
        enrollmentDate: academicYearStart, isCurrent: true,
      },
    });
    studMap[s.roll] = { studId: stud.id, userId: user.id, enrollId: enroll.id };
  }

  // --- Guardians ---
  console.log('  👪 Creating guardians...');

  // Rajesh Sharma – Father of Aarav (6-A) and Aditya (7-A)
  const rajeshUser = await prisma.user.create({
    data: { tenantId: tId, email: 'rajesh@gis.test', passwordHash, firstName: 'Rajesh', lastName: 'Sharma', userType: 'GUARDIAN', status: 'ACTIVE' },
  });
  const rajesh = await prisma.guardian.create({
    data: { tenantId: tId, schoolId: sId, userId: rajeshUser.id, firstName: 'Rajesh', lastName: 'Sharma', phone: '9988776601', email: 'rajesh@gis.test' },
  });
  await prisma.studentGuardian.create({
    data: { tenantId: tId, schoolId: sId, studentId: studMap['STU-2026-001'].studId, guardianId: rajesh.id, relationship: 'FATHER', isPrimary: true, hasPortalAccess: true, receivesAttendanceUpdates: true },
  });
  await prisma.studentGuardian.create({
    data: { tenantId: tId, schoolId: sId, studentId: studMap['STU-2026-005'].studId, guardianId: rajesh.id, relationship: 'FATHER', isPrimary: true, hasPortalAccess: true, receivesAttendanceUpdates: true },
  });

  // Priya Sharma – Mother of Aarav (secondary guardian)
  const priyaGUser = await prisma.user.create({
    data: { tenantId: tId, email: 'priya.g@gis.test', passwordHash, firstName: 'Priya', lastName: 'Sharma', userType: 'GUARDIAN', status: 'ACTIVE' },
  });
  const priyaG = await prisma.guardian.create({
    data: { tenantId: tId, schoolId: sId, userId: priyaGUser.id, firstName: 'Priya', lastName: 'Sharma', phone: '9988776602', email: 'priya.g@gis.test' },
  });
  await prisma.studentGuardian.create({
    data: { tenantId: tId, schoolId: sId, studentId: studMap['STU-2026-001'].studId, guardianId: priyaG.id, relationship: 'MOTHER', isPrimary: false, hasPortalAccess: true },
  });

  // ==========================================================================
  // ATTENDANCE WORKFLOW – Current day simulation
  // ==========================================================================

  console.log('  📋 Seeding attendance records...');

  // Only seed if today is a working day
  const todayName = todayDayName();
  const isWorkingDay = workingDayNames.includes(todayName);

  // Day -2: 6-A All present
  const d2 = daysAgo(2);
  const attSession1 = await prisma.attendanceSession.create({
    data: {
      tenantId: tId, schoolId: sId, academicYearId: ayId,
      classId: glMap['G6'], sectionId: secMap['G6-A'],
      attendanceDate: d2, attendanceType: AttendanceType.DAILY,
      status: AttendanceSessionStatus.SUBMITTED,
      markedByUserId: empMap['EMP-008'].userId,
      submittedAt: d2,
    },
  });
  for (const roll of ['STU-2026-001', 'STU-2026-002', 'STU-2026-003', 'STU-2026-004']) {
    await prisma.attendanceRecord.create({
      data: {
        tenantId: tId, attendanceSessionId: attSession1.id,
        studentId: studMap[roll].studId, studentEnrollmentId: studMap[roll].enrollId,
        status: AttendanceStatus.PRESENT, markedByUserId: empMap['EMP-008'].userId,
      },
    });
  }

  // Day -1: 6-A Aarav absent, Ishaan late, others present
  const d1 = daysAgo(1);
  const attSession2 = await prisma.attendanceSession.create({
    data: {
      tenantId: tId, schoolId: sId, academicYearId: ayId,
      classId: glMap['G6'], sectionId: secMap['G6-A'],
      attendanceDate: d1, attendanceType: AttendanceType.DAILY,
      status: AttendanceSessionStatus.SUBMITTED,
      markedByUserId: empMap['EMP-008'].userId,
      submittedAt: d1,
    },
  });
  const attStatuses: Record<string, AttendanceStatus> = {
    'STU-2026-001': AttendanceStatus.ABSENT,
    'STU-2026-002': AttendanceStatus.PRESENT,
    'STU-2026-003': AttendanceStatus.LATE,
    'STU-2026-004': AttendanceStatus.PRESENT,
  };
  for (const [roll, status] of Object.entries(attStatuses)) {
    await prisma.attendanceRecord.create({
      data: {
        tenantId: tId, attendanceSessionId: attSession2.id,
        studentId: studMap[roll].studId, studentEnrollmentId: studMap[roll].enrollId,
        status, markedByUserId: empMap['EMP-008'].userId,
      },
    });
  }

  // Today: 7-A session in DRAFT (pending submission) – only if working day
  if (isWorkingDay) {
    await prisma.attendanceSession.create({
      data: {
        tenantId: tId, schoolId: sId, academicYearId: ayId,
        classId: glMap['G7'], sectionId: secMap['G7-A'],
        attendanceDate: today(), attendanceType: AttendanceType.DAILY,
        status: AttendanceSessionStatus.DRAFT,
        markedByUserId: empMap['EMP-008'].userId,
      },
    });
  }

  // Staff Attendance
  for (const empNum of ['EMP-001', 'EMP-008', 'EMP-009', 'EMP-010', 'EMP-011']) {
    await prisma.staffAttendanceRecord.create({
      data: {
        tenantId: tId, employeeId: empMap[empNum].empId,
        date: d1, status: StaffAttendanceStatus.PRESENT,
        source: StaffAttendanceSource.MANUAL,
        markedByUserId: adminUser.userId,
      },
    });
  }

  // ==========================================================================
  // LEAVE MANAGEMENT
  // ==========================================================================

  console.log('  🏖️  Seeding leave types and requests...');

  const leaveTypeCasual = await prisma.leaveType.create({
    data: { tenantId: tId, name: 'Casual Leave', code: 'CL', status: 'ACTIVE', isPaid: true, requiresApproval: true },
  });
  const leaveTypeSick = await prisma.leaveType.create({
    data: { tenantId: tId, name: 'Sick Leave', code: 'SL', status: 'ACTIVE', isPaid: true, requiresApproval: true },
  });

  // Neha – PENDING leave
  const nehaLeave = await prisma.leaveRequest.create({
    data: {
      tenantId: tId, employeeId: empMap['EMP-008'].empId,
      leaveTypeId: leaveTypeCasual.id,
      startDate: daysFromNow(5), endDate: daysFromNow(7),
      reason: 'Family function',
      status: LeaveRequestStatus.PENDING,
    },
  });

  // Vikram – APPROVED leave
  await prisma.leaveRequest.create({
    data: {
      tenantId: tId, employeeId: empMap['EMP-009'].empId,
      leaveTypeId: leaveTypeSick.id,
      startDate: daysAgo(10), endDate: daysAgo(9),
      reason: 'Medical appointment',
      status: LeaveRequestStatus.APPROVED,
      reviewedByUserId: empMap['EMP-001'].userId,
      reviewedAt: daysAgo(11),
    },
  });

  // ==========================================================================
  // EXAM → MARKS → RESULTS CHAIN
  // ==========================================================================

  console.log('  📝 Creating exam cycle and marks...');

  const examCycle = await prisma.examCycle.create({
    data: {
      tenantId: tId, schoolId: sId, academicYearId: ayId,
      academicTermId: term1.id,
      name: 'Mid-Term 2026', code: 'MT-2026',
      status: 'ACTIVE',
      startDate: daysAgo(20), endDate: daysAgo(15),
    },
  });

  const exam = await prisma.exam.create({
    data: {
      tenantId: tId, schoolId: sId, academicYearId: ayId,
      academicTermId: term1.id, examCycleId: examCycle.id,
      name: 'Mid-Term Examination 2026', code: 'MTE-2026',
      examType: ExamType.MID_TERM, status: ExamStatus.COMPLETED,
      startDate: daysAgo(20), endDate: daysAgo(16),
      resultStatus: ResultStatus.PUBLISHED,
      createdByUserId: adminUser.userId,
    },
  });

  // Targets – Grade 6-A
  await prisma.examTarget.create({ data: { tenantId: tId, examId: exam.id, classId: glMap['G6'], sectionId: secMap['G6-A'] } });

  // Grade Scale
  const gradeScale = await prisma.gradeScale.create({
    data: { tenantId: tId, name: 'GIS Standard', calculationBasis: GradeScaleBasis.PERCENTAGE, isDefault: true },
  });
  const boundaries = [
    { grade: 'A+', min: 90, max: 100, gp: 10 },
    { grade: 'A', min: 80, max: 89.99, gp: 9 },
    { grade: 'B', min: 70, max: 79.99, gp: 8 },
    { grade: 'C', min: 60, max: 69.99, gp: 7 },
    { grade: 'D', min: 50, max: 59.99, gp: 6 },
    { grade: 'F', min: 0, max: 49.99, gp: 0 },
  ];
  for (const b of boundaries) {
    await prisma.gradeBoundary.create({ data: { tenantId: tId, gradeScaleId: gradeScale.id, grade: b.grade, minimumValue: b.min, maximumValue: b.max, gradePoint: b.gp } });
  }

  // Exam Subjects
  const examSubMath = await prisma.examSubject.create({
    data: { tenantId: tId, examId: exam.id, classId: glMap['G6'], subjectId: subMap['MATH'], maximumMarks: 100, passMarks: 35, gradingMode: GradingMode.MARKS_AND_GRADE },
  });
  const examSubSci = await prisma.examSubject.create({
    data: { tenantId: tId, examId: exam.id, classId: glMap['G6'], subjectId: subMap['SCI'], maximumMarks: 100, passMarks: 35, gradingMode: GradingMode.MARKS_AND_GRADE },
  });

  // Marks Entry for 6-A students
  const marksData: Record<string, { math: number; sci: number }> = {
    'STU-2026-001': { math: 88, sci: 92 }, // Aarav – high
    'STU-2026-002': { math: 74, sci: 68 }, // Diya – average
    'STU-2026-003': { math: 42, sci: 38 }, // Ishaan – low/pass
    'STU-2026-004': { math: 30, sci: 25 }, // Sara – fail
  };
  for (const [roll, marks] of Object.entries(marksData)) {
    const s = studMap[roll];
    await prisma.marksEntry.create({
      data: { tenantId: tId, examId: exam.id, examSubjectId: examSubMath.id, studentId: s.studId, studentEnrollmentId: s.enrollId, marksObtained: marks.math, entryStatus: EntryStatus.SUBMITTED, enteredByUserId: empMap['EMP-008'].userId },
    });
    await prisma.marksEntry.create({
      data: { tenantId: tId, examId: exam.id, examSubjectId: examSubSci.id, studentId: s.studId, studentEnrollmentId: s.enrollId, marksObtained: marks.sci, entryStatus: EntryStatus.SUBMITTED, enteredByUserId: empMap['EMP-009'].userId },
    });
    // Subject Results
    const mathPct = marks.math;
    const sciPct = marks.sci;
    const mathGrade = mathPct >= 90 ? 'A+' : mathPct >= 80 ? 'A' : mathPct >= 70 ? 'B' : mathPct >= 60 ? 'C' : mathPct >= 50 ? 'D' : 'F';
    await prisma.subjectResult.create({
      data: { tenantId: tId, examId: exam.id, studentId: s.studId, studentEnrollmentId: s.enrollId, examSubjectId: examSubMath.id, totalMarksObtained: marks.math, maximumMarks: 100, percentage: mathPct, grade: mathGrade, resultStatus: marks.math >= 35 ? SubjectResultStatus.PASS : SubjectResultStatus.FAIL },
    });
    const sciGrade = sciPct >= 90 ? 'A+' : sciPct >= 80 ? 'A' : sciPct >= 70 ? 'B' : sciPct >= 60 ? 'C' : sciPct >= 50 ? 'D' : 'F';
    await prisma.subjectResult.create({
      data: { tenantId: tId, examId: exam.id, studentId: s.studId, studentEnrollmentId: s.enrollId, examSubjectId: examSubSci.id, totalMarksObtained: marks.sci, maximumMarks: 100, percentage: sciPct, grade: sciGrade, resultStatus: marks.sci >= 35 ? SubjectResultStatus.PASS : SubjectResultStatus.FAIL },
    });
    // Overall Result
    const total = marks.math + marks.sci;
    const pct = total / 2;
    const overallGrade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
    const overallStatus = (marks.math >= 35 && marks.sci >= 35) ? OverallResultStatus.PASS : OverallResultStatus.FAIL;
    const studentResult = await prisma.studentResult.create({
      data: { tenantId: tId, examId: exam.id, studentId: s.studId, studentEnrollmentId: s.enrollId, totalMarksObtained: total, totalMaximumMarks: 200, percentage: pct, overallGrade, resultStatus: overallStatus, publishedAt: daysAgo(1) },
    });
    // Report Card Template & Card
    let template = await prisma.reportCardTemplate.findFirst({ where: { tenantId: tId } });
    if (!template) {
      template = await prisma.reportCardTemplate.create({
        data: { tenantId: tId, name: 'GIS Standard Report Card', isDefault: true, status: 'ACTIVE' },
      });
    }
    await prisma.reportCard.create({
      data: { tenantId: tId, examId: exam.id, studentId: s.studId, studentEnrollmentId: s.enrollId, studentResultId: studentResult.id, templateId: template.id, snapshotData: { math: marks.math, sci: marks.sci, total, pct }, status: 'PUBLISHED', generatedByUserId: adminUser.userId, publishedAt: daysAgo(1) },
    });
  }

  // ==========================================================================
  // FEES CHAIN
  // ==========================================================================

  console.log('  💰 Seeding fee structures and charges...');

  const feeCategory = await prisma.feeCategory.create({ data: { tenantId: tId, name: 'Tuition Fee', code: 'TUI' } });
  const feeComponentTuition = await prisma.feeComponent.create({
    data: { tenantId: tId, feeCategoryId: feeCategory.id, name: 'Tuition Q1', code: 'TUI-Q1', componentType: 'QUARTERLY' },
  });
  const feeComponentTransport = await prisma.feeComponent.create({
    data: { tenantId: tId, feeCategoryId: feeCategory.id, name: 'Transport Fee', code: 'TRN-Q1', componentType: 'QUARTERLY' },
  });

  const feeStructure = await prisma.feeStructure.create({
    data: {
      tenantId: tId, academicYearId: ayId, name: 'Grade 6 Standard Q1',
      status: 'ACTIVE', currency: 'INR', createdByUserId: adminUser.userId, publishedAt: academicYearStart,
    },
  });
  const feeItemTuition = await prisma.feeStructureItem.create({
    data: { tenantId: tId, feeStructureId: feeStructure.id, feeComponentId: feeComponentTuition.id, amountMinor: 2500000, isMandatory: true }, // 25,000 INR
  });

  await prisma.feeStructureTarget.create({
    data: { tenantId: tId, feeStructureId: feeStructure.id, classId: glMap['G6'], sectionId: secMap['G6-A'] },
  });

  const feeInstallment = await prisma.feeInstallment.create({
    data: { tenantId: tId, feeStructureId: feeStructure.id, name: 'Q1 Installment', dueDate: daysFromNow(30), sequenceNumber: 1 },
  });
  await prisma.feeInstallmentItem.create({
    data: { tenantId: tId, feeInstallmentId: feeInstallment.id, feeStructureItemId: feeItemTuition.id, amountMinor: 2500000 },
  });

  // Assign fee to Aarav + create charge + payment
  const aaravEnrollId = studMap['STU-2026-001'].enrollId;
  const aaravStudId = studMap['STU-2026-001'].studId;

  const feeAssignment = await prisma.studentFeeAssignment.create({
    data: { tenantId: tId, academicYearId: ayId, studentId: aaravStudId, studentEnrollmentId: aaravEnrollId, feeStructureId: feeStructure.id, assignmentStatus: FeeAssignmentStatus.ACTIVE, assignedByUserId: adminUser.userId },
  });

  const feeCharge = await prisma.feeCharge.create({
    data: {
      tenantId: tId, academicYearId: ayId, studentId: aaravStudId,
      studentEnrollmentId: aaravEnrollId, studentFeeAssignmentId: feeAssignment.id,
      feeComponentId: feeComponentTuition.id, feeInstallmentId: feeInstallment.id,
      description: 'Tuition Fee Q1 2026', amountMinor: 2500000,
      dueDate: daysFromNow(30), chargeType: FeeChargeType.STRUCTURE, status: FeeChargeStatus.OPEN,
      createdByUserId: adminUser.userId,
    },
  });

  // Partial payment by Aarav (offline cash)
  const payment = await prisma.payment.create({
    data: {
      tenantId: tId, academicYearId: ayId, studentId: aaravStudId, studentEnrollmentId: aaravEnrollId,
      amountMinor: 1000000, // 10,000 INR partial
      paymentDate: daysAgo(5), paymentMethod: PaymentMethod.CASH,
      status: PaymentStatus.CONFIRMED, recordedByUserId: empMap['EMP-004'].userId,
    },
  });
  await prisma.paymentAllocation.create({
    data: { tenantId: tId, paymentId: payment.id, feeChargeId: feeCharge.id, amountMinor: 1000000 },
  });
  await prisma.receipt.create({
    data: { tenantId: tId, paymentId: payment.id, receiptNumber: 'RCT/2026/001', issuedByUserId: empMap['EMP-004'].userId, status: 'ISSUED', snapshotData: { studentName: 'Aarav Sharma', amountMinor: 1000000, paymentMethod: 'CASH', paymentDate: daysAgo(5) } },
  });
  // Update fee charge to partially paid
  await prisma.feeCharge.update({ where: { id: feeCharge.id }, data: { status: FeeChargeStatus.PARTIALLY_PAID } });

  // Fully unpaid charge for Diya
  await prisma.feeCharge.create({
    data: {
      tenantId: tId, academicYearId: ayId, studentId: studMap['STU-2026-002'].studId,
      studentEnrollmentId: studMap['STU-2026-002'].enrollId,
      feeComponentId: feeComponentTuition.id,
      description: 'Tuition Fee Q1 2026', amountMinor: 2500000,
      dueDate: daysFromNow(30), chargeType: FeeChargeType.STRUCTURE, status: FeeChargeStatus.OPEN,
      createdByUserId: adminUser.userId,
    },
  });

  // ==========================================================================
  // HOMEWORK & ASSIGNMENTS & STUDY MATERIALS
  // ==========================================================================

  console.log('  📚 Seeding homework, assignments, study materials...');

  // Homework: Math for G6-A (published)
  await prisma.homework.create({
    data: {
      tenantId: tId, academicYearId: ayId, classId: glMap['G6'], sectionId: secMap['G6-A'],
      subjectId: subMap['MATH'], teacherEmployeeId: empMap['EMP-008'].empId,
      title: 'Chapter 3: Fractions – Practice Set', description: 'Complete exercises 3.1 to 3.5 from the textbook.',
      assignedDate: daysAgo(3), dueDate: daysFromNow(2),
      status: HomeworkStatus.PUBLISHED, createdByUserId: empMap['EMP-008'].userId, publishedAt: daysAgo(3),
    },
  });

  // Homework: Science for G8-A (published)
  await prisma.homework.create({
    data: {
      tenantId: tId, academicYearId: ayId, classId: glMap['G8'], sectionId: secMap['G8-A'],
      subjectId: subMap['SCI'], teacherEmployeeId: empMap['EMP-009'].empId,
      title: 'Chemical Reactions – Worksheet', description: 'Fill in the blanks and answer short questions on chemical reactions.',
      assignedDate: daysAgo(1), dueDate: daysFromNow(5),
      status: HomeworkStatus.PUBLISHED, createdByUserId: empMap['EMP-009'].userId, publishedAt: daysAgo(1),
    },
  });

  // Assignment: Science Project for G8-A
  const assignment = await prisma.assignment.create({
    data: {
      tenantId: tId, academicYearId: ayId, classId: glMap['G8'], sectionId: secMap['G8-A'],
      subjectId: subMap['SCI'], teacherEmployeeId: empMap['EMP-009'].empId,
      title: 'Science Project Report', description: 'Prepare a 500-word report on any environmental topic.',
      assignedAt: daysAgo(7), dueAt: daysFromNow(7),
      maximumMarks: 20, allowLateSubmission: true,
      status: AssignmentStatus.PUBLISHED, createdByUserId: empMap['EMP-009'].userId, publishedAt: daysAgo(7),
    },
  });

  // Arjun's submission (submitted on time)
  const arjunSubmission = await prisma.assignmentSubmission.create({
    data: {
      tenantId: tId, assignmentId: assignment.id,
      studentId: studMap['STU-2026-009'].studId, studentEnrollmentId: studMap['STU-2026-009'].enrollId,
      submittedAt: daysAgo(2), status: SubmissionStatus.SUBMITTED, textResponse: 'My report on water conservation.',
    },
  });
  // Vikram grades Arjun's submission
  await prisma.assignmentGrade.create({
    data: { tenantId: tId, assignmentSubmissionId: arjunSubmission.id, marksAwarded: 17, feedback: 'Well-structured report. Excellent references.', gradedByUserId: empMap['EMP-009'].userId },
  });
  await prisma.assignmentSubmission.update({ where: { id: arjunSubmission.id }, data: { status: SubmissionStatus.GRADED } });

  // Nisha – no submission (missing)

  // Study Material: Math notes for G6-A
  await prisma.studyMaterial.create({
    data: {
      tenantId: tId, academicYearId: ayId, classId: glMap['G6'], sectionId: secMap['G6-A'],
      subjectId: subMap['MATH'], teacherEmployeeId: empMap['EMP-008'].empId,
      title: 'Fractions Notes PDF', description: 'Summary notes for Chapter 3.',
      materialType: StudyMaterialType.NOTES, status: StudyMaterialStatus.PUBLISHED,
      publishedAt: daysAgo(4), createdByUserId: empMap['EMP-008'].userId,
    },
  });

  // ==========================================================================
  // LIBRARY CHAIN
  // ==========================================================================

  console.log('  📖 Seeding library...');

  const bookCat = await prisma.bookCategory.create({ data: { tenantId: tId, name: 'Science', code: 'SCI' } });
  const mathCat = await prisma.bookCategory.create({ data: { tenantId: tId, name: 'Mathematics', code: 'MATH' } });
  const litCat = await prisma.bookCategory.create({ data: { tenantId: tId, name: 'Literature', code: 'LIT' } });

  const authorHawking = await prisma.author.create({ data: { tenantId: tId, name: 'Stephen Hawking' } });
  const authorKipling = await prisma.author.create({ data: { tenantId: tId, name: 'Rudyard Kipling' } });

  const pubCambridge = await prisma.publisher.create({ data: { tenantId: tId, name: 'Cambridge Press' } });

  const book1 = await prisma.book.create({
    data: { tenantId: tId, title: 'A Brief History of Time', categoryId: bookCat.id, publisherId: pubCambridge.id, publicationYear: 1988 },
  });
  await prisma.bookAuthor.create({ data: { tenantId: tId, bookId: book1.id, authorId: authorHawking.id } });
  const book1Copy1 = await prisma.bookCopy.create({ data: { tenantId: tId, bookId: book1.id, accessionNumber: 'ACC-001', status: BookCopyStatus.ISSUED } });
  const book1Copy2 = await prisma.bookCopy.create({ data: { tenantId: tId, bookId: book1.id, accessionNumber: 'ACC-002', status: BookCopyStatus.AVAILABLE } });

  const book2 = await prisma.book.create({
    data: { tenantId: tId, title: 'The Jungle Book', categoryId: litCat.id, publicationYear: 1894 },
  });
  await prisma.bookAuthor.create({ data: { tenantId: tId, bookId: book2.id, authorId: authorKipling.id } });
  await prisma.bookCopy.create({ data: { tenantId: tId, bookId: book2.id, accessionNumber: 'ACC-003', status: BookCopyStatus.AVAILABLE } });

  // Issue book1copy1 to Aarav
  const aaravLoan = await prisma.libraryLoan.create({
    data: {
      tenantId: tId, bookCopyId: book1Copy1.id,
      borrowerType: BorrowerType.STUDENT, studentId: aaravStudId,
      issuedAt: daysAgo(10), dueAt: daysFromNow(4),
      status: LoanStatus.ISSUED, issuedByUserId: empMap['EMP-005'].userId,
    },
  });

  // ==========================================================================
  // TRANSPORT CHAIN
  // ==========================================================================

  console.log('  🚌 Seeding transport...');

  const vehicle = await prisma.vehicle.create({
    data: { tenantId: tId, registrationNumber: 'KA-99-GIS-001', vehicleCode: 'BUS-01', vehicleType: 'BUS', seatingCapacity: 20, status: 'ACTIVE' },
  });

  const driver = await prisma.driverProfile.create({
    data: { tenantId: tId, employeeId: empMap['EMP-006'].empId, fullName: 'Sanjay Verma', phone: '9900099001', licenseNumber: 'KA-DL-0099001', status: 'ACTIVE' },
  });

  const route = await prisma.transportRoute.create({ data: { tenantId: tId, name: 'North Route', code: 'NR', status: 'ACTIVE' } });

  const stop1 = await prisma.transportStop.create({ data: { tenantId: tId, name: 'Central Park Stop', code: 'CP', status: 'ACTIVE' } });
  const stop2 = await prisma.transportStop.create({ data: { tenantId: tId, name: 'Lake Road Stop', code: 'LR', status: 'ACTIVE' } });
  const stop3 = await prisma.transportStop.create({ data: { tenantId: tId, name: 'Hill View Stop', code: 'HV', status: 'ACTIVE' } });

  await prisma.routeStop.create({ data: { tenantId: tId, routeId: route.id, stopId: stop1.id, sequenceNumber: 1, plannedArrivalTime: '08:00' } });
  await prisma.routeStop.create({ data: { tenantId: tId, routeId: route.id, stopId: stop2.id, sequenceNumber: 2, plannedArrivalTime: '08:15' } });
  await prisma.routeStop.create({ data: { tenantId: tId, routeId: route.id, stopId: stop3.id, sequenceNumber: 3, plannedArrivalTime: '08:30' } });

  const pickupTrip = await prisma.transportTrip.create({
    data: { tenantId: tId, routeId: route.id, vehicleId: vehicle.id, driverProfileId: driver.id, tripType: TripType.PICKUP, name: 'Morning Pickup', startTime: '07:50', status: 'ACTIVE' },
  });
  const dropTrip = await prisma.transportTrip.create({
    data: { tenantId: tId, routeId: route.id, vehicleId: vehicle.id, driverProfileId: driver.id, tripType: TripType.DROP, name: 'Evening Drop', startTime: '14:45', status: 'ACTIVE' },
  });

  // Assign Aarav to North Route
  await prisma.studentTransportAssignment.create({
    data: {
      tenantId: tId, academicYearId: ayId, studentId: aaravStudId, studentEnrollmentId: aaravEnrollId,
      pickupTripId: pickupTrip.id, pickupStopId: stop1.id,
      dropTripId: dropTrip.id, dropStopId: stop1.id,
      effectiveFrom: academicYearStart, assignedByUserId: adminUser.userId, status: 'ACTIVE',
    },
  });

  // ==========================================================================
  // ANNOUNCEMENTS & NOTIFICATIONS
  // ==========================================================================

  console.log('  📣 Seeding announcements and notifications...');

  const announcement = await prisma.announcement.create({
    data: {
      tenantId: tId,
      title: 'School Closed for Maintenance – Demo Notice',
      body: 'Greenfield International School will remain closed on an upcoming date for annual electrical maintenance. This is a DEMO notice.',
      announcementType: AnnouncementType.ADMINISTRATIVE,
      priority: AnnouncementPriority.IMPORTANT,
      status: AnnouncementStatus.PUBLISHED,
      createdByUserId: adminUser.userId,
      publishedByUserId: adminUser.userId,
      publishedAt: daysAgo(1),
    },
  });
  // Audience: ALL_SCHOOL
  await prisma.announcementAudience.create({ data: { tenantId: tId, announcementId: announcement.id, audienceType: AnnouncementAudienceType.ALL_SCHOOL } });

  // Teacher-only announcement
  const teacherAnn = await prisma.announcement.create({
    data: {
      tenantId: tId,
      title: 'Staff Meeting – Monday 3PM',
      body: 'All teaching staff are requested to attend the weekly coordination meeting on Monday at 3PM in the conference room.',
      announcementType: AnnouncementType.GENERAL,
      priority: AnnouncementPriority.NORMAL,
      status: AnnouncementStatus.PUBLISHED,
      createdByUserId: adminUser.userId,
      publishedAt: daysAgo(1),
    },
  });
  await prisma.announcementAudience.create({ data: { tenantId: tId, announcementId: teacherAnn.id, audienceType: AnnouncementAudienceType.TEACHERS } });

  // Notifications for key users
  const notifUsers = [
    empMap['EMP-001'].userId,
    empMap['EMP-008'].userId,
    empMap['EMP-009'].userId,
    studMap['STU-2026-001'].userId,
    rajeshUser.id,
  ];
  for (const userId of notifUsers) {
    await prisma.notification.create({
      data: {
        tenantId: tId, userId,
        type: 'ANNOUNCEMENT', title: 'New School Announcement',
        message: 'School Closed for Maintenance – Demo Notice',
        referenceType: 'Announcement', referenceId: announcement.id,
      },
    });
  }

  // Leave approval notification for Neha
  await prisma.notification.create({
    data: {
      tenantId: tId, userId: empMap['EMP-008'].userId,
      type: 'LEAVE_REQUEST', title: 'Your leave request is pending approval',
      message: 'Your Casual Leave request (5 days) is pending review by the Principal.',
      referenceType: 'LeaveRequest', referenceId: nehaLeave.id,
    },
  });

  // ==========================================================================
  // CALENDAR EVENTS
  // ==========================================================================

  console.log('  📅 Seeding calendar events...');

  await prisma.calendarEvent.create({
    data: {
      tenantId: tId, academicYearId: ayId,
      title: 'Independence Day – School Holiday',
      description: 'National Holiday. School remains closed.',
      eventType: CalendarEventType.HOLIDAY,
      startAt: new Date(`${academicYearStart.getFullYear()}-08-15`),
      endAt: new Date(`${academicYearStart.getFullYear()}-08-15`),
      allDay: true, status: CalendarEventStatus.PUBLISHED,
      visibility: 'ALL', createdByUserId: adminUser.userId,
    },
  });

  await prisma.calendarEvent.create({
    data: {
      tenantId: tId, academicYearId: ayId,
      title: 'Annual Sports Day',
      description: 'School-wide annual sports meet. All students and staff to participate.',
      eventType: CalendarEventType.SPORTS,
      startAt: daysFromNow(30),
      endAt: daysFromNow(30),
      allDay: true, status: CalendarEventStatus.PUBLISHED,
      visibility: 'ALL', createdByUserId: adminUser.userId,
    },
  });

  await prisma.calendarEvent.create({
    data: {
      tenantId: tId, academicYearId: ayId,
      title: 'Mid-Term Examination 2026',
      description: 'Mid-term exams for all grades.',
      eventType: CalendarEventType.EXAM,
      startAt: daysAgo(20), endAt: daysAgo(16),
      allDay: false, status: CalendarEventStatus.PUBLISHED,
      visibility: 'ALL', createdByUserId: adminUser.userId,
    },
  });

  // ==========================================================================
  // VISITORS & GATE PASSES
  // ==========================================================================

  console.log('  🚪 Seeding visitors and gate passes...');

  const visitor = await prisma.visitor.create({
    data: { tenantId: tId, fullName: 'Demo Visitor Person', phone: '9900099999' },
  });
  await prisma.visitRecord.create({
    data: {
      tenantId: tId, visitorId: visitor.id,
      purpose: 'Admission enquiry',
      personToMeetEmployeeId: empMap['EMP-003'].empId,
      badgeNumber: 'V-2026-001',
      status: VisitRecordStatus.CHECKED_IN,
      createdByUserId: empMap['EMP-007'].userId,
    },
  });

  // Gate Pass for Aarav (pending)
  await prisma.studentGatePass.create({
    data: {
      tenantId: tId, studentId: aaravStudId, studentEnrollmentId: aaravEnrollId,
      requestType: GatePassRequestType.EARLY_EXIT,
      reason: 'Doctor appointment', requestedExitAt: new Date(),
      status: GatePassStatus.PENDING,
      requestedByUserId: empMap['EMP-003'].userId,
    },
  });

  // ==========================================================================
  // SUBSTITUTION CHAIN – Neha's leave → Rahul substitutes
  // ==========================================================================

  console.log('  🔄 Seeding substitution record...');

  // Find Monday Period 1 entry for G6-A (Neha's Math class)
  const mondayEntry = ttEntryMap.find(e => e.day === 'MONDAY' && e.period === 'Period 1' && e.sec === 'G6-A');
  if (mondayEntry) {
    await prisma.substitution.create({
      data: {
        tenantId: tId, schoolId: sId,
        date: daysFromNow(5),
        timetableEntryId: mondayEntry.id,
        originalEmployeeId: empMap['EMP-008'].empId,
        substituteEmployeeId: empMap['EMP-011'].empId,
        reason: 'Neha Kulkarni on approved leave',
        status: 'ASSIGNED',
        assignedByUserId: empMap['EMP-001'].userId,
      },
    });
  }

  // ==========================================================================
  // B. RIVERSIDE DEMO SCHOOL (Isolation tenant)
  // ==========================================================================

  console.log('\n🏫 Creating Riverside Demo School (isolation testing)...');

  const rTenant = await prisma.tenant.create({ data: { name: 'Riverside Demo School', slug: 'riverside-demo' } });
  const rTId = rTenant.id;
  const rSchool = await prisma.school.create({
    data: {
      tenantId: rTId, name: 'Riverside Demo School', code: 'RIV-DEMO-2026', slug: 'riv-demo-2026',
      schoolType: SchoolType.COMBINED, board: BoardType.CBSE,
      officialEmail: 'info@riverside.test', officialPhone: '9900022233',
      addressLine1: 'Riverside Valley, Fictional Lane', city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411001',
      status: 'ACTIVE',
    },
  });
  const rSId = rSchool.id;
  const rAy = await prisma.academicYear.create({
    data: { tenantId: rTId, schoolId: rSId, name: '2026–2027', startDate: new Date('2026-06-01'), endDate: new Date('2027-04-30'), status: 'ACTIVE', isCurrent: true },
  });
  const rAdminUser = await prisma.user.create({
    data: { tenantId: rTId, email: 'admin@riverside.test', passwordHash, firstName: 'Riverside', lastName: 'Admin', userType: 'SCHOOL_ADMIN', status: 'ACTIVE' },
  });
  const rAdmin = await prisma.employee.create({
    data: { tenantId: rTId, schoolId: rSId, userId: rAdminUser.id, employeeNumber: 'EMP-R-01', firstName: 'Riverside', lastName: 'Admin', employeeType: EmployeeType.MANAGEMENT, employmentType: EmploymentType.FULL_TIME, designation: 'Principal', joiningDate: new Date(), status: 'ACTIVE' },
  });
  const rGl = await prisma.gradeLevel.create({ data: { tenantId: rTId, schoolId: rSId, name: 'Grade 10', code: 'G10' } });
  const rSec = await prisma.section.create({ data: { tenantId: rTId, schoolId: rSId, gradeLevelId: rGl.id, name: 'Section A', code: 'G10-A' } });
  const rStudUser = await prisma.user.create({
    data: { tenantId: rTId, email: 'student@riverside.test', passwordHash, firstName: 'Riverside', lastName: 'Student', userType: 'STUDENT', status: 'ACTIVE' },
  });
  const rStud = await prisma.student.create({
    data: {
      tenantId: rTId, schoolId: rSId, userId: rStudUser.id,
      admissionNumber: 'STU-R-001', firstName: 'Riverside', lastName: 'Student',
      dateOfBirth: new Date('2012-01-15'), gender: 'Male', personalEmail: 'student@riverside.test',
      currentAddressLine1: 'Valley Road', currentCity: 'Pune', currentState: 'Maharashtra', currentCountry: 'India', currentPostalCode: '411001',
      permanentAddressLine1: 'Valley Road', permanentCity: 'Pune', permanentState: 'Maharashtra', permanentCountry: 'India', permanentPostalCode: '411001',
      admissionDate: new Date(),
    },
  });
  await prisma.studentEnrollment.create({
    data: { tenantId: rTId, schoolId: rSId, studentId: rStud.id, academicYearId: rAy.id, gradeLevelId: rGl.id, sectionId: rSec.id, enrollmentDate: new Date(), isCurrent: true },
  });

  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================

  console.log('\n✅ Phase 12.5 Demo Seed Complete!');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  GREENFIELD INTERNATIONAL SCHOOL – DEMO CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Password for all accounts: ' + DEMO_PASSWORD);
  console.log('');
  console.log('  ROLE              EMAIL');
  console.log('  ─────────────────────────────────────────────────');
  console.log('  Principal         arjun@greenfield.test');
  console.log('  Vice Principal    kavya@greenfield.test');
  console.log('  School Admin      ananya@greenfield.test');
  console.log('  Accountant        rohan@greenfield.test');
  console.log('  Librarian         meera@greenfield.test');
  console.log('  Transport Mgr     sanjay@greenfield.test');
  console.log('  Gate Staff        priya@greenfield.test');
  console.log('  Teacher (Math)    neha@greenfield.test');
  console.log('  Teacher (Sci)     vikram@greenfield.test');
  console.log('  Teacher (Eng)     aisha@greenfield.test');
  console.log('  Teacher (SST)     rahul@greenfield.test');
  console.log('  Student (Aarav)   aarav@gis.test        [6-A]');
  console.log('  Student (Aditya)  aditya@gis.test       [7-A]');
  console.log('  Student (Arjun)   arjun.s@gis.test      [8-A]');
  console.log('  Guardian (Rajesh) rajesh@gis.test       [Aarav+Aditya]');
  console.log('');
  console.log('  ISOLATION TENANT');
  console.log('  ─────────────────────────────────────────────────');
  console.log('  Riverside Admin   admin@riverside.test');
  console.log('  Riverside Student student@riverside.test');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Seeded Chains:');
  console.log('   ✅ Chain 1:  School Onboarding → Academic Year → Classes → Sections → Subjects');
  console.log('   ✅ Chain 2:  Employee → Teacher → TeacherAssignment → Timetable → Today Schedule');
  console.log('   ✅ Chain 3:  Student → Enrollment → Teacher Attendance → Student Attendance View');
  console.log('   ✅ Chain 4:  Teacher Leave → Pending Approval → Substitution Assigned');
  console.log('   ✅ Chain 5:  Exam → Marks → Results → Published → Report Card');
  console.log('   ✅ Chain 6:  Fee Structure → Student Charge → Offline Payment → Receipt → Ledger');
  console.log('   ✅ Chain 7:  Teacher Homework → Class Target → Student View');
  console.log('   ✅ Chain 8:  Assignment → Student Submission → Teacher Review → Feedback → Grade');
  console.log('   ✅ Chain 9:  Book Copy → Issue → Student Library → Return available');
  console.log('   ✅ Chain 10: Transport Assignment → Route → Stop → Manifest');
  console.log('   ✅ Chain 11: Visitor Check-In → Badge → Inside');
  console.log('   ✅ Chain 12: Gate Pass Pending → Awaiting Approval');
  console.log('   ✅ Chain 13: Same data available through Express API → MongoDB → React Native Mobile');
  console.log('   ✅ Tenant Isolation: Riverside data isolated from Greenfield data');
}

async function runWithRetry(fn: () => Promise<void>, attempts = 3, delayMs = 10000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await fn();
      return;
    } catch (e: any) {
      const isNetwork = e?.code === 'P2010' || e?.code === 'P2024' || e?.message?.includes('timed out') || e?.message?.includes('DNS') || e?.message?.includes('ECONNREFUSED') || e?.message?.includes('PrismaClientInitializationError');
      if (isNetwork && i < attempts) {
        console.log(`\n⚠️  Network error on attempt ${i}/${attempts}. Retrying in ${delayMs / 1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      console.error('\n❌ Demo seed failed:', e);
      process.exit(1);
    }
  }
}

runWithRetry(main)
  .finally(() => prisma.$disconnect());
