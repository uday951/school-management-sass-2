const StudentAttendance = require('./models/student-attendance.model');
const TeacherAttendance = require('./models/teacher-attendance.model');
const Holiday = require('./models/holiday.model');
const AttendanceSummary = require('./models/attendance-summary.model');
const LeaveRequest = require('./models/leave-request.model');
const Student = require('../student/models/student.model');

class AttendanceRepository {
  // ─── Student Attendance ───────────────────────────────────────────────────
  async findStudentAttendance(filter = {}) {
    return StudentAttendance.find(filter).populate('studentId').lean();
  }

  async markStudentAttendance(studentId, date, status, remarks = '', markedBy = 'Teacher') {
    const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));
    return StudentAttendance.findOneAndUpdate(
      { studentId, date: formattedDate },
      { $set: { status, remarks, markedBy } },
      { new: true, upsert: true }
    );
  }

  // ─── Teacher Attendance ───────────────────────────────────────────────────
  async findTeacherAttendance(filter = {}) {
    return TeacherAttendance.find(filter).lean();
  }

  async markTeacherAttendance(teacherId, date, status, remarks = '', markedBy = 'Admin') {
    const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));
    return TeacherAttendance.findOneAndUpdate(
      { teacherId, date: formattedDate },
      { $set: { status, remarks, markedBy } },
      { new: true, upsert: true }
    );
  }

  // ─── Holidays ─────────────────────────────────────────────────────────────
  async findAllHolidays(filter = {}) {
    return Holiday.find(filter).sort({ date: 1 }).lean();
  }

  async createHoliday(holidayData) {
    return Holiday.create(holidayData);
  }

  // ─── Summaries ────────────────────────────────────────────────────────────
  async getStudentListByClass(className, sectionName) {
    const filter = { isDeleted: false };
    if (className) filter.class = className;
    if (sectionName) filter.section = sectionName;
    return Student.find(filter).lean();
  }

  async getTeachersList() {
    // Return list of teachers registered in system from Mongoose users/teachers schema
    // In MERN School ERP, teachers are registered as Users with role = 'teacher'
    const mongoose = require('mongoose');
    const User = mongoose.models.User || require('../user/user.model');
    const users = await User.find({ role: 'teacher' }).lean();
    return users.map(u => ({
      id: u._id.toString(),
      name: `${u.firstName || 'Teacher'} ${u.lastName || ''}`.trim(),
      department: u.department || 'General',
      email: u.email,
      phone: u.phone || '(555) 000-0000'
    }));
  }

  // ─── Leave Requests ───────────────────────────────────────────────────────
  async findLeaveRequests(filter = {}) {
    return LeaveRequest.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findLeaveRequestById(id) {
    return LeaveRequest.findById(id).lean();
  }

  async createLeaveRequest(leaveData) {
    return LeaveRequest.create(leaveData);
  }

  async updateLeaveRequestStatus(id, status, actionRemarks = '', actionBy = 'Admin') {
    return LeaveRequest.findByIdAndUpdate(
      id,
      { $set: { status, actionRemarks, actionBy, actionDate: new Date() } },
      { new: true }
    );
  }
}

module.exports = new AttendanceRepository();
