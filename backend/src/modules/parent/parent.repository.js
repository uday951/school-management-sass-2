const mongoose = require('mongoose');
const Parent = require('./parent.model');
const Guardian = require('./models/guardian.model');
const ParentDocument = require('./models/parent-document.model');
const ParentStudentMapping = require('./models/parent-student-mapping.model');
const ParentCommunication = require('./models/parent-communication.model');
const Student = require('../student/models/student.model');

// Empty fallback arrays for offline mode
const MOCK_PARENTS = [];
const MOCK_MAPPINGS = [];
const MOCK_GUARDIANS = [];
const MOCK_DOCUMENTS = [];
const MOCK_COMMCOMMUNICATIONS = [];

class ParentRepository {
  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  async findAll({ search = '', status = '', page = 1, limit = 10 }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    if (!this.isDbConnected()) {
      let filtered = MOCK_PARENTS.filter((p) => !p.isDeleted);
      if (status) {
        filtered = filtered.filter((p) => p.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.phone.toLowerCase().includes(q)
        );
      }
      const total = filtered.length;
      const parents = filtered.slice(skip, skip + limitNum);
      return { parents, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 };
    }

    const query = { isDeleted: false };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Parent.countDocuments(query);
    const parents = await Parent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean();

    return {
      parents,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  async findById(id) {
    if (!this.isDbConnected()) {
      const found = MOCK_PARENTS.find((p) => p._id === id || p.id === id);
      return found || null;
    }
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Parent.findOne({ _id: id, isDeleted: false }).lean();
  }

  async createParent(data) {
    if (!this.isDbConnected()) {
      const id = new mongoose.Types.ObjectId().toString();
      const newParent = {
        _id: id,
        id,
        name: data.name,
        relationship: data.relationship || 'Father',
        email: data.email || '',
        phone: data.phone,
        altPhone: data.altPhone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'USA',
        occupation: data.occupation || '',
        avatarUrl: data.avatarUrl || '',
        status: data.status || 'active',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      MOCK_PARENTS.unshift(newParent);

      // If guardian details provided in payload, add mock guardian
      if (data.guardianName) {
        MOCK_GUARDIANS.push({
          _id: new mongoose.Types.ObjectId().toString(),
          parentId: id,
          guardianName: data.guardianName,
          relationship: data.guardianRelation || 'Guardian',
          phone: data.guardianPhone || data.phone,
          email: data.guardianEmail || '',
          address: data.address || '',
          isEmergencyContact: true,
          emergencyPhone: data.emergencyPhone || data.phone,
          emergencyRelation: data.emergencyRelation || 'Guardian'
        });
      }
      return newParent;
    }

    const parent = new Parent(data);
    const saved = await parent.save();

    // Create default guardian/emergency record if provided
    if (data.guardianName) {
      await Guardian.create({
        parentId: saved._id,
        guardianName: data.guardianName,
        relationship: data.guardianRelation || 'Guardian',
        phone: data.guardianPhone || data.phone,
        email: data.guardianEmail || '',
        address: data.address || '',
        isEmergencyContact: true,
        emergencyPhone: data.emergencyPhone || data.phone,
        emergencyRelation: data.emergencyRelation || 'Guardian'
      });
    }

    return saved.toObject();
  }

  async updateParent(id, data) {
    if (!this.isDbConnected()) {
      const index = MOCK_PARENTS.findIndex((p) => p._id === id || p.id === id);
      if (index === -1) return null;
      MOCK_PARENTS[index] = { ...MOCK_PARENTS[index], ...data, updatedAt: new Date() };
      return MOCK_PARENTS[index];
    }
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Parent.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: data }, { new: true, runValidators: true }).lean();
  }

  async softDelete(id) {
    if (!this.isDbConnected()) {
      const index = MOCK_PARENTS.findIndex((p) => p._id === id || p.id === id);
      if (index !== -1) {
        MOCK_PARENTS[index].isDeleted = true;
        MOCK_PARENTS[index].status = 'inactive';
      }
      return { message: 'Parent deleted successfully.' };
    }
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Parent.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true, status: 'inactive' } }, { new: true });
  }

  // --- Guardians ---
  async getGuardians(parentId) {
    if (!this.isDbConnected()) {
      return MOCK_GUARDIANS.filter((g) => g.parentId === parentId);
    }
    return Guardian.find({ parentId }).sort({ createdAt: -1 }).lean();
  }

  async addGuardian(parentId, guardianData) {
    if (!this.isDbConnected()) {
      const newG = {
        _id: new mongoose.Types.ObjectId().toString(),
        parentId,
        ...guardianData
      };
      MOCK_GUARDIANS.push(newG);
      return newG;
    }
    return Guardian.create({ parentId, ...guardianData });
  }

  // --- Student Linking ---
  async getLinkedStudents(parentId) {
    if (!this.isDbConnected()) {
      const mappings = MOCK_MAPPINGS.filter((m) => m.parentId === parentId);
      return mappings.map((m) => ({
        _id: m._id,
        relationship: m.relationship,
        isPrimary: m.isPrimary,
        student: {
          _id: m.studentId,
          admissionNo: 'ADM001',
          rollNo: '101',
          name: 'Alex Rivera',
          firstName: 'Alex',
          lastName: 'Rivera',
          class: 'Grade 10',
          section: 'A',
          gender: 'male',
          status: 'active'
        }
      }));
    }

    const mappings = await ParentStudentMapping.find({ parentId }).populate('studentId').lean();
    return mappings.map((m) => ({
      _id: m._id,
      relationship: m.relationship,
      isPrimary: m.isPrimary,
      student: m.studentId
    }));
  }

  async findMapping(parentId, studentId) {
    if (!this.isDbConnected()) {
      return MOCK_MAPPINGS.find((m) => m.parentId === parentId && m.studentId === studentId) || null;
    }
    return ParentStudentMapping.findOne({ parentId, studentId }).lean();
  }

  async linkStudent(parentId, studentId, relationship = 'Parent', isPrimary = true) {
    if (!this.isDbConnected()) {
      const existing = MOCK_MAPPINGS.find((m) => m.parentId === parentId && m.studentId === studentId);
      if (existing) throw new Error('Student is already linked to this parent.');

      const newMapping = {
        _id: new mongoose.Types.ObjectId().toString(),
        parentId,
        studentId,
        relationship,
        isPrimary
      };
      MOCK_MAPPINGS.push(newMapping);
      return newMapping;
    }

    const existing = await ParentStudentMapping.findOne({ parentId, studentId });
    if (existing) {
      throw new Error('Student is already linked to this parent.');
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Referenced student does not exist.');
    }

    return ParentStudentMapping.create({ parentId, studentId, relationship, isPrimary });
  }

  async unlinkStudent(parentId, studentId) {
    if (!this.isDbConnected()) {
      const index = MOCK_MAPPINGS.findIndex((m) => m.parentId === parentId && m.studentId === studentId);
      if (index !== -1) MOCK_MAPPINGS.splice(index, 1);
      return { message: 'Student unlinked successfully.' };
    }
    return ParentStudentMapping.findOneAndDelete({ parentId, studentId });
  }

  // --- Documents ---
  async getDocuments(parentId) {
    if (!this.isDbConnected()) {
      return MOCK_DOCUMENTS.filter((d) => d.parentId === parentId);
    }
    return ParentDocument.find({ parentId }).sort({ createdAt: -1 }).lean();
  }

  async addDocument(parentId, docData) {
    if (!this.isDbConnected()) {
      const newDoc = {
        _id: new mongoose.Types.ObjectId().toString(),
        parentId,
        ...docData,
        uploadedDate: new Date(),
        status: 'active'
      };
      MOCK_DOCUMENTS.push(newDoc);
      return newDoc;
    }
    return ParentDocument.create({ parentId, ...docData });
  }

  async deleteDocument(docId) {
    if (!this.isDbConnected()) {
      const index = MOCK_DOCUMENTS.findIndex((d) => d._id === docId);
      if (index !== -1) MOCK_DOCUMENTS.splice(index, 1);
      return { message: 'Document deleted successfully.' };
    }
    return ParentDocument.findByIdAndDelete(docId);
  }

  // --- Communications ---
  async getCommunications(parentId) {
    if (!this.isDbConnected()) {
      return MOCK_COMMCOMMUNICATIONS.filter((c) => c.parentId === parentId);
    }
    return ParentCommunication.find({ parentId }).sort({ sentAt: -1 }).lean();
  }

  async addCommunication(parentId, commData) {
    if (!this.isDbConnected()) {
      const newC = {
        _id: new mongoose.Types.ObjectId().toString(),
        parentId,
        ...commData,
        sentAt: new Date()
      };
      MOCK_COMMCOMMUNICATIONS.unshift(newC);
      return newC;
    }
    return ParentCommunication.create({ parentId, ...commData });
  }

  // --- Parent Portal Query Services ---
  async getDashboardData(parentId, studentId) {
    let student = null;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId).lean();
    }
    if (!student && this.isDbConnected()) {
      student = await Student.findOne({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    }

    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Alexander Wright';
    const className = student?.class || 'Grade 10';
    const sectionName = student?.section || 'A';
    const rollNo = student?.rollNo || '101';
    const admissionNo = student?.admissionNo || 'ADM-2026-001';

    return {
      childOverview: {
        _id: student?._id || 'std_01',
        name: studentName,
        admissionNo,
        class: className,
        section: sectionName,
        rollNo,
        gender: student?.gender || 'Male',
        dob: student?.dob || '2012-05-14',
        avatarUrl: student?.avatarUrl || ''
      },
      attendancePercentage: 94,
      pendingHomework: 3,
      upcomingExams: 2,
      feeDue: 450,
      notifications: [
        { id: 'n1', title: 'Parent-Teacher Meeting', date: '2026-08-05', type: 'Event' },
        { id: 'n2', title: 'Mid-Term Exam Schedule Released', date: '2026-08-01', type: 'Academic' }
      ]
    };
  }

  async getChildren(parentId) {
    if (parentId && mongoose.Types.ObjectId.isValid(parentId) && this.isDbConnected()) {
      const mappings = await ParentStudentMapping.find({ parentId }).populate('studentId').lean();
      if (mappings.length > 0) {
        return mappings.map((m) => m.studentId || m.student).filter(Boolean);
      }
    }
    if (this.isDbConnected()) {
      const students = await Student.find({ isDeleted: false }).limit(5).lean();
      if (students.length > 0) return students;
    }
    return [
      {
        _id: 'std_01',
        name: 'Alexander Wright',
        firstName: 'Alexander',
        lastName: 'Wright',
        admissionNo: 'ADM-2026-001',
        class: 'Grade 10',
        section: 'A',
        rollNo: '101'
      }
    ];
  }

  async getChildProfile(childId) {
    let student = null;
    if (childId && mongoose.Types.ObjectId.isValid(childId) && this.isDbConnected()) {
      student = await Student.findById(childId).lean();
    }
    if (!student && this.isDbConnected()) {
      student = await Student.findOne({ isDeleted: false }).lean();
    }

    if (!student) {
      student = {
        _id: 'std_01',
        firstName: 'Alexander',
        lastName: 'Wright',
        admissionNo: 'ADM-2026-001',
        rollNo: '101',
        class: 'Grade 10',
        section: 'A',
        gender: 'Male',
        dob: '2012-05-14',
        bloodGroup: 'O+',
        address: '124 School Street, Cityville'
      };
    }

    return {
      personalDetails: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        gender: student.gender,
        dob: student.dob,
        bloodGroup: student.bloodGroup || 'O+',
        address: student.address || '124 School Street'
      },
      academicDetails: {
        class: student.class || 'Grade 10',
        section: student.section || 'A',
        rollNo: student.rollNo || '101',
        admissionDate: student.admissionDate || '2024-09-01'
      },
      teacherDetails: {
        name: 'Dr. Sarah Connor',
        email: 'sarah.connor@schoolerp.edu',
        phone: '+1-555-0144',
        subject: 'Class Teacher'
      },
      medicalInfo: {
        allergies: 'None',
        conditions: 'Good Health',
        doctorName: 'Dr. Robert Bruce',
        doctorPhone: '+1-555-9988'
      },
      emergencyContact: {
        name: 'Parent / Guardian',
        relationship: 'Primary Guardian',
        phone: '+1-555-0199',
        email: 'parent@example.com'
      },
      academicOverview: {
        gpa: '3.8 / 4.0',
        grade: 'A',
        performanceSummary: 'Excellent performance in Science and Mathematics. Regular attendance and active participation.'
      }
    };
  }

  async getAttendanceSummary(childId) {
    return {
      workingDays: 40,
      presentDays: 37,
      absentDays: 2,
      lateDays: 1,
      rate: 92.5,
      monthlyLogs: [
        { month: 'January', present: 20, absent: 1, rate: 95 },
        { month: 'February', present: 17, absent: 1, rate: 94 }
      ]
    };
  }

  async getTimetable(childId) {
    return {
      className: 'Grade 10-A',
      schedule: [
        { day: 'Monday', period: '1', time: '08:30 - 09:15', subject: 'Mathematics', teacher: 'Mr. Smith', room: '101' },
        { day: 'Monday', period: '2', time: '09:15 - 10:00', subject: 'Physics', teacher: 'Dr. Connor', room: 'Lab 2' },
        { day: 'Tuesday', period: '1', time: '08:30 - 09:15', subject: 'English', teacher: 'Mrs. Davis', room: '101' },
        { day: 'Wednesday', period: '1', time: '08:30 - 09:15', subject: 'Chemistry', teacher: 'Dr. Bruce', room: 'Lab 1' }
      ]
    };
  }

  async getCalendar() {
    return {
      academicYear: '2026-2027',
      events: [
        { id: '1', title: 'Independence Day Holiday', date: '2026-08-15', type: 'Holiday' },
        { id: '2', title: 'Parent-Teacher Conference', date: '2026-08-20', type: 'Meeting' },
        { id: '3', title: 'Mid-Term Examinations', date: '2026-09-10', type: 'Exam' }
      ]
    };
  }
}

module.exports = new ParentRepository();
