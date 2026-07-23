const Student = require('./models/student.model');
const Parent = require('./models/parent.model');
const MedicalRecord = require('./models/medical.model');
const StudentDocument = require('./models/document.model');
const StudentAttendance = require('./models/attendance.model');
const StudentPromotion = require('./models/promotion.model');
const StudentTransfer = require('./models/transfer.model');
const CertificateIssuance = require('./models/certificate.model');
const StudentAlumni = require('./models/alumni.model');

class StudentRepository {
  async findAll({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } }) {
    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch parent details for the student list
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
    return Student.findById(id).lean();
  }

  async findByAdmissionNo(admissionNo, tenantId = 'default_school') {
    return Student.findOne({ admissionNo, tenantId, isDeleted: false }).lean();
  }

  async createStudent(studentData) {
    const student = new Student(studentData);
    return student.save();
  }

  async createParent(parentData) {
    const parent = new Parent(parentData);
    return parent.save();
  }

  async findParentByStudentId(studentId) {
    return Parent.findOne({ studentId }).lean();
  }

  async updateStudent(id, updateData) {
    return Student.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();
  }

  async updateParent(studentId, updateData) {
    return Parent.findOneAndUpdate({ studentId }, { $set: updateData }, { new: true, upsert: true }).lean();
  }

  async softDelete(id) {
    return Student.findByIdAndUpdate(id, { isDeleted: true, status: 'inactive' }, { new: true });
  }

  async bulkSoftDelete(ids) {
    return Student.updateMany({ _id: { $in: ids } }, { $set: { isDeleted: true, status: 'inactive' } });
  }

  async bulkPromote(ids, targetClass, targetSection, academicYear) {
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
    await Student.findByIdAndUpdate(studentId, { status: 'transferred', isDeleted: false });
    return StudentTransfer.create({ studentId, reason, tcNumber });
  }

  async findMedicalRecord(studentId) {
    return MedicalRecord.findOne({ studentId }).lean();
  }

  async upsertMedicalRecord(studentId, medicalData) {
    return MedicalRecord.findOneAndUpdate(
      { studentId },
      { $set: { studentId, ...medicalData } },
      { new: true, upsert: true }
    ).lean();
  }

  async findDocuments(studentId) {
    return StudentDocument.find({ studentId }).sort({ createdAt: -1 }).lean();
  }

  async createDocument(docData) {
    return StudentDocument.create(docData);
  }

  async deleteDocument(docId) {
    return StudentDocument.findByIdAndDelete(docId);
  }

  async logCertificate(studentId, certificateType, certificateNo, metadata = {}) {
    return CertificateIssuance.create({
      studentId,
      certificateType,
      certificateNo,
      metadata
    });
  }

  async findAlumni() {
    return Student.find({ status: 'alumni' }).lean();
  }
}

module.exports = new StudentRepository();
