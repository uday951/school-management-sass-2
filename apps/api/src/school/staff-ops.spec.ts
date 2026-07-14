import { prisma } from '../prisma';
import { staffOpsService } from '../services/staff-ops.service';
import { 
  SchoolType,
  BoardType,
  UserType,
  EmployeeType,
  EmploymentType,
  EmployeeStatus,
  StaffAttendanceStatus,
  StaffAttendanceSource,
  LeavePartialDayType,
  LeaveRequestStatus,
  TimetableStatus
} from '@prisma/client';

jest.setTimeout(180000);

describe('Staff Operations - Attendance & Leave Management (E2E Integration & Security)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let schoolBId: string;
  let academicYearAId: string;
  
  let employeeAId: string;
  let employeeBId: string;
  let userAId: string;
  let userBId: string;

  let leaveTypeAId: string;
  let leavePolicyAId: string;

  const validActorId = '6a48d4072db586bacd5beb4a';

  beforeAll(async () => {
    // 1. Clean up lingering test data from previous runs
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['staff-tenant-a', 'staff-tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.staffAttendanceRecord.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.staffAttendanceSettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.leaveRequest.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.employeeLeaveBalance.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.leavePolicyRule.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.leavePolicy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.leaveType.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // 2. Create Tenant A & B
    const tenantA = await prisma.tenant.create({
      data: { name: 'Staff Tenant A', slug: 'staff-tenant-a' }
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: { name: 'Staff Tenant B', slug: 'staff-tenant-b' }
    });
    tenantBId = tenantB.id;

    // 3. Create Schools
    const schoolA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'School A',
        code: 'SCH-A-STAFF',
        slug: 'school-a-staff',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@scha-staff.com',
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
        code: 'SCH-B-STAFF',
        slug: 'school-b-staff',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@schb-staff.com',
        officialPhone: '0987654321',
        addressLine1: 'Address B',
        city: 'City B',
        state: 'State B',
        postalCode: '654321'
      }
    });
    schoolBId = schoolB.id;

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

    // 5. Create Users & Employees
    const userA = await prisma.user.create({
      data: {
        firstName: 'Staff',
        lastName: 'Teacher A',
        email: 'staff.a@schoola.com',
        passwordHash: 'hashed',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantAId
      }
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        firstName: 'Staff',
        lastName: 'Teacher B',
        email: 'staff.b@schoolb.com',
        passwordHash: 'hashed',
        userType: UserType.SCHOOL_ADMIN,
        tenantId: tenantBId
      }
    });
    userBId = userB.id;

    const empA = await prisma.employee.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: userAId,
        employeeNumber: 'EMP-00A',
        firstName: 'Staff',
        lastName: 'Teacher A',
        employeeType: EmployeeType.TEACHING,
        employmentType: EmploymentType.FULL_TIME,
        designation: 'Senior Teacher',
        joiningDate: new Date('2026-06-01T00:00:00Z'),
        status: EmployeeStatus.ACTIVE
      }
    });
    employeeAId = empA.id;

    const empB = await prisma.employee.create({
      data: {
        tenantId: tenantBId,
        schoolId: schoolBId,
        userId: userBId,
        employeeNumber: 'EMP-00B',
        firstName: 'Staff',
        lastName: 'Teacher B',
        employeeType: EmployeeType.TEACHING,
        employmentType: EmploymentType.FULL_TIME,
        designation: 'Senior Teacher',
        joiningDate: new Date('2026-06-01T00:00:00Z'),
        status: EmployeeStatus.ACTIVE
      }
    });
    employeeBId = empB.id;
  });

  describe('1. Attendance Recording & Constraints', () => {
    it('should successfully record attendance for an active employee', async () => {
      const dateStr = '2026-07-01';
      const record = await staffOpsService.markAttendance(
        tenantAId,
        {
          employeeId: employeeAId,
          date: dateStr,
          status: StaffAttendanceStatus.PRESENT,
          source: StaffAttendanceSource.MANUAL,
          remarks: 'Present today'
        },
        validActorId,
        'actor@scha.com'
      );

      expect(record).toBeDefined();
      expect(record.status).toBe(StaffAttendanceStatus.PRESENT);
      expect(record.remarks).toBe('Present today');
    });

    it('should block duplicate attendance record on the same date (updates instead)', async () => {
      const dateStr = '2026-07-01';
      const record = await staffOpsService.markAttendance(
        tenantAId,
        {
          employeeId: employeeAId,
          date: dateStr,
          status: StaffAttendanceStatus.LATE,
          source: StaffAttendanceSource.MANUAL,
          remarks: 'Updated to late'
        },
        validActorId,
        'actor@scha.com'
      );

      const dbRecords = await prisma.staffAttendanceRecord.findMany({
        where: { tenantId: tenantAId, employeeId: employeeAId, date: new Date('2026-07-01T00:00:00Z') }
      });

      expect(dbRecords.length).toBe(1);
      expect(dbRecords[0].status).toBe(StaffAttendanceStatus.LATE);
      expect(dbRecords[0].remarks).toBe('Updated to late');
    });

    it('should reject check-out time earlier than check-in time', async () => {
      const dateStr = '2026-07-02';
      await expect(
        staffOpsService.markAttendance(
          tenantAId,
          {
            employeeId: employeeAId,
            date: dateStr,
            status: StaffAttendanceStatus.PRESENT,
            checkInTime: '2026-07-02T09:00:00Z',
            checkOutTime: '2026-07-02T08:00:00Z'
          },
          validActorId,
          'actor@scha.com'
        )
      ).rejects.toThrow('Check-out time must be after check-in time');
    });

    it('should prevent Tenant B from marking attendance for Tenant A employee', async () => {
      const dateStr = '2026-07-03';
      await expect(
        staffOpsService.markAttendance(
          tenantBId,
          {
            employeeId: employeeAId, // Tenant A employee
            date: dateStr,
            status: StaffAttendanceStatus.PRESENT
          },
          validActorId,
          'actor@scha.com'
        )
      ).rejects.toThrow('Employee not active or not found');
    });
  });

  describe('2. Self Check-In & Settings', () => {
    it('should reject self check-in if not enabled in settings', async () => {
      await expect(
        staffOpsService.selfCheckIn(tenantAId, userAId)
      ).rejects.toThrow('Self check-in is not enabled for this school');
    });

    it('should allow self check-in once settings are enabled', async () => {
      await staffOpsService.updateSettings(
        tenantAId,
        { selfCheckInEnabled: true, selfCheckOutEnabled: true },
        validActorId,
        'actor@scha.com'
      );

      const record = await staffOpsService.selfCheckIn(tenantAId, userAId, 'Arrived at desk');
      expect(record).toBeDefined();
      expect(record.checkInTime).toBeDefined();
      expect(record.source).toBe(StaffAttendanceSource.SELF);
    });

    it('should reject duplicate self check-in on the same day', async () => {
      await expect(
        staffOpsService.selfCheckIn(tenantAId, userAId)
      ).rejects.toThrow('You have already checked in for today');
    });
  });

  describe('3. Leave Type & Policies Configuration', () => {
    it('should create leave types successfully', async () => {
      const lType = await staffOpsService.createLeaveType(
        tenantAId,
        {
          name: 'Casual Leave',
          code: 'CL',
          description: 'Regular casual leave allowance',
          isPaid: true,
          requiresApproval: true
        },
        validActorId,
        'actor@scha.com'
      );

      expect(lType).toBeDefined();
      expect(lType.code).toBe('CL');
      leaveTypeAId = lType.id;
    });

    it('should create leave policies and rules', async () => {
      const policy = await staffOpsService.createLeavePolicy(
        tenantAId,
        {
          name: 'Teaching Staff Leave Policy 2026',
          academicYearId: academicYearAId,
          employeeType: EmployeeType.TEACHING,
          rules: [
            {
              leaveTypeId: leaveTypeAId,
              annualAllowance: 12,
              carryForwardAllowed: false
            }
          ]
        },
        validActorId,
        'actor@scha.com'
      );

      expect(policy).toBeDefined();
      expect(policy.rules.length).toBe(1);
      expect(policy.rules[0].annualAllowance).toBe(12);
      leavePolicyAId = policy.id;
    });

    it('should initialize employee leave balances from policy', async () => {
      const balances = await staffOpsService.initEmployeeBalances(
        tenantAId,
        employeeAId,
        academicYearAId,
        leavePolicyAId
      );

      expect(balances.length).toBe(1);
      expect(balances[0].remaining).toBe(12);
      expect(balances[0].used).toBe(0);
    });
  });

  describe('4. Leave Request Submission & Review Ledger Workflow', () => {
    let leaveRequestId: string;

    it('should submit leave request successfully when balance is sufficient', async () => {
      const request = await staffOpsService.submitLeaveRequest(
        tenantAId,
        userAId,
        {
          leaveTypeId: leaveTypeAId,
          startDate: '2026-08-10',
          endDate: '2026-08-12', // 3 days: 10, 11, 12
          partialDayType: LeavePartialDayType.FULL_DAY,
          reason: 'Medical checkup'
        },
        academicYearAId
      );

      expect(request).toBeDefined();
      expect(request.status).toBe(LeaveRequestStatus.PENDING);
      leaveRequestId = request.id;
    });

    it('should reject leave request if balance is insufficient', async () => {
      await expect(
        staffOpsService.submitLeaveRequest(
          tenantAId,
          userAId,
          {
            leaveTypeId: leaveTypeAId,
            startDate: '2026-09-01',
            endDate: '2026-09-20', // 20 days (exceeds remaining balance of 12)
            partialDayType: LeavePartialDayType.FULL_DAY,
            reason: 'Extended vacation'
          },
          academicYearAId
        )
      ).rejects.toThrow('Insufficient leave balance');
    });

    it('should successfully approve leave request and deduct balance', async () => {
      const reviewed = await staffOpsService.reviewLeaveRequest(
        tenantAId,
        leaveRequestId,
        LeaveRequestStatus.APPROVED,
        'Approved by Admin',
        validActorId,
        'actor@scha.com',
        academicYearAId
      );

      expect(reviewed.status).toBe(LeaveRequestStatus.APPROVED);

      // Verify leave balance remaining was updated
      const balances = await staffOpsService.getEmployeeLeaveBalances(tenantAId, employeeAId, academicYearAId);
      expect(balances[0].remaining).toBe(9); // 12 - 3 days = 9 remaining
      expect(balances[0].used).toBe(3);

      // Verify attendance records automatically marked ON_LEAVE
      const rec = await prisma.staffAttendanceRecord.findFirst({
        where: { tenantId: tenantAId, employeeId: employeeAId, date: new Date('2026-08-10T00:00:00Z') }
      });
      expect(rec).toBeDefined();
      expect(rec?.status).toBe(StaffAttendanceStatus.ON_LEAVE);
    });

    it('should support timetable and schedule substitution impact analysis', async () => {
      const impact = await staffOpsService.getTeacherLeaveImpact(tenantAId, leaveRequestId);
      expect(Array.isArray(impact)).toBe(true);
    });
  });
});
