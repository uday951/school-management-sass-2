import { Request, Response } from 'express';
import examsRouter from '../routes/exams.routes';
import { prisma } from '../prisma';

async function main() {
  console.log('Debugging route 500 error...');
  
  // Find a tenant and school context to mock
  const tenant = await prisma.tenant.findFirst();
  const school = await prisma.school.findFirst();
  const user = await prisma.user.findFirst();
  
  if (!tenant || !school || !user) {
    console.error('Missing seed data to mock request.');
    return;
  }
  
  console.log('Mock contexts:', {
    tenantId: tenant.id,
    schoolId: school.id,
    userId: user.id
  });

  // Find the GET /exams/grade-scales route handler
  const route = examsRouter.stack.find((layer: any) => 
    layer.route && 
    layer.route.path === '/exams/grade-scales' && 
    layer.route.methods.get
  );
  
  if (!route) {
    console.error('Could not find /exams/grade-scales GET route handler.');
    return;
  }
  
  // Retrieve the actual handler (it's the last middleware in the stack)
  const handler = (route as any).route.stack[(route as any).route.stack.length - 1].handle;
  
  // Mock Request, Response, Next
  const req = {
    tenantId: tenant.id,
    schoolId: school.id,
    user: user,
    query: {}
  } as any;
  
  const res = {
    json: (data: any) => {
      console.log('SUCCESS! Response data:', JSON.stringify(data, null, 2));
    },
    status: (code: number) => {
      console.log('STATUS:', code);
      return res;
    }
  } as any;
  
  const next = (err: any) => {
    if (err) {
      console.error('CRASH DETECTED inside route handler!');
      console.error('Error stack:', err.stack || err);
    } else {
      console.log('next() called without error');
    }
  };
  
  try {
    await handler(req, res, next);
  } catch (err: any) {
    console.error('Uncaught error inside handler execution:', err.stack || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
