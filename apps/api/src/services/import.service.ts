import { prisma } from '../prisma';
import { auditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import { ImportJobStatus, ImportRowValidationStatus, ImportRowImportStatus, StudentStatus, EnrollmentStatus } from '@prisma/client';
import { studentService } from './student.service';

export interface ImportRowData {
  admissionNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  admissionDate: string;
  academicYear: string;
  class: string;
  section: string;
  rollNumber?: string;
  studentEmail?: string;
  studentPhone?: string;
  guardianFirstName?: string;
  guardianLastName?: string;
  guardianRelationship?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
}

export const importService = {
  parseCSV: (content: string): string[][] => {
    const lines: string[][] = [];
    const rawLines = content.split(/\r?\n/);
    for (const line of rawLines) {
      if (!line.trim()) continue;
      const row: string[] = [];
      let inQuotes = false;
      let currentVal = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal.trim().replace(/^"|"$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim().replace(/^"|"$/g, ''));
      lines.push(row);
    }
    return lines;
  },

  createImportJob: async (
    tenantId: string,
    schoolId: string,
    fileName: string,
    csvContent: string,
    userId: string,
    email: string
  ) => {
    // A. Parse lines
    const parsed = importService.parseCSV(csvContent);
    if (parsed.length < 2) {
      throw new AppError(400, 'Import file is empty or missing headers');
    }

    const headers = parsed[0].map(h => h.trim());
    const expectedHeaders = [
      'admissionNumber', 'firstName', 'middleName', 'lastName', 'dateOfBirth', 'gender',
      'admissionDate', 'academicYear', 'class', 'section', 'rollNumber', 'studentEmail', 'studentPhone',
      'guardianFirstName', 'guardianLastName', 'guardianRelationship', 'guardianPhone', 'guardianEmail',
      'addressLine1', 'addressLine2', 'city', 'state', 'country', 'postalCode'
    ];

    // Check if headers match
    const missing = expectedHeaders.filter(h => !headers.includes(h));
    if (missing.length > 0 && !headers.includes('admissionNumber')) {
      throw new AppError(400, `CSV headers mismatch. Missing required headers: ${missing.join(', ')}`);
    }

    // B. Create Job
    const job = await prisma.importJob.create({
      data: {
        tenantId,
        schoolId,
        fileName,
        status: ImportJobStatus.UPLOADED,
        createdByUserId: userId,
        totalRows: parsed.length - 1,
      }
    });

    // C. Stage rows
    const rowPromises = [];
    for (let i = 1; i < parsed.length; i++) {
      const line = parsed[i];
      const rowData: any = {};
      headers.forEach((h, idx) => {
        if (line[idx] !== undefined) {
          rowData[h] = line[idx];
        }
      });

      rowPromises.push(
        prisma.importRow.create({
          data: {
            tenantId,
            importJobId: job.id,
            rowNumber: i,
            rawData: rowData,
            validationStatus: ImportRowValidationStatus.VALID,
            importStatus: ImportRowImportStatus.PENDING,
          }
        })
      );
    }

    await Promise.all(rowPromises);

    await auditService.log({
      actorUserId: userId,
      actorEmail: email,
      tenantId,
      schoolId,
      action: 'IMPORT_UPLOADED',
      entityType: 'ImportJob',
      entityId: job.id,
      newValues: { fileName, totalRows: job.totalRows }
    });

    return job;
  },

  validateImportJob: async (tenantId: string, schoolId: string, jobId: string) => {
    const job = await prisma.importJob.findFirst({
      where: { id: jobId, tenantId, schoolId }
    });
    if (!job) throw new AppError(404, 'Import job not found');

    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: ImportJobStatus.VALIDATING }
    });

    const rows = await prisma.importRow.findMany({
      where: { importJobId: jobId }
    });

    let validCount = 0;
    let invalidCount = 0;
    const admissionNumberInFile = new Set<string>();

    for (const row of rows) {
      const data = row.rawData as any as ImportRowData;
      const errors: string[] = [];
      const warnings: string[] = [];

      // 1. Required field validations
      if (!data.admissionNumber) errors.push('admissionNumber is required');
      if (!data.firstName) errors.push('firstName is required');
      if (!data.lastName) errors.push('lastName is required');
      if (!data.dateOfBirth) errors.push('dateOfBirth is required');
      if (!data.gender) errors.push('gender is required');
      if (!data.admissionDate) errors.push('admissionDate is required');
      if (!data.academicYear) errors.push('academicYear is required');
      if (!data.class) errors.push('class is required');
      if (!data.section) errors.push('section is required');
      if (!data.addressLine1) errors.push('addressLine1 is required');
      if (!data.city) errors.push('city is required');
      if (!data.state) errors.push('state is required');
      if (!data.postalCode) errors.push('postalCode is required');

      // 2. Validate dates
      if (data.dateOfBirth && isNaN(Date.parse(data.dateOfBirth))) {
        errors.push('dateOfBirth must be a valid date');
      }
      if (data.admissionDate && isNaN(Date.parse(data.admissionDate))) {
        errors.push('admissionDate must be a valid date');
      }

      // 3. Duplicate checks in file
      if (data.admissionNumber) {
        if (admissionNumberInFile.has(data.admissionNumber)) {
          errors.push(`Duplicate admissionNumber '${data.admissionNumber}' within the file`);
        } else {
          admissionNumberInFile.add(data.admissionNumber);
        }
      }

      // 4. Duplicate checks in database
      if (data.admissionNumber) {
        const dbDuplicate = await prisma.student.findFirst({
          where: { tenantId, schoolId, admissionNumber: data.admissionNumber }
        });
        if (dbDuplicate) {
          errors.push(`Admission number '${data.admissionNumber}' already exists in database`);
        }
      }

      // 5. Database entity resolutions (Year, Class, Section)
      let academicYearId = '';
      let gradeLevelId = '';
      let sectionId = '';

      if (data.academicYear) {
        const year = await prisma.academicYear.findFirst({
          where: { tenantId, schoolId, name: data.academicYear, status: { not: 'ARCHIVED' } }
        });
        if (!year) {
          errors.push(`Academic Year '${data.academicYear}' does not exist or is archived`);
        } else {
          academicYearId = year.id;
        }
      }

      if (data.class) {
        const grade = await prisma.gradeLevel.findFirst({
          where: { tenantId, schoolId, OR: [{ name: data.class }, { code: data.class }], status: { not: 'ARCHIVED' } }
        });
        if (!grade) {
          errors.push(`Class '${data.class}' does not exist or is archived`);
        } else {
          gradeLevelId = grade.id;
        }
      }

      if (gradeLevelId && data.section) {
        const sec = await prisma.section.findFirst({
          where: { tenantId, schoolId, gradeLevelId, name: data.section, status: { not: 'ARCHIVED' } }
        });
        if (!sec) {
          errors.push(`Section '${data.section}' does not exist in class '${data.class}' or is archived`);
        } else {
          sectionId = sec.id;
        }
      }

      // 6. Check duplicate roll numbers inside section
      if (academicYearId && gradeLevelId && sectionId && data.rollNumber) {
        const dbRoll = await prisma.studentEnrollment.findFirst({
          where: {
            tenantId,
            schoolId,
            academicYearId,
            gradeLevelId,
            sectionId,
            rollNumber: data.rollNumber,
            status: 'ACTIVE'
          }
        });
        if (dbRoll) {
          errors.push(`Roll number '${data.rollNumber}' already exists in section '${data.section}'`);
        }
      }

      // 7. Check email/phone formats if provided
      if (data.studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.studentEmail)) {
        errors.push('studentEmail format is invalid');
      }
      if (data.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guardianEmail)) {
        errors.push('guardianEmail format is invalid');
      }

      const isRowValid = errors.length === 0;
      if (isRowValid) validCount++;
      else invalidCount++;

      const normalized = isRowValid ? {
        ...data,
        resolved: {
          academicYearId,
          gradeLevelId,
          sectionId
        }
      } : null;

      await prisma.importRow.update({
        where: { id: row.id },
        data: {
          validationStatus: isRowValid ? ImportRowValidationStatus.VALID : ImportRowValidationStatus.INVALID,
          errors: errors.length > 0 ? errors : null,
          warnings: warnings.length > 0 ? warnings : null,
          normalizedData: normalized as any,
        }
      });
    }

    const updatedJob = await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: ImportJobStatus.READY,
        validRows: validCount,
        invalidRows: invalidCount,
      }
    });

    return updatedJob;
  },

  executeImport: async (
    tenantId: string,
    schoolId: string,
    jobId: string,
    actorUserId: string,
    actorEmail: string,
    duplicateStrategy: 'SKIP' | 'ERROR' = 'SKIP'
  ) => {
    const job = await prisma.importJob.findFirst({
      where: { id: jobId, tenantId, schoolId }
    });
    if (!job) throw new AppError(404, 'Import job not found');
    if (job.status !== ImportJobStatus.READY) {
      throw new AppError(400, 'Import job must be validated and in READY state to execute');
    }

    await prisma.importJob.update({
      where: { id: jobId },
      data: { status: ImportJobStatus.IMPORTING, startedAt: new Date() }
    });

    const rows = await prisma.importRow.findMany({
      where: { importJobId: jobId, validationStatus: ImportRowValidationStatus.VALID }
    });

    let importedCount = 0;
    let failedCount = 0;

    for (const row of rows) {
      const norm = row.normalizedData as any;
      if (!norm || !norm.resolved) continue;

      try {
        // Double check database duplicate prior to transaction execution (Idempotent safety check)
        const dbDuplicate = await prisma.student.findFirst({
          where: { tenantId, schoolId, admissionNumber: norm.admissionNumber }
        });
        if (dbDuplicate) {
          if (duplicateStrategy === 'ERROR') {
            throw new Error(`Duplicate admissionNumber '${norm.admissionNumber}' detected in database`);
          } else {
            // SKIP strategy
            await prisma.importRow.update({
              where: { id: row.id },
              data: {
                importStatus: ImportRowImportStatus.PENDING,
                errors: ['Skipped due to duplicate admission number']
              }
            });
            failedCount++;
            continue;
          }
        }

        // Map guardians
        const guardiansList = [];
        if (norm.guardianFirstName && norm.guardianLastName) {
          // Attempt match by phone or email
          let existingGuardian = null;
          if (norm.guardianEmail) {
            existingGuardian = await prisma.guardian.findFirst({
              where: { tenantId, schoolId, email: norm.guardianEmail }
            });
          }
          if (!existingGuardian && norm.guardianPhone) {
            existingGuardian = await prisma.guardian.findFirst({
              where: { tenantId, schoolId, phone: norm.guardianPhone }
            });
          }

          guardiansList.push({
            guardianId: existingGuardian ? existingGuardian.id : undefined,
            firstName: norm.guardianFirstName,
            lastName: norm.guardianLastName,
            relationship: norm.guardianRelationship || 'FATHER',
            phone: norm.guardianPhone || '',
            email: norm.guardianEmail || '',
            isPrimary: true,
            isEmergencyContact: true,
            isAuthorizedPickup: true,
            receivesAcademicUpdates: true,
            receivesAttendanceUpdates: true,
            receivesFeeUpdates: true,
            hasPortalAccess: false
          });
        }

        // Create student using existing atomic service
        const { student } = await studentService.createStudent(
          tenantId,
          schoolId,
          {
            firstName: norm.firstName,
            middleName: norm.middleName || '',
            lastName: norm.lastName,
            dateOfBirth: new Date(norm.dateOfBirth).toISOString(),
            gender: norm.gender,
            personalEmail: norm.studentEmail || '',
            personalPhone: norm.studentPhone || '',
            admissionNumber: norm.admissionNumber,
            admissionDate: new Date(norm.admissionDate).toISOString(),
            currentAddressLine1: norm.addressLine1,
            currentAddressLine2: norm.addressLine2 || '',
            currentCity: norm.city,
            currentState: norm.state,
            currentCountry: norm.country || 'India',
            currentPostalCode: norm.postalCode,
            sameAsCurrentAddress: true,
            enrollment: {
              academicYearId: norm.resolved.academicYearId,
              gradeLevelId: norm.resolved.gradeLevelId,
              sectionId: norm.resolved.sectionId,
              rollNumber: norm.rollNumber || undefined
            },
            guardians: guardiansList
          },
          actorUserId,
          actorEmail
        );

        // Fetch guardian relations created
        const studGuardians = await prisma.studentGuardian.findMany({
          where: { studentId: student.id }
        });

        await prisma.importRow.update({
          where: { id: row.id },
          data: {
            importStatus: ImportRowImportStatus.IMPORTED,
            createdStudentId: student.id,
            createdGuardianId: studGuardians.length > 0 ? studGuardians[0].guardianId : null
          }
        });

        importedCount++;
      } catch (err: any) {
        await prisma.importRow.update({
          where: { id: row.id },
          data: {
            importStatus: ImportRowImportStatus.FAILED,
            errors: [err.message || 'Row import execution failed']
          }
        });
        failedCount++;
      }
    }

    const finalStatus = failedCount > 0 
      ? ImportJobStatus.COMPLETED_WITH_ERRORS 
      : ImportJobStatus.COMPLETED;

    const finalJob = await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        importedRows: importedCount,
        failedRows: failedCount,
        completedAt: new Date()
      }
    });

    await auditService.log({
      actorUserId,
      actorEmail,
      tenantId,
      schoolId,
      action: 'IMPORT_EXECUTED',
      entityType: 'ImportJob',
      entityId: jobId,
      newValues: { status: finalStatus, importedRows: importedCount, failedRows: failedCount }
    });

    return finalJob;
  }
};
