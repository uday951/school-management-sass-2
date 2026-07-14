import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environmental variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const newPassword = args[1];

  if (!email || !newPassword) {
    console.log('\n❌ Usage: npx ts-node src/seed/reset-password.ts <email> <newPassword>');
    console.log('Example: npx ts-node src/seed/reset-password.ts greenwood.admin@gmail.com Admin@2025\n');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    console.error(`\n❌ Error: User with email '${email}' not found.\n`);
    process.exit(1);
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustChangePassword: false, // Bypass force password change reset check
    },
  });

  console.log(`\n✅ Success: Password for '${email}' has been reset to '${newPassword}'\n`);
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
