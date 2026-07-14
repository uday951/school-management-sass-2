import { Router } from 'express';
import { z } from 'zod';
import { importService } from '../services/import.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { ImportJobStatus } from '@prisma/client';
import { prisma } from '../prisma';

const router = Router();

router.use(authenticateToken, requireSchoolAdmin);

// 1. LIST IMPORT JOBS
const listQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

router.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    const [total, jobs] = await Promise.all([
      prisma.importJob.count({
        where: { tenantId: req.tenantId!, schoolId: req.schoolId! }
      }),
      prisma.importJob.findMany({
        where: { tenantId: req.tenantId!, schoolId: req.schoolId! },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          createdBy: { select: { firstName: true, lastName: true, email: true } }
        }
      })
    ]);

    res.json({
      statusCode: 200,
      message: 'Import jobs list retrieved',
      data: { total, jobs }
    });
  } catch (error) {
    next(error);
  }
});

// 2. UPLOAD IMPORT FILE
const uploadSchema = z.object({
  fileName: z.string().min(1),
  csvContent: z.string().min(1),
});

router.post('/upload', validateBody(uploadSchema), async (req, res, next) => {
  try {
    const { fileName, csvContent } = req.body;
    const job = await importService.createImportJob(
      req.tenantId!,
      req.schoolId!,
      fileName,
      csvContent,
      req.user!.id,
      req.user!.email
    );

    res.status(201).json({
      statusCode: 201,
      message: 'Import file uploaded and staged successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// 3. GET IMPORT JOB DETAILS (WITH ROWS)
const jobRowsQuerySchema = z.object({
  validationStatus: z.enum(['VALID', 'INVALID', 'WARNING', 'DUPLICATE']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('50'),
});

router.get('/:id', validateQuery(jobRowsQuerySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    const job = await prisma.importJob.findFirst({
      where: { id, tenantId: req.tenantId!, schoolId: req.schoolId! },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    if (!job) {
      return res.status(404).json({ statusCode: 404, message: 'Import job not found' });
    }

    const rowWhere: any = { importJobId: id, tenantId: req.tenantId! };
    if (req.query.validationStatus) {
      rowWhere.validationStatus = req.query.validationStatus;
    }

    const [totalRows, rows] = await Promise.all([
      prisma.importRow.count({ where: rowWhere }),
      prisma.importRow.findMany({
        where: rowWhere,
        orderBy: { rowNumber: 'asc' },
        skip,
        take: limit
      })
    ]);

    res.json({
      statusCode: 200,
      message: 'Import job details retrieved',
      data: { job, rows, totalRows }
    });
  } catch (error) {
    next(error);
  }
});

// 4. RUN VALIDATIONS
router.post('/:id/validate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await importService.validateImportJob(req.tenantId!, req.schoolId!, id);

    res.json({
      statusCode: 200,
      message: 'Import validation completed',
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// 5. EXECUTE IMPORT
const executeSchema = z.object({
  duplicateStrategy: z.enum(['SKIP', 'ERROR']).default('SKIP'),
});

router.post('/:id/execute', validateBody(executeSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duplicateStrategy } = req.body;
    const job = await importService.executeImport(
      req.tenantId!,
      req.schoolId!,
      id,
      req.user!.id,
      req.user!.email,
      duplicateStrategy
    );

    res.json({
      statusCode: 200,
      message: 'Import executed successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
});

export default router;
