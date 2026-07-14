import { prisma } from '../prisma';
import { authService } from '../services/auth.service';
import { SchoolType, BoardType, UserType, EmployeeType, EmploymentType, EnrollmentStatus } from '@prisma/client';
import express from 'express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import authRouter from '../routes/auth.routes';
import mobileRouter from '../routes/mobile.routes';
import { errorMiddleware } from '../middlewares/error.middleware';

const API_URL = 'http://localhost:3009/api';
jest.setTimeout(180000);

describe('Mobile App Endpoints & Authentication E2E Suite', () => {
  let tenantId: string;
  let schoolId: string;
  let teacherUserId: string;
  let studentUserId: string;
  let guardianUserId: string;
  let principalUserId: string;

  let teacherToken: string;
  let studentToken: string;
  let guardianToken: string;
  let principalToken: string;
  let teacherRefreshToken: string;
  let server: any;

  beforeAll(async () => {
    // 0. Start test express server
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRouter);
    app.use('/api/mobile', mobileRouter);
    app.use(errorMiddleware);
    
    server = app.listen(3009);

    // Cleanup existing test data
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['mobile-test-tenant'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      const oldUsers = await prisma.user.findMany({
        where: { tenantId: { in: oldTenantIds } },
        select: { id: true },
      });
      const oldUserIds = oldUsers.map((u) => u.id);
      await prisma.refreshSession.deleteMany({
        where: { userId: { in: oldUserIds } },
      });

      await prisma.notification.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.timetableEntry.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.leaveRequest.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.guardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.role.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
      data: { name: 'Mobile Test Tenant', slug: 'mobile-test-tenant' },
    });
    tenantId = tenant.id;

    // 2. Create School
    const school = await prisma.school.create({
      data: {
        tenantId,
        name: 'Mobile Test School',
        code: 'SCH-MOB-TEST',
        slug: 'school-mob-test',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@schoolmob.com',
        officialPhone: '9900990099',
        addressLine1: 'Road A',
        city: 'City A',
        state: 'State A',
        country: 'India',
        postalCode: '110001',
        status: 'ACTIVE',
      },
    });
    schoolId = school.id;

    const argon2 = require('argon2');
    const passwordHash = await argon2.hash('password123');

    // 3. Create Users
    // A. Principal/Admin User
    const principalUser = await prisma.user.create({
      data: {
        tenantId,
        email: 'principal@schoolmob.com',
        passwordHash,
        userType: UserType.SCHOOL_ADMIN,
        firstName: 'Principal',
        lastName: 'Pete',
      },
    });
    principalUserId = principalUser.id;

    // B. Teacher User
    const teacherUser = await prisma.user.create({
      data: {
        tenantId,
        email: 'teacher@schoolmob.com',
        passwordHash,
        userType: UserType.SCHOOL_ADMIN,
        firstName: 'Teacher',
        lastName: 'Tara',
      },
    });
    teacherUserId = teacherUser.id;

    const teacherEmployee = await prisma.employee.create({
      data: {
        tenantId,
        schoolId,
        userId: teacherUserId,
        employeeNumber: 'EMP-T101',
        firstName: 'Teacher',
        lastName: 'Tara',
        employeeType: EmployeeType.TEACHING,
        employmentType: EmploymentType.FULL_TIME,
        designation: 'Senior Teacher',
        joiningDate: new Date(),
      },
    });

    // C. Student User
    const studentUser = await prisma.user.create({
      data: {
        tenantId,
        email: 'student@schoolmob.com',
        passwordHash,
        userType: UserType.STUDENT,
        firstName: 'Student',
        lastName: 'Sam',
      },
    });
    studentUserId = studentUser.id;

    const studentProfile = await prisma.student.create({
      data: {
        tenantId,
        schoolId,
        userId: studentUserId,
        admissionNumber: 'ADM-S101',
        firstName: 'Student',
        lastName: 'Sam',
        dateOfBirth: new Date('2012-04-05'),
        gender: 'MALE',
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
        permanentPostalCode: '110001',
      },
    });

    // Academic Year
    const ay = await prisma.academicYear.create({
      data: {
        tenantId,
        schoolId,
        name: 'AY 2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'ACTIVE',
        isCurrent: true,
      },
    });

    // Grade and Section
    const grade = await prisma.gradeLevel.create({
      data: { tenantId, schoolId, name: 'Grade 5', code: 'G5' },
    });
    const section = await prisma.section.create({
      data: { tenantId, schoolId, gradeLevelId: grade.id, name: 'Section A' },
    });

    await prisma.studentEnrollment.create({
      data: {
        tenantId,
        schoolId,
        studentId: studentProfile.id,
        academicYearId: ay.id,
        gradeLevelId: grade.id,
        sectionId: section.id,
        enrollmentDate: new Date(),
        status: EnrollmentStatus.ACTIVE,
        isCurrent: true,
      },
    });

    // D. Guardian User
    const guardianUser = await prisma.user.create({
      data: {
        tenantId,
        email: 'guardian@schoolmob.com',
        passwordHash,
        userType: UserType.GUARDIAN,
        firstName: 'Guardian',
        lastName: 'Gary',
      },
    });
    guardianUserId = guardianUser.id;

    await prisma.guardian.create({
      data: {
        tenantId,
        schoolId,
        userId: guardianUserId,
        firstName: 'Guardian',
        lastName: 'Gary',
        phone: '9898989898',
      },
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Mobile Safe Auth Requests', () => {
    test('should perform mobile login and return tokens in JSON payload', async () => {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: 'teacher@schoolmob.com',
        password: 'password123',
      });

      expect(res.data.statusCode).toBe(200);
      expect(res.data.data.accessToken).toBeDefined();
      expect(res.data.data.refreshToken).toBeDefined();
      teacherToken = res.data.data.accessToken;
      teacherRefreshToken = res.data.data.refreshToken;
    });

    test('should rotate tokens using refresh token in request body', async () => {
      const res = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: teacherRefreshToken,
      });

      expect(res.data.statusCode).toBe(200);
      expect(res.data.data.accessToken).toBeDefined();
      expect(res.data.data.refreshToken).toBeDefined();
    });
  });

  describe('Bootstrap & Dashboards Resolution', () => {
    test('should bootstrap teacher context successfully', async () => {
      const res = await axios.get(`${API_URL}/mobile/bootstrap`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.data.statusCode).toBe(200);
      expect(res.data.data.roles).toContain('TEACHER');
      expect(res.data.data.school.id).toBe(schoolId);
    });

    test('should query teacher dashboard metrics', async () => {
      const res = await axios.get(`${API_URL}/mobile/teacher/home`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.data.statusCode).toBe(200);
      expect(res.data.data.classesTodayCount).toBeDefined();
      expect(res.data.data.attendancePendingCount).toBeDefined();
    });
  });
});
