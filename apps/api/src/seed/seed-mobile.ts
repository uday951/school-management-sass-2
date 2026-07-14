import { PrismaClient, SchoolType, BoardType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding permanent Mobile Test Data...');

  // Cleanup existing mobile-test-tenant data
  const oldTenants = await prisma.tenant.findMany({ where: { slug: 'mobile-test-tenant' } });
  const oldTenantIds = oldTenants.map(t => t.id);
  if (oldTenantIds.length > 0) {
    const oldUsers = await prisma.user.findMany({ where: { tenantId: { in: oldTenantIds } }, select: { id: true } });
    const oldUserIds = oldUsers.map((u) => u.id);
    await prisma.refreshSession.deleteMany({ where: { userId: { in: oldUserIds } } });
    await prisma.employee.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.studentGuardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.guardian.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
    await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
  }

  // Create Tenant
  const tenant = await prisma.tenant.create({
    data: { name: 'Mobile Test Tenant', slug: 'mobile-test-tenant' },
  });
  const tenantId = tenant.id;

  // Create School
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
  const schoolId = school.id;

  const passwordHash = await argon2.hash('password123');

  // Academic Year
  const ay = await prisma.academicYear.create({
    data: {
      tenantId,
      schoolId,
      name: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      status: 'ACTIVE',
      isCurrent: true,
    },
  });
  const academicYearId = ay.id;

  // GradeLevel
  const gradeLevel = await prisma.gradeLevel.create({
    data: { tenantId, schoolId, name: 'Grade 10', code: 'G10' },
  });
  const gradeLevelId = gradeLevel.id;

  // Section
  const section = await prisma.section.create({
    data: { tenantId, schoolId, gradeLevelId, name: 'Section A' },
  });
  const sectionId = section.id;

  // 1. Teacher User
  const teacherUser = await prisma.user.create({
    data: {
      tenantId,
      email: 'teacher@schoolmob.com',
      passwordHash,
      firstName: 'Teresa',
      lastName: 'Teacher',
      userType: 'SCHOOL_ADMIN',
      status: 'ACTIVE',
    },
  });

  // Teacher Employee Profile
  await prisma.employee.create({
    data: {
      tenantId,
      schoolId,
      userId: teacherUser.id,
      employeeNumber: 'EMP-T-01',
      firstName: 'Teresa',
      lastName: 'Teacher',
      employeeType: 'TEACHING',
      employmentType: 'FULL_TIME',
      designation: 'Senior Teacher',
      joiningDate: new Date(),
      status: 'ACTIVE',
    },
  });

  // 2. Student User
  const studentUser = await prisma.user.create({
    data: {
      tenantId,
      email: 'student@schoolmob.com',
      passwordHash,
      firstName: 'Sam',
      lastName: 'Student',
      userType: 'STUDENT',
      status: 'ACTIVE',
    },
  });

  // Student Profile
  const student = await prisma.student.create({
    data: {
      tenantId,
      schoolId,
      userId: studentUser.id,
      admissionNumber: 'ADM-S-01',
      firstName: 'Sam',
      lastName: 'Student',
      dateOfBirth: new Date('2012-05-15'),
      gender: 'Male',
      personalEmail: 'student@schoolmob.com',
      currentAddressLine1: 'Road S',
      currentCity: 'City S',
      currentState: 'State S',
      currentCountry: 'India',
      currentPostalCode: '110001',
      permanentAddressLine1: 'Road S',
      permanentCity: 'City S',
      permanentState: 'State S',
      permanentCountry: 'India',
      permanentPostalCode: '110001',
      admissionDate: new Date(),
    },
  });

  // Student Enrollment
  await prisma.studentEnrollment.create({
    data: {
      tenantId,
      schoolId,
      studentId: student.id,
      academicYearId,
      gradeLevelId,
      sectionId,
      enrollmentDate: new Date(),
      isCurrent: true,
    },
  });

  // 3. Guardian User
  const guardianUser = await prisma.user.create({
    data: {
      tenantId,
      email: 'guardian@schoolmob.com',
      passwordHash,
      firstName: 'Gary',
      lastName: 'Guardian',
      userType: 'GUARDIAN',
      status: 'ACTIVE',
    },
  });

  // Guardian Profile
  const guardian = await prisma.guardian.create({
    data: {
      tenantId,
      schoolId,
      userId: guardianUser.id,
      firstName: 'Gary',
      lastName: 'Guardian',
      email: 'guardian@schoolmob.com',
      phone: '9988998899',
    },
  });

  // Link Student to Guardian
  await prisma.studentGuardian.create({
    data: {
      tenantId,
      schoolId,
      studentId: student.id,
      guardianId: guardian.id,
      relationship: 'FATHER',
      isPrimary: true,
    },
  });

  console.log('✅ Mobile Test Data Seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
