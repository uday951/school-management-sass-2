import { prisma } from '../prisma';
import { libraryService } from '../services/library.service';
import { transportService } from '../services/transport.service';
import {
  SchoolType,
  BoardType,
  UserType,
  BookCopyStatus,
  BorrowerType,
  LoanStatus,
  VehicleType,
  TripType,
  TransportAttendanceStatus,
  EnrollmentStatus
} from '@prisma/client';

jest.setTimeout(180000);

describe('Library & Transport Management (E2E Integration & Security)', () => {
  let tenantAId: string;
  let tenantBId: string;
  let schoolAId: string;
  let academicYearAId: string;
  let studentAId: string;
  let enrollmentAId: string;
  let gradeLevelAId: string;
  let sectionAId: string;
  let userAId: string;
  
  const validActorId = '6a48d4072db586bacd5beb4a';
  const validActorEmail = 'admin@libtrans.com';

  beforeAll(async () => {
    // Clean up
    const oldTenants = await prisma.tenant.findMany({
      where: { slug: { in: ['lib-trans-tenant-a', 'lib-trans-tenant-b'] } }
    });
    const oldTenantIds = oldTenants.map(t => t.id);
    if (oldTenantIds.length > 0) {
      await prisma.libraryLoan.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.libraryFine.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.bookReservation.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.bookCopy.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.bookAuthor.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.book.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.bookCategory.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.author.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.publisher.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.librarySettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });

      await prisma.studentTransportAssignment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.transportAttendance.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.transportOverride.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.transportTrip.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.routeStop.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.transportStop.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.transportRoute.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.driverProfile.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.vehicle.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.transportSettings.deleteMany({ where: { tenantId: { in: oldTenantIds } } });

      await prisma.studentEnrollment.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.student.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.user.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.section.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.gradeLevel.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.academicYear.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.school.deleteMany({ where: { tenantId: { in: oldTenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: oldTenantIds } } });
    }

    // Create Tenants
    const tenantA = await prisma.tenant.create({ data: { name: 'Lib Trans Tenant A', slug: 'lib-trans-tenant-a' } });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({ data: { name: 'Lib Trans Tenant B', slug: 'lib-trans-tenant-b' } });
    tenantBId = tenantB.id;

    // School
    const schoolA = await prisma.school.create({
      data: {
        tenantId: tenantAId,
        name: 'School A',
        code: 'SCH-A-LT',
        slug: 'school-a-lt',
        schoolType: SchoolType.COMBINED,
        board: BoardType.CBSE,
        officialEmail: 'admin@schalt.com',
        officialPhone: '1122334455',
        addressLine1: 'Address A',
        city: 'City A',
        state: 'State A',
        country: 'India',
        postalCode: '110001'
      }
    });
    schoolAId = schoolA.id;

    // Academic Year
    const ay = await prisma.academicYear.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'AY 2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'ACTIVE',
        isCurrent: true
      }
    });
    academicYearAId = ay.id;

    // Grade Level & Section
    const grade = await prisma.gradeLevel.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        name: 'Grade 10',
        code: 'G10',
        displayOrder: 10
      }
    });
    gradeLevelAId = grade.id;

    const sec = await prisma.section.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        gradeLevelId: gradeLevelAId,
        name: 'Section A',
        capacity: 40
      }
    });
    sectionAId = sec.id;

    // User & Student
    const user = await prisma.user.create({
      data: {
        tenantId: tenantAId,
        email: 'student@schalt.com',
        passwordHash: 'hashed',
        userType: UserType.STUDENT,
        firstName: 'Student',
        lastName: 'Name'
      }
    });
    userAId = user.id;

    const student = await prisma.student.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        userId: userAId,
        admissionNumber: 'ADM-101',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'MALE',
        admissionDate: new Date(),
        currentAddressLine1: 'Addr',
        currentCity: 'City',
        currentState: 'State',
        currentCountry: 'India',
        currentPostalCode: '110001',
        permanentAddressLine1: 'Addr',
        permanentCity: 'City',
        permanentState: 'State',
        permanentCountry: 'India',
        permanentPostalCode: '110001'
      }
    });
    studentAId = student.id;

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        tenantId: tenantAId,
        schoolId: schoolAId,
        studentId: studentAId,
        academicYearId: academicYearAId,
        gradeLevelId: gradeLevelAId,
        sectionId: sectionAId,
        rollNumber: '10',
        enrollmentDate: new Date(),
        status: EnrollmentStatus.ACTIVE,
        isCurrent: true
      }
    });
    enrollmentAId = enrollment.id;
  });

  describe('Library Service Tests', () => {
    let catId: string;
    let authId: string;
    let pubId: string;
    let bookId: string;
    let copyId: string;

    test('should initialize and update settings successfully', async () => {
      const settings = await libraryService.getSettings(tenantAId);
      expect(settings).toBeDefined();
      expect(settings.defaultStudentLoanDays).toBe(14);

      const updated = await libraryService.updateSettings(tenantAId, {
        defaultStudentLoanDays: 7,
        defaultEmployeeLoanDays: 15,
        maxStudentBooks: 2,
        maxEmployeeBooks: 4,
        renewalAllowed: true,
        maxRenewals: 1,
        fineEnabled: true,
        finePerDayMinor: 100,
        graceDays: 2
      });
      expect(updated.defaultStudentLoanDays).toBe(7);
      expect(updated.fineEnabled).toBe(true);
    });

    test('should manage categories, authors and publishers', async () => {
      const cat = await libraryService.createCategory(tenantAId, { name: 'Science Fiction', code: 'SCI-FI' });
      catId = cat.id;
      expect(cat.name).toBe('Science Fiction');

      const author = await libraryService.createAuthor(tenantAId, { name: 'Isaac Asimov' });
      authId = author.id;

      const pub = await libraryService.createPublisher(tenantAId, { name: 'Gollancz' });
      pubId = pub.id;

      const books = await libraryService.listBooks(tenantAId, {});
      expect(books.length).toBe(0);
    });

    test('should create book and copies catalog records', async () => {
      const book = await libraryService.createBook(
        tenantAId,
        {
          title: 'Foundation',
          categoryId: catId,
          publisherId: pubId,
          authorIds: [authId],
          language: 'English',
          publicationYear: 1951
        },
        validActorId,
        validActorEmail
      );
      bookId = book.id;
      expect(book.title).toBe('Foundation');

      const copy = await libraryService.createBookCopy(
        tenantAId,
        bookId,
        { accessionNumber: 'ACC-001', shelfLocation: 'Rack A1' },
        validActorId,
        validActorEmail
      );
      copyId = copy.id;
      expect(copy.accessionNumber).toBe('ACC-001');
      expect(copy.status).toBe(BookCopyStatus.AVAILABLE);
    });

    test('should block duplicates and test tenant isolation', async () => {
      await expect(
        libraryService.createBookCopy(tenantAId, bookId, { accessionNumber: 'ACC-001' }, validActorId, validActorEmail)
      ).rejects.toThrow();

      const catB = await libraryService.createCategory(tenantBId, { name: 'Science Fiction' });
      expect(catB).toBeDefined();
    });

    test('should issue book loan successfully and enforce limits', async () => {
      const loan = await libraryService.issueBook(
        tenantAId,
        {
          bookCopyId: copyId,
          borrowerType: BorrowerType.STUDENT,
          studentId: studentAId
        },
        validActorId,
        validActorEmail
      );
      expect(loan.status).toBe(LoanStatus.ISSUED);

      const copy = await prisma.bookCopy.findUnique({ where: { id: copyId } });
      expect(copy?.status).toBe(BookCopyStatus.ISSUED);

      const copy2 = await libraryService.createBookCopy(
        tenantAId,
        bookId,
        { accessionNumber: 'ACC-002' },
        validActorId,
        validActorEmail
      );
      const loan2 = await libraryService.issueBook(
        tenantAId,
        { bookCopyId: copy2.id, borrowerType: BorrowerType.STUDENT, studentId: studentAId },
        validActorId,
        validActorEmail
      );
      expect(loan2).toBeDefined();

      const copy3 = await libraryService.createBookCopy(
        tenantAId,
        bookId,
        { accessionNumber: 'ACC-003' },
        validActorId,
        validActorEmail
      );
      await expect(
        libraryService.issueBook(
          tenantAId,
          { bookCopyId: copy3.id, borrowerType: BorrowerType.STUDENT, studentId: studentAId },
          validActorId,
          validActorEmail
        )
      ).rejects.toThrow('Borrowing limit exceeded');
    });

    test('should process return and calculate fine waiver', async () => {
      const loans = await libraryService.listStudentLoans(tenantAId, studentAId);
      const activeLoan = loans.find(l => l.status === LoanStatus.ISSUED);
      expect(activeLoan).toBeDefined();

      const res = await libraryService.returnBook(
        tenantAId,
        activeLoan!.id,
        { conditionStatus: BookCopyStatus.AVAILABLE },
        validActorId,
        validActorEmail
      );
      expect(res.loan.status).toBe(LoanStatus.RETURNED);

      const fine = await prisma.libraryFine.findFirst({ where: { tenantId: tenantAId, libraryLoanId: activeLoan!.id } });
      expect(fine).toBeNull();
    });
  });

  describe('Transport Service Tests', () => {
    let vehicleId: string;
    let routeId: string;
    let stopId: string;
    let tripId: string;

    test('should manage vehicles and driver profiles', async () => {
      const v = await transportService.createVehicle(
        tenantAId,
        { registrationNumber: 'DL-3C-AB-1234', vehicleType: VehicleType.BUS, seatingCapacity: 40 },
        validActorId,
        validActorEmail
      );
      vehicleId = v.id;
      expect(v.registrationNumber).toBe('DL-3C-AB-1234');

      const d = await transportService.createDriver(
        tenantAId,
        { fullName: 'Driver Dave', licenseNumber: 'DL-LIC-9999' },
        validActorId,
        validActorEmail
      );
      expect(d.fullName).toBe('Driver Dave');
    });

    test('should build routes, stops sequencing, and trips', async () => {
      const route = await transportService.createRoute(tenantAId, { name: 'Route 10 Morning' }, validActorId, validActorEmail);
      routeId = route.id;

      const stop = await transportService.createStop(tenantAId, { name: 'Main Gate Stop' }, validActorId, validActorEmail);
      stopId = stop.id;

      const seq = await transportService.addStopToRoute(
        tenantAId,
        { routeId, stopId, sequenceNumber: 1, plannedArrivalTime: '07:30' },
        validActorId,
        validActorEmail
      );
      expect(seq.sequenceNumber).toBe(1);

      const trip = await transportService.createTrip(
        tenantAId,
        { routeId, vehicleId, tripType: TripType.PICKUP, name: 'Morning Route 10 Trip' },
        validActorId,
        validActorEmail
      );
      tripId = trip.id;
      expect(trip.name).toBe('Morning Route 10 Trip');
    });

    test('should assign student and record boarding logs', async () => {
      const assign = await transportService.assignStudent(
        tenantAId,
        {
          academicYearId: academicYearAId,
          studentId: studentAId,
          studentEnrollmentId: enrollmentAId,
          pickupTripId: tripId,
          pickupStopId: stopId,
          effectiveFrom: new Date().toISOString()
        },
        validActorId,
        validActorEmail
      );
      expect(assign.status).toBe('ACTIVE');

      const record = await transportService.markAttendance(
        tenantAId,
        {
          tripId,
          studentId: studentAId,
          date: new Date().toISOString(),
          status: TransportAttendanceStatus.BOARDED
        },
        validActorId
      );
      expect(record.status).toBe(TransportAttendanceStatus.BOARDED);
    });
  });
});
