const studentRepository = require('./student.repository');
const { toStudentDTO, toStudentProfileDTO } = require('./student.dto');
const ApiError = require('../../utils/apiError.util');
const { paginate } = require('../../utils/pagination.util');
const { buildSearchQuery, buildSortQuery, buildFilterQuery } = require('../../utils/search.util');
const { parseImportData, generateExportCSV } = require('./helpers/import-export.helper');
const { buildCertificateTemplate } = require('./helpers/certificate.helper');

class StudentService {
  async getStudentList(queryParams) {
    const { page = 1, limit = 20, search, class: classFilter, status = 'active', sort } = queryParams;

    // Filter construction
    const filter = { isDeleted: false };
    if (status === 'alumni') {
      filter.status = 'alumni';
    } else if (status) {
      filter.status = status;
    }

    if (classFilter) {
      filter.class = classFilter;
    }

    const searchQuery = buildSearchQuery(search, ['firstName', 'lastName', 'admissionNo']);
    if (searchQuery) {
      Object.assign(filter, searchQuery);
    }

    const { skip, limit: parsedLimit } = paginate(page, limit);
    const sortQuery = buildSortQuery(sort || '-createdAt');

    const { students, total } = await studentRepository.findAll({
      filter,
      skip,
      limit: parsedLimit,
      sort: sortQuery
    });

    const studentDTOs = students.map((s) => toStudentDTO(s, s.parent));
    const paginationMeta = paginate(page, limit, total).meta;

    return { students: studentDTOs, pagination: paginationMeta };
  }

  async getStudentProfile(id) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw ApiError.notFound(`Student record with ID ${id} not found.`);
    }

    const parent = await studentRepository.findParentByStudentId(id);
    const medical = await studentRepository.findMedicalRecord(id);
    const documents = await studentRepository.findDocuments(id);

    return toStudentProfileDTO(student, parent, medical, documents);
  }

  async createAdmission(payload) {
    // Check if admission number exists
    const existing = await studentRepository.findByAdmissionNo(payload.admissionNumber || payload.admissionNo);
    if (existing) {
      throw ApiError.conflict(`Admission number ${payload.admissionNumber || payload.admissionNo} already exists.`);
    }

    const studentData = {
      admissionNo: payload.admissionNumber || payload.admissionNo || `ADM${Math.floor(1000 + Math.random() * 9000)}`,
      admissionDate: payload.admissionDate || new Date(),
      rollNo: payload.rollNumber || payload.rollNo || '101',
      firstName: payload.firstName,
      middleName: payload.middleName || '',
      lastName: payload.lastName,
      dob: payload.dob || '2011-01-01',
      gender: payload.gender || 'male',
      bloodGroup: payload.bloodGroup || 'O+',
      religion: payload.religion || '',
      nationality: payload.nationality || 'American',
      campus: payload.campus || 'Main Campus',
      academicYear: payload.academicYear || '2026-2027',
      class: payload.studentClass || payload.class || 'Grade 10',
      section: payload.section || 'A',
      house: payload.house || '',
      board: payload.board || 'CBSE',
      medium: payload.medium || 'English',
      phone: payload.phone || '',
      email: payload.email || '',
      address: payload.address || '',
      city: payload.city || '',
      state: payload.state || '',
      country: payload.country || 'USA',
      pinCode: payload.pinCode || '',
      status: 'active'
    };

    const student = await studentRepository.createStudent(studentData);

    // Save Parent Details
    const parentData = {
      studentId: student._id,
      fatherName: payload.fatherName || payload.parentName || '',
      motherName: payload.motherName || '',
      guardianName: payload.guardianName || '',
      occupation: payload.occupation || '',
      parentPhone: payload.parentPhone || payload.phone || '',
      parentEmail: payload.parentEmail || payload.email || '',
      emergencyName: payload.emergencyName || '',
      emergencyPhone: payload.emergencyPhone || '',
      emergencyRelation: payload.emergencyRelation || ''
    };

    const parent = await studentRepository.createParent(parentData);

    return toStudentDTO(student, parent);
  }

  async getNextAdmissionNumber() {
    const nextNo = `ADM${Math.floor(1000 + Math.random() * 9000)}`;
    return { admissionNo: nextNo };
  }

  async deleteStudent(id) {
    const student = await studentRepository.findById(id);
    if (!student) throw ApiError.notFound('Student not found.');
    await studentRepository.softDelete(id);
    return { message: `Student ${student.firstName} ${student.lastName} deleted successfully.` };
  }

  async bulkDelete(ids) {
    if (!ids || !ids.length) throw ApiError.badRequest('No student IDs provided for bulk delete.');
    await studentRepository.bulkSoftDelete(ids);
    return { message: `Successfully deleted ${ids.length} student records.` };
  }

  async bulkPromote(payload) {
    const { studentIds, targetClass, targetSection, academicYear } = payload;
    if (!studentIds || !studentIds.length) throw ApiError.badRequest('Please select students to promote.');
    await studentRepository.bulkPromote(studentIds, targetClass, targetSection, academicYear || '2026-2027');
    return { message: `Successfully promoted ${studentIds.length} students to ${targetClass}-${targetSection}.` };
  }

  async transferStudent(id, payload) {
    const student = await studentRepository.findById(id);
    if (!student) throw ApiError.notFound('Student not found.');
    const tcNumber = `TC-${Date.now().toString().slice(-6)}`;
    await studentRepository.markTransferred(id, payload.reason || 'School Transfer', tcNumber);
    return { message: `Student ${student.firstName} transferred successfully.`, tcNumber };
  }

  async generateCertificate(id, type) {
    const student = await studentRepository.findById(id);
    if (!student) throw ApiError.notFound('Student not found.');
    const parent = await studentRepository.findParentByStudentId(id);
    const studentDTO = toStudentDTO(student, parent);

    const certificateNo = `CERT-${Date.now().toString().slice(-6)}`;
    const template = buildCertificateTemplate(type, studentDTO, certificateNo);

    await studentRepository.logCertificate(id, type, certificateNo, template);

    return { certificate: template };
  }

  async generateIdCard(id) {
    const student = await studentRepository.findById(id);
    if (!student) throw ApiError.notFound('Student not found.');
    const parent = await studentRepository.findParentByStudentId(id);
    return {
      idCard: {
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        name: `${student.firstName} ${student.lastName}`,
        class: `${student.class} - ${student.section}`,
        bloodGroup: student.bloodGroup || 'O+',
        phone: student.phone || parent?.parentPhone || 'N/A',
        emergencyContact: parent?.emergencyPhone || '(555) 019-2834',
        validUntil: '2027-05-31'
      }
    };
  }

  async importStudents(rawText, fileType = 'csv') {
    const records = parseImportData(rawText, fileType);
    let importedCount = 0;

    for (const rec of records) {
      try {
        await this.createAdmission(rec);
        importedCount++;
      } catch (err) {
        // Skip duplicate records during bulk import
      }
    }

    return { importedCount, totalParsed: records.length };
  }

  async exportStudents(queryParams) {
    const { students } = await this.getStudentList({ ...queryParams, limit: 1000 });
    const csvData = generateExportCSV(students);
    return { csvData };
  }
}

module.exports = new StudentService();
