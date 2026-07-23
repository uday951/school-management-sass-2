const mongoose = require('mongoose');
const Student = require('./models/student.model');
const Parent = require('./models/parent.model');
const MedicalRecord = require('./models/medical.model');
const StudentDocument = require('./models/document.model');
const StudentAttendance = require('./models/attendance.model');
const StudentPromotion = require('./models/promotion.model');
const StudentTransfer = require('./models/transfer.model');
const CertificateIssuance = require('./models/certificate.model');
const StudentAlumni = require('./models/alumni.model');

// Mock fallback records for testing/offline mode when MongoDB is not connected
const MOCK_STUDENTS = [
  { _id: '60d01b123432ab34523912a1', admissionNo: 'ADM001', rollNo: '101', firstName: 'Alex', lastName: 'Rivera', class: 'Grade 10', section: 'A', status: 'active', gender: 'male', phone: '(555) 019-2834', createdAt: new Date() },
  { _id: '60d01b123432ab34523912a2', admissionNo: 'ADM002', rollNo: '102', firstName: 'Chloe', lastName: 'Chen', class: 'Grade 10', section: 'A', status: 'active', gender: 'female', phone: '(555) 012-8374', createdAt: new Date() }
];

class StudentRepository {
  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  async findAll({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } }) {
    if (!this.isDbConnected()) {
      return { students: MOCK_STUDENTS, total: MOCK_STUDENTS.length };
    }

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const studentIds = students.map((s) => s._id);
    const parents = await Parent.find({ studentId: { $in: studentIds } }).lean();
    const parentMap = new Map(parents.map((p) => [p.studentId.toString(), p]));

    const enrichedStudents = students.map((s) => ({
      ...s,
      parent: parentMap.get(s._id.toString()) || null
    }));

    return { students: enrichedStudents, total };
  }

  async findById(id) {
    if (!this.isDbConnected()) {
      const found = MOCK_STUDENTS.find(s => s._id === id || s.id === id);
      return found || MOCK_STUDENTS[0];
    }
    return Student.findById(id).lean();
  }

  async findByAdmissionNo(admissionNo, tenantId = 'default_school') {
    if (!this.isDbConnected()) return null;
    return Student.findOne({ admissionNo, tenantId, isDeleted: false }).lean();
  }

  async createStudent(studentData) {
    if (!this.isDbConnected()) {
      const mockNew = { _id: new mongoose.Types.ObjectId().toString(), ...studentData };
      MOCK_STUDENTS.push(mockNew);
      return mockNew;
    }
    const student = new Student(studentData);
    return student.save();
  }

  async createParent(parentData) {
    if (!this.isDbConnected()) return parentData;
    const parent = new Parent(parentData);
    return parent.save();
  }

  async findParentByStudentId(studentId) {
    if (!this.isDbConnected()) {
      return { fatherName: 'Carlos Rivera', parentPhone: '(555) 012-3847', parentEmail: 'carlos@rivera.com' };
    }
    return Parent.findOne({ studentId }).lean();
  }

  async updateStudent(id, updateData) {
    if (!this.isDbConnected()) return { _id: id, ...updateData };
    return Student.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();
  }

  async updateParent(studentId, updateData) {
    if (!this.isDbConnected()) return updateData;
    return Parent.findOneAndUpdate({ studentId }, { $set: updateData }, { new: true, upsert: true }).lean();
  }

  async softDelete(id) {
    if (!this.isDbConnected()) return { message: 'Deleted' };
    return Student.findByIdAndUpdate(id, { isDeleted: true, status: 'inactive' }, { new: true });
  }

  async bulkSoftDelete(ids) {
    if (!this.isDbConnected()) return { modifiedCount: ids.length };
    return Student.updateMany({ _id: { $in: ids } }, { $set: { isDeleted: true, status: 'inactive' } });
  }

  async bulkPromote(ids, targetClass, targetSection, academicYear) {
    if (!this.isDbConnected()) return { modifiedCount: ids.length };
    await Student.updateMany(
      { _id: { $in: ids } },
      { $set: { class: targetClass, section: targetSection, academicYear } }
    );

    const promotionLogs = ids.map((studentId) => ({
      studentId,
      targetClass,
      targetSection,
      academicYear
    }));

    return StudentPromotion.insertMany(promotionLogs);
  }

  async markTransferred(studentId, reason, tcNumber) {
    if (!this.isDbConnected()) return { tcNumber };
    await Student.findByIdAndUpdate(studentId, { status: 'transferred', isDeleted: false });
    return StudentTransfer.create({ studentId, reason, tcNumber });
  }

  async findMedicalRecord(studentId) {
    if (!this.isDbConnected()) return null;
    return MedicalRecord.findOne({ studentId }).lean();
  }

  async upsertMedicalRecord(studentId, medicalData) {
    if (!this.isDbConnected()) return medicalData;
    return MedicalRecord.findOneAndUpdate(
      { studentId },
      { $set: { studentId, ...medicalData } },
      { new: true, upsert: true }
    ).lean();
  }

  async findDocuments(studentId) {
    if (!this.isDbConnected()) return [];
    return StudentDocument.find({ studentId }).sort({ createdAt: -1 }).lean();
  }

  async createDocument(docData) {
    if (!this.isDbConnected()) return docData;
    return StudentDocument.create(docData);
  }

  async deleteDocument(docId) {
    if (!this.isDbConnected()) return { message: 'Deleted' };
    return StudentDocument.findByIdAndDelete(docId);
  }

  async logCertificate(studentId, certificateType, certificateNo, metadata = {}) {
    if (!this.isDbConnected()) return { certificateNo };
    return CertificateIssuance.create({
      studentId,
      certificateType,
      certificateNo,
      metadata
    });
  }

  async findAlumni() {
    if (!this.isDbConnected()) return MOCK_STUDENTS;
    return Student.find({ status: 'alumni' }).lean();
  }
}

module.exports = new StudentRepository();
