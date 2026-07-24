const StudentAttendance = require('./models/student-attendance.model');
const TeacherAttendance = require('./models/teacher-attendance.model');
const Holiday = require('./models/holiday.model');
const AttendanceSummary = require('./models/attendance-summary.model');
const LeaveRequest = require('./models/leave-request.model');
const Student = require('../student/models/student.model');
const mongoose = require('mongoose');

// Mock fallback lists when DB is disconnected
const MOCK_LEAVES = [
  { _id: '60d01b123432ab34523912b1', applicantId: '60d01b123432ab34523912a1', applicantName: 'Alex Rivera', type: 'student', leaveType: 'sick', startDate: new Date(), endDate: new Date(), reason: 'Fever', status: 'pending' },
  { _id: '60d01b123432ab34523912b2', applicantId: 'T001', applicantName: 'Diana Prince', type: 'teacher', leaveType: 'casual', startDate: new Date(), endDate: new Date(), reason: 'Family trip', status: 'pending' }
];

const MOCK_TEACHERS = [
  { id: 'T001', name: 'Diana Prince', department: 'Mathematics', email: 'diana@metropolitan.edu', phone: '(555) 012-3498' },
  { id: 'T002', name: 'Clark Kent', department: 'Science', email: 'clark@metropolitan.edu', phone: '(555) 012-9843' }
];

class AttendanceRepository {
  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  // ─── Student Attendance ───────────────────────────────────────────────────
  async findStudentAttendance(filter = {}) {
    if (!this.isDbConnected()) return [];
    return StudentAttendance.find(filter).populate('studentId').lean();
  }

  async markStudentAttendance(studentId, date, status, remarks = '', markedBy = 'Teacher') {
    const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));
    if (!this.isDbConnected()) {
      return { studentId, date: formattedDate, status, remarks };
    }
    return StudentAttendance.findOneAndUpdate(
      { studentId, date: formattedDate },
      { $set: { status, remarks, markedBy } },
      { new: true, upsert: true }
    );
  }

  // ─── Teacher Attendance ───────────────────────────────────────────────────
  async findTeacherAttendance(filter = {}) {
    if (!this.isDbConnected()) return [];
    return TeacherAttendance.find(filter).lean();
  }

  async markTeacherAttendance(teacherId, date, status, remarks = '', markedBy = 'Admin') {
    const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));
    if (!this.isDbConnected()) {
      return { teacherId, date: formattedDate, status, remarks };
    }
    return TeacherAttendance.findOneAndUpdate(
      { teacherId, date: formattedDate },
      { $set: { status, remarks, markedBy } },
      { new: true, upsert: true }
    );
  }

  // ─── Holidays ─────────────────────────────────────────────────────────────
  async findAllHolidays(filter = {}) {
    if (!this.isDbConnected()) return [];
    return Holiday.find(filter).sort({ date: 1 }).lean();
  }

  async createHoliday(holidayData) {
    if (!this.isDbConnected()) return holidayData;
    return Holiday.create(holidayData);
  }

  // ─── Summaries ────────────────────────────────────────────────────────────
  async getStudentListByClass(className, sectionName) {
    if (!this.isDbConnected()) {
      return [
        { _id: '60d01b123432ab34523912a1', firstName: 'Alex', lastName: 'Rivera', admissionNo: 'ADM001', rollNo: '101' },
        { _id: '60d01b123432ab34523912a2', firstName: 'Chloe', lastName: 'Chen', admissionNo: 'ADM002', rollNo: '102' }
      ];
    }
    const filter = { isDeleted: false };
    if (className) filter.class = className;
    if (sectionName) filter.section = sectionName;
    return Student.find(filter).lean();
  }

  async getTeachersList() {
    return MOCK_TEACHERS;
  }

  // ─── Leave Requests ───────────────────────────────────────────────────────
  async findLeaveRequests(filter = {}) {
    if (!this.isDbConnected()) return MOCK_LEAVES;
    return LeaveRequest.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findLeaveRequestById(id) {
    if (!this.isDbConnected()) {
      return MOCK_LEAVES.find(l => l._id === id) || MOCK_LEAVES[0];
    }
    return LeaveRequest.findById(id).lean();
  }

  async createLeaveRequest(leaveData) {
    if (!this.isDbConnected()) {
      const mockNew = { _id: new mongoose.Types.ObjectId().toString(), ...leaveData, status: 'pending' };
      MOCK_LEAVES.push(mockNew);
      return mockNew;
    }
    return LeaveRequest.create(leaveData);
  }

  async updateLeaveRequestStatus(id, status, actionRemarks = '', actionBy = 'Admin') {
    if (!this.isDbConnected()) {
      const found = MOCK_LEAVES.find(l => l._id === id);
      if (found) {
        found.status = status;
        found.actionRemarks = actionRemarks;
        found.actionBy = actionBy;
        found.actionDate = new Date();
      }
      return found || MOCK_LEAVES[0];
    }
    return LeaveRequest.findByIdAndUpdate(
      id,
      { $set: { status, actionRemarks, actionBy, actionDate: new Date() } },
      { new: true }
    );
  }
}

module.exports = new AttendanceRepository();
