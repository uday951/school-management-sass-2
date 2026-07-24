const attendanceRepository = require('./attendance.repository');
const ApiError = require('../../utils/apiError.util');

class AttendanceService {
  async getStudentRegister(queryParams) {
    const { class: className, section, date = new Date() } = queryParams;
    const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

    // 1. Fetch all students in this class/section
    const students = await attendanceRepository.getStudentListByClass(className, section);

    // 2. Fetch marked attendance for these students on this date
    const studentIds = students.map((s) => s._id || s.id);
    const markedRecords = await attendanceRepository.findStudentAttendance({
      studentId: { $in: studentIds },
      date: formattedDate
    });

    const attendanceMap = new Map(
      markedRecords.map((r) => [r.studentId?._id?.toString() || r.studentId?.toString(), r])
    );

    // 3. Merge student profiles with marked attendance status
    const list = students.map((s) => {
      const id = s._id ? s._id.toString() : s.id;
      const record = attendanceMap.get(id);
      return {
        id,
        name: `${s.firstName} ${s.lastName}`,
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        class: s.class,
        section: s.section,
        status: record ? record.status : 'present', // Default to present
        remarks: record ? record.remarks : ''
      };
    });

    return list;
  }

  async markStudentAttendance(payload) {
    const { studentId, date = new Date(), status, remarks = '', markedBy = 'Teacher' } = payload;
    if (!studentId || !status) {
      throw ApiError.badRequest('Student ID and status are required.');
    }
    return attendanceRepository.markStudentAttendance(studentId, date, status, remarks, markedBy);
  }

  async getTeacherRegister(queryParams) {
    const { department, date = new Date() } = queryParams;
    const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

    const teachers = await attendanceRepository.getTeachersList();
    const activeTeachers = department
      ? teachers.filter((t) => t.department === department)
      : teachers;

    const teacherIds = activeTeachers.map((t) => t.id);
    const markedRecords = await attendanceRepository.findTeacherAttendance({
      teacherId: { $in: teacherIds },
      date: formattedDate
    });

    const attendanceMap = new Map(markedRecords.map((r) => [r.teacherId, r]));

    const list = activeTeachers.map((t) => {
      const record = attendanceMap.get(t.id);
      return {
        id: t.id,
        name: t.name,
        department: t.department,
        email: t.email,
        phone: t.phone,
        status: record ? record.status : 'present',
        remarks: record ? record.remarks : ''
      };
    });

    return list;
  }

  async markTeacherAttendance(payload) {
    const { teacherId, date = new Date(), status, remarks = '', markedBy = 'Admin' } = payload;
    if (!teacherId || !status) {
      throw ApiError.badRequest('Teacher ID and status are required.');
    }
    return attendanceRepository.markTeacherAttendance(teacherId, date, status, remarks, markedBy);
  }

  async getAttendanceReport(queryParams) {
    const { type = 'student', class: className, section, date = new Date() } = queryParams;
    const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

    if (type === 'student') {
      const students = await attendanceRepository.getStudentListByClass(className, section);
      const studentIds = students.map((s) => s._id || s.id);

      const records = await attendanceRepository.findStudentAttendance({
        studentId: { $in: studentIds }
      });

      const attendanceMap = new Map();
      records.forEach((r) => {
        const id = r.studentId?._id?.toString() || r.studentId?.toString();
        if (!attendanceMap.has(id)) {
          attendanceMap.set(id, { present: 0, absent: 0, late: 0, halfday: 0, total: 0 });
        }
        const stats = attendanceMap.get(id);
        stats.total++;
        stats[r.status]++;
      });

      const list = students.map((s) => {
        const id = s._id ? s._id.toString() : s.id;
        const stats = attendanceMap.get(id) || { present: 0, absent: 0, late: 0, halfday: 0, total: 0 };
        const rate = stats.total > 0 ? Math.round(((stats.present + stats.halfday * 0.5) / stats.total) * 100) : 100;
        return {
          id,
          name: `${s.firstName} ${s.lastName}`,
          admissionNo: s.admissionNo,
          class: s.class,
          section: s.section,
          presentCount: stats.present,
          absentCount: stats.absent,
          attendanceRate: rate
        };
      });

      return list;
    } else {
      // Teacher reports
      const teachers = await attendanceRepository.getTeachersList();
      const records = await attendanceRepository.findTeacherAttendance();

      const attendanceMap = new Map();
      records.forEach((r) => {
        if (!attendanceMap.has(r.teacherId)) {
          attendanceMap.set(r.teacherId, { present: 0, absent: 0, late: 0, halfday: 0, total: 0 });
        }
        const stats = attendanceMap.get(r.teacherId);
        stats.total++;
        stats[r.status]++;
      });

      const list = teachers.map((t) => {
        const stats = attendanceMap.get(t.id) || { present: 0, absent: 0, late: 0, halfday: 0, total: 0 };
        const rate = stats.total > 0 ? Math.round(((stats.present + stats.halfday * 0.5) / stats.total) * 100) : 100;
        return {
          id: t.id,
          name: t.name,
          department: t.department,
          presentCount: stats.present,
          absentCount: stats.absent,
          attendanceRate: rate
        };
      });

      return list;
    }
  }

