import { Router } from 'express';
import { z } from 'zod';
import { libraryService } from '../services/library.service';
import { authenticateToken, requireSchoolAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { BorrowerType, BookCopyStatus } from '@prisma/client';

const router = Router();

// Student self access
router.get('/student/me', authenticateToken, async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.user!.id, tenantId: req.tenantId! }
    });
    if (!student) {
      return res.json({ statusCode: 200, message: 'No student profile', data: [] });
    }
    const loans = await libraryService.listStudentLoans(req.tenantId!, student.id);
    res.json({ statusCode: 200, message: 'Student library loans list', data: loans });
  } catch (error) {
    next(error);
  }
});

// Guardian linked-child access
router.get('/guardian/children/:studentId', authenticateToken, async (req, res, next) => {
  try {
    const loans = await libraryService.listChildLoans(req.tenantId!, req.params.studentId, req.user!.id);
    res.json({ statusCode: 200, message: 'Child library loans list', data: loans });
  } catch (error) {
    next(error);
  }
});

// School Admin endpoints
router.get('/dashboard', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const metrics = await libraryService.getDashboardMetrics(req.tenantId!);
    res.json({ statusCode: 200, message: 'Library dashboard stats', data: metrics });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const settings = await libraryService.getSettings(req.tenantId!);
    res.json({ statusCode: 200, message: 'Settings retrieved', data: settings });
  } catch (error) {
    next(error);
  }
});

const settingsSchema = z.object({
  defaultStudentLoanDays: z.number().int().min(1),
  defaultEmployeeLoanDays: z.number().int().min(1),
  maxStudentBooks: z.number().int().min(1),
  maxEmployeeBooks: z.number().int().min(1),
  renewalAllowed: z.boolean(),
  maxRenewals: z.number().int().min(0),
  fineEnabled: z.boolean(),
  finePerDayMinor: z.number().int().min(0),
  graceDays: z.number().int().min(0)
});

router.patch('/settings', authenticateToken, requireSchoolAdmin, validateBody(settingsSchema), async (req, res, next) => {
  try {
    const settings = await libraryService.updateSettings(req.tenantId!, req.body);
    res.json({ statusCode: 200, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    next(error);
  }
});

// Categories
router.get('/categories', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await libraryService.listCategories(req.tenantId!);
    res.json({ statusCode: 200, message: 'Categories list', data: list });
  } catch (error) {
    next(error);
  }
});

const categorySchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  description: z.string().optional()
});

router.post('/categories', authenticateToken, requireSchoolAdmin, validateBody(categorySchema), async (req, res, next) => {
  try {
    const item = await libraryService.createCategory(req.tenantId!, req.body);
    res.json({ statusCode: 200, message: 'Category created successfully', data: item });
  } catch (error) {
    next(error);
  }
});

// Authors
router.get('/authors', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await libraryService.listAuthors(req.tenantId!);
    res.json({ statusCode: 200, message: 'Authors list', data: list });
  } catch (error) {
    next(error);
  }
});

const authorSchema = z.object({
  name: z.string().min(1),
  biography: z.string().optional()
});

router.post('/authors', authenticateToken, requireSchoolAdmin, validateBody(authorSchema), async (req, res, next) => {
  try {
    const item = await libraryService.createAuthor(req.tenantId!, req.body);
    res.json({ statusCode: 200, message: 'Author created successfully', data: item });
  } catch (error) {
    next(error);
  }
});

// Publishers
router.get('/publishers', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await libraryService.listPublishers(req.tenantId!);
    res.json({ statusCode: 200, message: 'Publishers list', data: list });
  } catch (error) {
    next(error);
  }
});

const publisherSchema = z.object({
  name: z.string().min(1),
  contactInfo: z.string().optional()
});

router.post('/publishers', authenticateToken, requireSchoolAdmin, validateBody(publisherSchema), async (req, res, next) => {
  try {
    const item = await libraryService.createPublisher(req.tenantId!, req.body);
    res.json({ statusCode: 200, message: 'Publisher created successfully', data: item });
  } catch (error) {
    next(error);
  }
});

// Books Catalog
router.get('/books', authenticateToken, async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string;
    const search = req.query.search as string;
    const list = await libraryService.listBooks(req.tenantId!, { categoryId, search });
    res.json({ statusCode: 200, message: 'Books list', data: list });
  } catch (error) {
    next(error);
  }
});

const bookSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  isbn10: z.string().optional(),
  isbn13: z.string().optional(),
  categoryId: z.string().optional(),
  publisherId: z.string().optional(),
  edition: z.string().optional(),
  publicationYear: z.number().int().optional(),
  language: z.string().optional(),
  description: z.string().optional(),
  coverFileId: z.string().optional(),
  authorIds: z.array(z.string()).optional()
});

router.post('/books', authenticateToken, requireSchoolAdmin, validateBody(bookSchema), async (req, res, next) => {
  try {
    const item = await libraryService.createBook(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Book catalog entry created successfully', data: item });
  } catch (error) {
    next(error);
  }
});

// Physical copies
router.get('/copies', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const list = await libraryService.listCopies(req.tenantId!, req.query.bookId as string);
    res.json({ statusCode: 200, message: 'Copies list', data: list });
  } catch (error) {
    next(error);
  }
});

const copySchema = z.object({
  accessionNumber: z.string().min(1),
  barcode: z.string().optional(),
  shelfLocation: z.string().optional(),
  acquisitionCostMinor: z.number().int().optional()
});

router.post('/books/:bookId/copies', authenticateToken, requireSchoolAdmin, validateBody(copySchema), async (req, res, next) => {
  try {
    const item = await libraryService.createBookCopy(req.tenantId!, req.params.bookId, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Book copy created successfully', data: item });
  } catch (error) {
    next(error);
  }
});

// Loan Actions
const issueSchema = z.object({
  bookCopyId: z.string().min(1),
  borrowerType: z.nativeEnum(BorrowerType),
  studentId: z.string().optional(),
  employeeId: z.string().optional()
});

router.post('/loans/issue', authenticateToken, requireSchoolAdmin, validateBody(issueSchema), async (req, res, next) => {
  try {
    const loan = await libraryService.issueBook(req.tenantId!, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Book copy issued successfully', data: loan });
  } catch (error) {
    next(error);
  }
});

const returnSchema = z.object({
  conditionStatus: z.nativeEnum(BookCopyStatus),
  remarks: z.string().optional()
});

router.post('/loans/:id/return', authenticateToken, requireSchoolAdmin, validateBody(returnSchema), async (req, res, next) => {
  try {
    const result = await libraryService.returnBook(req.tenantId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Book copy returned successfully', data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/loans/:id/renew', authenticateToken, requireSchoolAdmin, async (req, res, next) => {
  try {
    const loan = await libraryService.renewLoan(req.tenantId!, req.params.id, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Loan renewed successfully', data: loan });
  } catch (error) {
    next(error);
  }
});

// Fines
const waiveSchema = z.object({
  waivedAmountMinor: z.number().int().min(1),
  reason: z.string().min(1)
});

router.post('/fines/:id/waive', authenticateToken, requireSchoolAdmin, validateBody(waiveSchema), async (req, res, next) => {
  try {
    const fine = await libraryService.waiveFine(req.tenantId!, req.params.id, req.body, req.user!.id, req.user!.email);
    res.json({ statusCode: 200, message: 'Fine amount waived successfully', data: fine });
  } catch (error) {
    next(error);
  }
});

import { prisma } from '../prisma';
export default router;
