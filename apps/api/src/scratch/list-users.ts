import { prisma } from '../prisma';

async function main() {
  console.log('Listing users in database...');
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        userType: true,
        tenantId: true,
        status: true
      }
    });
    console.log('Total users:', users.length);
    console.log('Users detail:', JSON.stringify(users, null, 2));
  } catch (err: any) {
    console.error('Failed to list users:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