  async getHolidays(queryParams) {
    return attendanceRepository.findAllHolidays(queryParams);
  }

  async createHoliday(payload) {
    const { title, date, description = '' } = payload;
    if (!title || !date) {
      throw ApiError.badRequest('Holiday title and date are required.');
    }
    return attendanceRepository.createHoliday({ title, date, description });
  }

  // ─── Leave Request Services ───────────────────────────────────────────────
  async applyLeaveRequest(payload) {
    const { applicantId, applicantName, type, leaveType, startDate, endDate, reason = '' } = payload;
    if (!applicantId || !applicantName || !type || !startDate || !endDate) {
      throw ApiError.badRequest('Missing required leave request fields.');
    }
    return attendanceRepository.createLeaveRequest({
      applicantId,
      applicantName,
      type,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason
    });
  }

  async getLeaveRequests(queryParams) {
    const filter = {};
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.type) filter.type = queryParams.type;
    if (queryParams.applicantId) filter.applicantId = queryParams.applicantId;

    return attendanceRepository.findLeaveRequests(filter);
  }

  async updateLeaveRequestStatus(id, payload) {
    const { status, actionRemarks = '', actionBy = 'Admin' } = payload;
    if (!status || !['approved', 'rejected'].includes(status)) {
      throw ApiError.badRequest('Invalid status update parameter.');
    }

    const leave = await attendanceRepository.findLeaveRequestById(id);
    if (!leave) throw ApiError.notFound('Leave request not found.');

    const updated = await attendanceRepository.updateLeaveRequestStatus(id, status, actionRemarks, actionBy);

    // If approved, automatically create attendance records for all dates in the range
    if (status === 'approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        if (leave.type === 'student') {
          await attendanceRepository.markStudentAttendance(
            leave.applicantId,
            currentDate,
            'absent',
            `Approved Leave: ${leave.reason || 'No reason provided'}`,
            actionBy
          );
        } else {
          await attendanceRepository.markTeacherAttendance(
            leave.applicantId,
            currentDate,
            'absent',
            `Approved Leave: ${leave.reason || 'No reason provided'}`,
            actionBy
          );
        }
      }
    }

    return updated;
  }

  async getBiometricLogs() {
    const studentRecords = await attendanceRepository.findStudentAttendance({});
    const teacherRecords = await attendanceRepository.findTeacherAttendance({});

    const logs = [];
    studentRecords.forEach((r, idx) => {
      logs.push({
        id: `s-${idx}`,
        empId: r.studentId?.admissionNo || 'STU001',
        name: r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}`.trim() : 'Student',
        time: new Date(r.updatedAt || r.createdAt).toLocaleTimeString(),
        device: 'Student Lobby Reader',
        status: r.status === 'present' ? 'In' : 'Out'
      });
    });

    teacherRecords.forEach((r, idx) => {
      logs.push({
        id: `t-${idx}`,
        empId: r.teacherId,
        name: 'Teacher Staff',
        time: new Date(r.updatedAt || r.createdAt).toLocaleTimeString(),
        device: 'Main Entry Reader',
        status: r.status === 'present' ? 'In' : 'Out'
      });
    });

    return logs.slice(0, 50);
  }

  async getAttendanceStats() {
    const studentRecords = await attendanceRepository.findStudentAttendance({});
    const teacherRecords = await attendanceRepository.findTeacherAttendance({});
    const holidays = await attendanceRepository.findAllHolidays({});
    const biometricLogs = await this.getBiometricLogs();

    const studentTotal = studentRecords.length;
    const studentPresent = studentRecords.filter(r => r.status === 'present').length;
    const studentRate = studentTotal > 0 ? Math.round((studentPresent / studentTotal) * 100) : 96;

    const teacherTotal = teacherRecords.length;
    const teacherPresent = teacherRecords.filter(r => r.status === 'present').length;

    return {
      studentRate: `${studentRate}%`,
      teachersPresent: `${teacherPresent} / ${teacherTotal || 30}`,
      holidaysCount: `${holidays.length} Days`,
      biometricCheckins: `${biometricLogs.length} Checkins`
    };
  }
}

module.exports = new AttendanceService();
