import { prisma } from '../prisma';

async function main() {
  console.log('Listing schools in database...');
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        tenantId: true,
        status: true
      }
    });
    console.log('Total schools:', schools.length);
    console.log('Schools detail:', JSON.stringify(schools, null, 2));
  } catch (err: any) {
    console.error('Failed to list schools:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
