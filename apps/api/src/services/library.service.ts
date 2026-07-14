import { prisma } from '../prisma';
import { AppError } from '../middlewares/error.middleware';
import { auditService } from './audit.service';
import { BookCopyStatus, BorrowerType, LoanStatus, FineStatus } from '@prisma/client';

export const libraryService = {
  // Settings
  async getSettings(tenantId: string) {
    let settings = await prisma.librarySettings.findUnique({
      where: { tenantId }
    });
    if (!settings) {
      settings = await prisma.librarySettings.create({
        data: { tenantId }
      });
    }
    return settings;
  },

  async updateSettings(tenantId: string, data: any) {
    const settings = await this.getSettings(tenantId);
    return prisma.librarySettings.update({
      where: { id: settings.id },
      data: {
        defaultStudentLoanDays: data.defaultStudentLoanDays,
        defaultEmployeeLoanDays: data.defaultEmployeeLoanDays,
        maxStudentBooks: data.maxStudentBooks,
        maxEmployeeBooks: data.maxEmployeeBooks,
        renewalAllowed: data.renewalAllowed,
        maxRenewals: data.maxRenewals,
        fineEnabled: data.fineEnabled,
        finePerDayMinor: data.finePerDayMinor,
        graceDays: data.graceDays
      }
    });
  },

  // Book Category
  async listCategories(tenantId: string) {
    return prisma.bookCategory.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  },

  async createCategory(tenantId: string, data: { name: string; code?: string; description?: string }) {
    const existing = await prisma.bookCategory.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } }
    });
    if (existing) throw new AppError(400, 'Book Category already exists');

    return prisma.bookCategory.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code || null,
        description: data.description || null
      }
    });
  },

  // Author
  async listAuthors(tenantId: string) {
    return prisma.author.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  },

  async createAuthor(tenantId: string, data: { name: string; biography?: string }) {
    const existing = await prisma.author.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } }
    });
    if (existing) throw new AppError(400, 'Author already exists');

    return prisma.author.create({
      data: {
        tenantId,
        name: data.name,
        biography: data.biography || null
      }
    });
  },

  // Publisher
  async listPublishers(tenantId: string) {
    return prisma.publisher.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  },

  async createPublisher(tenantId: string, data: { name: string; contactInfo?: string }) {
    const existing = await prisma.publisher.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } }
    });
    if (existing) throw new AppError(400, 'Publisher already exists');

    return prisma.publisher.create({
      data: {
        tenantId,
        name: data.name,
        contactInfo: data.contactInfo || null
      }
    });
  },

  // Book / Catalog Record
  async listBooks(tenantId: string, params: { categoryId?: string; search?: string }) {
    const where: any = { tenantId, archivedAt: null };
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { isbn10: { contains: params.search, mode: 'insensitive' } },
        { isbn13: { contains: params.search, mode: 'insensitive' } }
      ];
    }
    return prisma.book.findMany({
      where,
      include: {
        category: true,
        publisher: true,
        authors: { include: { author: true } },
        copies: true
      },
      orderBy: { title: 'asc' }
    });
  },

  async createBook(
    tenantId: string,
    data: {
      title: string;
      subtitle?: string;
      isbn10?: string;
      isbn13?: string;
      categoryId?: string;
      publisherId?: string;
      edition?: string;
      publicationYear?: number;
      language?: string;
      description?: string;
      coverFileId?: string;
      authorIds?: string[];
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const book = await prisma.book.create({
      data: {
        tenantId,
        title: data.title,
        subtitle: data.subtitle || null,
        isbn10: data.isbn10 || null,
        isbn13: data.isbn13 || null,
        categoryId: data.categoryId || null,
        publisherId: data.publisherId || null,
        edition: data.edition || null,
        publicationYear: data.publicationYear || null,
        language: data.language || null,
        description: data.description || null,
        coverFileId: data.coverFileId || null
      }
    });

    if (data.authorIds && data.authorIds.length > 0) {
      for (const authorId of data.authorIds) {
        await prisma.bookAuthor.create({
          data: {
            tenantId,
            bookId: book.id,
            authorId
          }
        });
      }
    }

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'BOOK_CREATE',
      entityType: 'Book',
      entityId: book.id,
      newValues: book
    });

    return book;
  },

  // Physical copies
  async listCopies(tenantId: string, bookId?: string) {
    const where: any = { tenantId };
    if (bookId) where.bookId = bookId;
    return prisma.bookCopy.findMany({
      where,
      include: { book: true },
      orderBy: { accessionNumber: 'asc' }
    });
  },

  async createBookCopy(
    tenantId: string,
    bookId: string,
    data: {
      accessionNumber: string;
      barcode?: string;
      shelfLocation?: string;
      acquisitionCostMinor?: number;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const existing = await prisma.bookCopy.findUnique({
      where: { tenantId_accessionNumber: { tenantId, accessionNumber: data.accessionNumber } }
    });
    if (existing) throw new AppError(400, 'Duplicate accession number rejected');

    const copy = await prisma.bookCopy.create({
      data: {
        tenantId,
        bookId,
        accessionNumber: data.accessionNumber,
        barcode: data.barcode || null,
        shelfLocation: data.shelfLocation || null,
        acquisitionCostMinor: data.acquisitionCostMinor || null,
        status: BookCopyStatus.AVAILABLE
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'BOOK_COPY_CREATE',
      entityType: 'BookCopy',
      entityId: copy.id,
      newValues: copy
    });

    return copy;
  },

  async updateCopyStatus(tenantId: string, copyId: string, status: BookCopyStatus, notes: string | null, actorUserId?: string, actorEmail?: string) {
    const copy = await prisma.bookCopy.findFirst({ where: { id: copyId, tenantId } });
    if (!copy) throw new AppError(404, 'Book copy not found');

    const updated = await prisma.bookCopy.update({
      where: { id: copyId },
      data: { status }
    });

    if (actorUserId && actorEmail) {
      await auditService.log({
        actorUserId,
        actorEmail,
        tenantId,
        schoolId: null,
        action: 'BOOK_COPY_STATUS_UPDATE',
        entityType: 'BookCopy',
        entityId: copyId,
        newValues: { status, notes }
      });
    }
    return updated;
  },

  // Issue Book Loan
  async issueBook(
    tenantId: string,
    data: {
      bookCopyId: string;
      borrowerType: BorrowerType;
      studentId?: string;
      employeeId?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const copy = await prisma.bookCopy.findFirst({
      where: { id: data.bookCopyId, tenantId }
    });
    if (!copy) throw new AppError(404, 'Book copy not found');
    if (copy.status !== BookCopyStatus.AVAILABLE) {
      throw new AppError(400, 'Issued copy cannot be reissued');
    }

    const settings = await this.getSettings(tenantId);

    // Borrower limits check
    if (data.borrowerType === BorrowerType.STUDENT) {
      if (!data.studentId) throw new AppError(400, 'Student reference is required');
      const student = await prisma.student.findFirst({ where: { id: data.studentId, tenantId } });
      if (!student) throw new AppError(404, 'Student not found');

      const activeLoans = await prisma.libraryLoan.count({
        where: { tenantId, studentId: data.studentId, status: { in: [LoanStatus.ISSUED, LoanStatus.OVERDUE] } }
      });
      if (activeLoans >= settings.maxStudentBooks) {
        throw new AppError(400, 'Borrowing limit exceeded');
      }
    } else {
      if (!data.employeeId) throw new AppError(400, 'Employee reference is required');
      const employee = await prisma.employee.findFirst({ where: { id: data.employeeId, tenantId } });
      if (!employee) throw new AppError(404, 'Employee not found');

      const activeLoans = await prisma.libraryLoan.count({
        where: { tenantId, employeeId: data.employeeId, status: { in: [LoanStatus.ISSUED, LoanStatus.OVERDUE] } }
      });
      if (activeLoans >= settings.maxEmployeeBooks) {
        throw new AppError(400, 'Borrowing limit exceeded');
      }
    }

    const loanDays = data.borrowerType === BorrowerType.STUDENT
      ? settings.defaultStudentLoanDays
      : settings.defaultEmployeeLoanDays;

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + loanDays);

    const loan = await prisma.$transaction(async (tx) => {
      // Update Copy status
      await tx.bookCopy.update({
        where: { id: data.bookCopyId },
        data: { status: BookCopyStatus.ISSUED }
      });

      // Create loan
      return tx.libraryLoan.create({
        data: {
          tenantId,
          bookCopyId: data.bookCopyId,
          borrowerType: data.borrowerType,
          studentId: data.studentId || null,
          employeeId: data.employeeId || null,
          dueAt,
          status: LoanStatus.ISSUED,
          issuedByUserId: actorUserId
        }
      });
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'BOOK_ISSUE',
      entityType: 'LibraryLoan',
      entityId: loan.id,
      newValues: loan
    });

    return loan;
  },

  // Return Book Loan
  async returnBook(
    tenantId: string,
    loanId: string,
    data: {
      conditionStatus: BookCopyStatus; // AVAILABLE, DAMAGED, LOST
      remarks?: string;
    },
    actorUserId: string,
    actorEmail: string
  ) {
    const loan = await prisma.libraryLoan.findFirst({
      where: { id: loanId, tenantId },
      include: { bookCopy: true }
    });
    if (!loan) throw new AppError(404, 'Active loan not found');
    if (loan.status === LoanStatus.RETURNED) {
      throw new AppError(400, 'Loan already returned');
    }

    const settings = await this.getSettings(tenantId);
    let fineAmount = 0;
    const now = new Date();
    if (settings.fineEnabled && now > loan.dueAt) {
      const diffTime = Math.abs(now.getTime() - loan.dueAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > settings.graceDays) {
        fineAmount = (diffDays - settings.graceDays) * settings.finePerDayMinor;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update Copy condition status
      await tx.bookCopy.update({
        where: { id: loan.bookCopyId },
        data: { status: data.conditionStatus }
      });

      // Update loan status
      const updatedLoan = await tx.libraryLoan.update({
        where: { id: loanId },
        data: {
          returnedAt: now,
          status: data.conditionStatus === BookCopyStatus.LOST ? LoanStatus.LOST :
                  data.conditionStatus === BookCopyStatus.DAMAGED ? LoanStatus.DAMAGED :
                  LoanStatus.RETURNED,
          returnedByUserId: actorUserId
        }
      });

      // Create fine record if calculated
      let fine = null;
      if (fineAmount > 0) {
        fine = await tx.libraryFine.create({
          data: {
            tenantId,
            libraryLoanId: loanId,
            studentId: loan.studentId,
            employeeId: loan.employeeId,
            amountMinor: fineAmount,
            reason: `Overdue return. Days: ${Math.ceil(Math.abs(now.getTime() - loan.dueAt.getTime()) / (1000 * 60 * 60 * 24))}`,
            status: FineStatus.OPEN
          }
        });
      }

      return { loan: updatedLoan, fine };
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'BOOK_RETURN',
      entityType: 'LibraryLoan',
      entityId: loanId,
      newValues: result.loan
    });

    return result;
  },

  // Renewal
  async renewLoan(tenantId: string, loanId: string, actorUserId: string, actorEmail: string) {
    const loan = await prisma.libraryLoan.findFirst({
      where: { id: loanId, tenantId }
    });
    if (!loan) throw new AppError(404, 'Loan not found');
    if (loan.status === LoanStatus.RETURNED || loan.status === LoanStatus.LOST) {
      throw new AppError(400, 'Completed loan cannot be renewed');
    }

    const settings = await this.getSettings(tenantId);
    if (!settings.renewalAllowed) {
      throw new AppError(400, 'Renewals not allowed by library settings');
    }
    if (loan.renewalCount >= settings.maxRenewals) {
      throw new AppError(400, 'Maximum renewal limit exceeded');
    }

    const loanDays = loan.borrowerType === BorrowerType.STUDENT
      ? settings.defaultStudentLoanDays
      : settings.defaultEmployeeLoanDays;

    const newDueAt = new Date(loan.dueAt);
    newDueAt.setDate(newDueAt.getDate() + loanDays);

    const renewed = await prisma.libraryLoan.update({
      where: { id: loanId },
      data: {
        dueAt: newDueAt,
        renewalCount: { increment: 1 }
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'BOOK_RENEWAL',
      entityType: 'LibraryLoan',
      entityId: loanId,
      newValues: renewed
    });

    return renewed;
  },

  // Fine Waiver
  async waiveFine(
    tenantId: string,
    fineId: string,
    data: { waivedAmountMinor: number; reason: string },
    actorUserId: string,
    actorEmail: string
  ) {
    const fine = await prisma.libraryFine.findFirst({ where: { id: fineId, tenantId } });
    if (!fine) throw new AppError(404, 'Fine record not found');

    if (data.waivedAmountMinor > fine.amountMinor - fine.waivedAmountMinor) {
      throw new AppError(400, 'Waiver amount exceeds remaining fine amount');
    }

    const nextWaived = fine.waivedAmountMinor + data.waivedAmountMinor;
    const isFullyWaived = nextWaived >= fine.amountMinor;

    const updated = await prisma.libraryFine.update({
      where: { id: fineId },
      data: {
        waivedAmountMinor: nextWaived,
        status: isFullyWaived ? FineStatus.WAIVED : FineStatus.PARTIALLY_WAIVED,
        waivedByUserId: actorUserId,
        waiverReason: data.reason
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId: null,
      action: 'FINE_WAIVE',
      entityType: 'LibraryFine',
      entityId: fineId,
      newValues: updated
    });

    return updated;
  },

  // Borrower lists
  async listStudentLoans(tenantId: string, studentId: string) {
    return prisma.libraryLoan.findMany({
      where: { tenantId, studentId },
      include: { bookCopy: { include: { book: true } } },
      orderBy: { issuedAt: 'desc' }
    });
  },

  async listChildLoans(tenantId: string, studentId: string, parentUserId: string) {
    // Verify relationship
    const guardian = await prisma.guardian.findFirst({ where: { userId: parentUserId, tenantId } });
    if (!guardian) throw new AppError(403, 'Unauthorized parent profile access');

    const link = await prisma.studentGuardian.findFirst({
      where: { tenantId, studentId, guardianId: guardian.id }
    });
    if (!link) throw new AppError(403, 'Guardian sees only linked child');

    return this.listStudentLoans(tenantId, studentId);
  },

  // Dashboard Metrics
  async getDashboardMetrics(tenantId: string) {
    const totalTitles = await prisma.book.count({ where: { tenantId, archivedAt: null } });
    const totalCopies = await prisma.bookCopy.count({ where: { tenantId } });
    const availableCopies = await prisma.bookCopy.count({ where: { tenantId, status: BookCopyStatus.AVAILABLE } });
    const issuedCopies = await prisma.bookCopy.count({ where: { tenantId, status: BookCopyStatus.ISSUED } });
    const lostCopies = await prisma.bookCopy.count({ where: { tenantId, status: BookCopyStatus.LOST } });
    const damagedCopies = await prisma.bookCopy.count({ where: { tenantId, status: BookCopyStatus.DAMAGED } });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayIssues = await prisma.libraryLoan.count({
      where: { tenantId, issuedAt: { gte: todayStart } }
    });
    const todayReturns = await prisma.libraryLoan.count({
      where: { tenantId, returnedAt: { gte: todayStart } }
    });

    const overdueLoans = await prisma.libraryLoan.count({
      where: { tenantId, status: LoanStatus.OVERDUE }
    });

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      issuedCopies,
      lostCopies,
      damagedCopies,
      todayIssues,
      todayReturns,
      overdueLoans
    };
  }
};
