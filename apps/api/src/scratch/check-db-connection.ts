import { prisma } from '../prisma';

async function main() {
  console.log('Attempting to connect to MongoDB database...');
  try {
    const tenantsCount = await prisma.tenant.count();
    console.log('Connection successful! Total tenants in DB:', tenantsCount);
  } catch (err: any) {
    console.error('Connection failed! Error detail:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
