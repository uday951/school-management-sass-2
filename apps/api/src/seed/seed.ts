import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Running seed...\n');

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME;
  const lastName = process.env.SUPER_ADMIN_LAST_NAME;

  if (!email || !password || !firstName || !lastName) {
    console.error('❌ Missing required environment variables:');
    console.error('   SUPER_ADMIN_EMAIL');
    console.error('   SUPER_ADMIN_PASSWORD');
    console.error('   SUPER_ADMIN_FIRST_NAME');
    console.error('   SUPER_ADMIN_LAST_NAME');
    process.exit(1);
  }

  // Idempotent: skip if admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ Super Admin already exists: ${email} (id: ${existing.id})`);
    console.log('   Seed is idempotent. Nothing was changed.');
    return;
  }

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      passwordHash,
      userType: 'PLATFORM_SUPER_ADMIN',
      tenantId: null,
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  console.log('✅ Platform Super Admin created successfully:');
  console.log(`   Email:    ${user.email}`);
  console.log(`   Name:     ${user.firstName} ${user.lastName}`);
  console.log(`   ID:       ${user.id}`);
  console.log(`   Type:     ${user.userType}`);
  console.log('\n⚠️  Keep these credentials secure and change the password in production!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
