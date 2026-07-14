import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding new admin credentials...');

  // 1. Resolve first tenant and school
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('❌ No tenant found in database. Please run the main seeder first.');
    process.exit(1);
  }
  console.log(`Resolved Tenant: ${tenant.name} (ID: ${tenant.id})`);

  const school = await prisma.school.findFirst({
    where: { tenantId: tenant.id }
  });
  if (!school) {
    console.error('❌ No school found in database.');
    process.exit(1);
  }
  console.log(`Resolved School: ${school.name} (ID: ${school.id})`);

  // 2. Define new admin credentials
  const email = 'admin@greenfield.test';
  const password = 'password123';
  const firstName = 'System';
  const lastName = 'Administrator';

  // 3. Create or update user
  const passwordHash = await argon2.hash(password);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: 'ACTIVE',
      userType: 'SCHOOL_ADMIN',
      tenantId: tenant.id
    },
    create: {
      email,
      firstName,
      lastName,
      passwordHash,
      userType: 'SCHOOL_ADMIN',
      tenantId: tenant.id,
      status: 'ACTIVE',
      mustChangePassword: false
    }
  });

  // Ensure employee profile exists for the school admin so they can log in via Mobile Principal Navigator
  const employee = await prisma.employee.findFirst({
    where: { userId: user.id }
  });

  if (!employee) {
    // Resolve first department if any
    const department = await prisma.department.findFirst({
      where: { schoolId: school.id }
    });

    await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        schoolId: school.id,
        userId: user.id,
        employeeNumber: 'EMP-ADMIN-999',
        firstName,
        lastName,
        employeeType: 'MANAGEMENT',
        employmentType: 'FULL_TIME',
        designation: 'School Administrator',
        joiningDate: new Date(),
        status: 'ACTIVE',
        primaryDepartmentId: department?.id || null
      }
    });
    console.log('✅ Employee profile created for the new admin.');
  } else {
    await prisma.employee.update({
      where: { id: employee.id },
      data: { status: 'ACTIVE' }
    });
    console.log('✅ Existing employee profile verified & marked ACTIVE.');
  }

  console.log('\n🎉 Admin account successfully seeded:');
  console.log(`   Email:    ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Name:     ${user.firstName} ${user.lastName}`);
  console.log(`   UserType: ${user.userType}`);
  console.log(`   Status:   ${user.status}`);
}

main()
  .catch((error) => {
    console.error('❌ Failed to seed new admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
