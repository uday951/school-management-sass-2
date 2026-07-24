const StudentAttendance = require('./models/student-attendance.model');
const TeacherAttendance = require('./models/teacher-attendance.model');
const Holiday = require('./models/holiday.model');
const AttendanceSummary = require('./models/attendance-summary.model');
const Student = require('../student/models/student.model');
const mongoose = require('mongoose');

// Mock list of fallback students/teachers when DB is disconnected for test environments
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
}

module.exports = new AttendanceRepository();
