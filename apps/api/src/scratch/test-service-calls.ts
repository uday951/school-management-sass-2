import { prisma } from '../prisma';
import { examsService } from '../services/exams.service';

async function main() {
  console.log('Testing service calls...');
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('No tenants found in database.');
      return;
    }
    console.log('Using tenant:', tenant.id, tenant.name);
    
    console.log('Calling listGradeScales with invalid-id...');
    const scales = await examsService.listGradeScales('invalid-id');
    console.log('Grade scales count:', scales.length);
    
    console.log('Calling listReportCardTemplates...');
    const templates = await examsService.listReportCardTemplates(tenant.id);
    console.log('Report card templates count:', templates.length);
    
    console.log('All calls succeeded without errors!');
  } catch (err: any) {
    console.error('Service call failed! Error:', err.stack || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
