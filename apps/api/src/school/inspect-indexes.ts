import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const db = (prisma as any)._dmmf;
    // We can run a raw MongoDB command to get indexes of Employee collection
    const result = await prisma.$runCommandRaw({
      listIndexes: 'Employee'
    });
    console.log('Indexes on Employee:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error listing indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
