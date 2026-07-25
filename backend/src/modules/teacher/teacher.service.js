const Teacher = require('./models/teacher.model');
const Department = require('./models/department.model');
const Designation = require('./models/designation.model');
const Qualification = require('./models/qualification.model');
const Experience = require('./models/experience.model');
const TeacherDocument = require('./models/document.model');
const TeacherAttendance = require('./models/attendance.model');
const TeacherLeave = require('./models/leave.model');
const ApiError = require('../../utils/apiError.util');
const { paginate } = require('../../utils/pagination.util');
const User = require('../user/user.model');

class TeacherService {
  // ─── TEACHER CRUD ────────────────────────────────────────────────────────
  async getTeachers(queryParams = {}) {
    const { page = 1, limit = 10, search = '', department = '', designation = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

    let initialCount = await Teacher.countDocuments({ isDeleted: false });

    if (initialCount === 0) {
      const sampleTeachers = [
        {
          employeeId: 'EMP-1001',
          firstName: 'Dr. Robert',
          lastName: 'Langdon',
          gender: 'male',
          dob: '1982-05-14',
          phone: '(555) 234-5678',
          email: 'robert.langdon@school.edu',
          address: '452 Harvard Ave, Cambridge, MA',
          department: 'Mathematics',
          designation: 'Department Head',
          joiningDate: '2015-08-01',
          qualification: 'Ph.D. Pure Mathematics, M.Sc.',
          experienceYears: 12,
          status: 'active',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          assignedClasses: [{ classId: 'c1', className: 'Grade 10', section: 'A', isClassTeacher: true }],
          assignedSubjects: [{ subjectId: 's1', subjectName: 'Advanced Calculus', className: 'Grade 10' }]
        },
        {
          employeeId: 'EMP-1002',
          firstName: 'Eleanor',
          lastName: 'Vance',
          gender: 'female',
          dob: '1990-11-20',
          phone: '(555) 876-5432',
          email: 'eleanor.vance@school.edu',
          address: '108 Oakridge Lane, Springfield, IL',
          department: 'Science',
          designation: 'Senior Teacher',
          joiningDate: '2018-09-10',
          qualification: 'M.Sc. Physics, B.Ed.',
          experienceYears: 7,
          status: 'active',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          assignedClasses: [{ classId: 'c2', className: 'Grade 9', section: 'C', isClassTeacher: true }],
          assignedSubjects: [{ subjectId: 's2', subjectName: 'Physics Fundamentals', className: 'Grade 9' }]
        }
      ];
      await Teacher.insertMany(sampleTeachers);
    }

    const filter = { isDeleted: false };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (status) filter.status = status;

    const total = await Teacher.countDocuments(filter);
    const { skip, limit: parsedLimit, meta } = paginate(page, limit, total);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const teachers = await Teacher.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    return { teachers, pagination: meta };
  }

  async getTeacherById(id) {
    const teacher = await Teacher.findById(id).lean();
    if (!teacher || teacher.isDeleted) {
      throw new ApiError(404, 'Teacher record not found', 'TEACHER_NOT_FOUND');
    }
    return teacher;
  }

  async getTeacherProfile(id) {
    const teacher = await this.getTeacherById(id);
    const qualifications = await Qualification.find({ teacherId: id }).lean();
    const experiences = await Experience.find({ teacherId: id }).lean();
    const documents = await TeacherDocument.find({ teacherId: id }).lean();
    const attendance = await TeacherAttendance.find({ teacherId: id }).sort({ date: -1 }).limit(30).lean();
    const leaves = await TeacherLeave.find({ teacherId: id }).sort({ createdAt: -1 }).lean();

    return {
      ...teacher,
      qualifications,
      experiences,
      documents,
      attendanceSummary: {
        totalDays: attendance.length,
        presentCount: attendance.filter(a => a.status === 'present').length,
        absentCount: attendance.filter(a => a.status === 'absent').length,
        leaveCount: attendance.filter(a => a.status === 'leave').length,
        recent: attendance
      },
      leaveSummary: {
        totalRequests: leaves.length,
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        recent: leaves
      }
    };
  }

  async createTeacher(payload) {
    const existing = await Teacher.findOne({ employeeId: payload.employeeId });
    if (existing) {
      throw new ApiError(400, `Teacher with Employee ID '${payload.employeeId}' already exists`, 'DUPLICATE_EMPLOYEE_ID');
    }

    const teacher = await Teacher.create(payload);

    // Auto-create User account for the teacher
    try {
      let emailToUse = teacher.email;
      let existingUser = await User.findOne({ email: teacher.email });

      if (existingUser && existingUser.employeeId !== teacher.employeeId) {
        const emailParts = teacher.email.split('@');
        emailToUse = `${emailParts[0]}+${teacher.employeeId}@${emailParts[1]}`;
        existingUser = await User.findOne({ email: emailToUse });
      }

      if (!existingUser) {
        await User.create({
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: emailToUse,
          role: 'teacher',
          department: teacher.department,
          designation: teacher.designation,
          employeeId: teacher.employeeId,
          mobile: teacher.phone,
          status: 'active'
        });
      }
    } catch (err) {
      console.error('[Sync Error] Failed to auto-create user account for teacher:', err.message);
    }

    return teacher;
  }

  async updateTeacher(id, payload) {
    const teacher = await Teacher.findById(id);
    if (!teacher || teacher.isDeleted) {
      throw new ApiError(404, 'Teacher not found', 'TEACHER_NOT_FOUND');
    }

    if (payload.employeeId && payload.employeeId !== teacher.employeeId) {
      const existing = await Teacher.findOne({ employeeId: payload.employeeId, _id: { $ne: id } });
      if (existing) {
        throw new ApiError(400, `Employee ID '${payload.employeeId}' is already in use`, 'DUPLICATE_EMPLOYEE_ID');
      }
    }

    const oldEmail = teacher.email;
    Object.assign(teacher, payload);
    await teacher.save();

    // Auto-update User account for the teacher
    try {
      let emailToUse = teacher.email;
      let existingUser = await User.findOne({ email: teacher.email });

      if (existingUser && existingUser.employeeId !== teacher.employeeId) {
        const emailParts = teacher.email.split('@');
        emailToUse = `${emailParts[0]}+${teacher.employeeId}@${emailParts[1]}`;
      }

      await User.findOneAndUpdate(
        { employeeId: teacher.employeeId },
        {
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: emailToUse,
          department: teacher.department,
          designation: teacher.designation,
          mobile: teacher.phone
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('[Sync Error] Failed to auto-update user account for teacher:', err.message);
    }

    return teacher;
  }

  async deleteTeacher(id) {
    const teacher = await Teacher.findById(id);
    if (!teacher || teacher.isDeleted) {
      throw new ApiError(404, 'Teacher not found', 'TEACHER_NOT_FOUND');
    }

    teacher.isDeleted = true;
    await teacher.save();

    // Soft delete corresponding User account
    try {
      await User.findOneAndUpdate({ email: teacher.email }, { isDeleted: true });
    } catch (err) {
      console.error('[Sync Error] Failed to soft-delete user account for teacher:', err.message);
    }

    return { message: 'Teacher record soft deleted successfully.' };
  }

  async toggleTeacherStatus(id, status) {
    const teacher = await Teacher.findById(id);
    if (!teacher || teacher.isDeleted) {
      throw new ApiError(404, 'Teacher not found', 'TEACHER_NOT_FOUND');
    }

    if (!['active', 'inactive', 'on_leave'].includes(status)) {
      throw new ApiError(400, 'Invalid status parameter', 'INVALID_STATUS');
    }

    teacher.status = status;
    await teacher.save();

    // Toggle corresponding User account status
    try {
      await User.findOneAndUpdate(
        { email: teacher.email },
        { status: status === 'active' ? 'active' : 'inactive' }
      );
    } catch (err) {
      console.error('[Sync Error] Failed to toggle user status for teacher:', err.message);
    }

    return teacher;
  }

  // ─── DEPARTMENT CRUD ─────────────────────────────────────────────────────
  async getDepartments() {
    let depts = await Department.find({ isDeleted: false }).sort({ name: 1 }).lean();
    if (depts.length === 0) {
      const defaults = [
        { name: 'Mathematics', code: 'MATH', description: 'Department of Pure & Applied Mathematics' },
        { name: 'Science', code: 'SCI', description: 'Physics, Chemistry and Biology laboratories' },
        { name: 'Humanities', code: 'HUM', description: 'History, Social Sciences and Literature' },
        { name: 'Languages', code: 'LANG', description: 'English, Modern Languages and Linguistics' }
      ];
      depts = await Department.insertMany(defaults);
    }
    return depts;
  }

  async createDepartment(payload) {
    const existing = await Department.findOne({
      $or: [{ name: payload.name }, { code: payload.code }]
    });
    if (existing) {
      throw new ApiError(400, 'Department with this name or code already exists', 'DUPLICATE_DEPARTMENT');
    }
    return await Department.create(payload);
  }

  async updateDepartment(id, payload) {
    const dept = await Department.findById(id);
    if (!dept || dept.isDeleted) {
      throw new ApiError(404, 'Department not found', 'DEPARTMENT_NOT_FOUND');
    }
    Object.assign(dept, payload);
    await dept.save();
    return dept;
  }

  async deleteDepartment(id) {
    const dept = await Department.findById(id);
    if (!dept || dept.isDeleted) {
      throw new ApiError(404, 'Department not found', 'DEPARTMENT_NOT_FOUND');
    }
    dept.isDeleted = true;
    await dept.save();
    return { message: 'Department deleted successfully.' };
  }

  // ─── DESIGNATION CRUD ────────────────────────────────────────────────────
  async getDesignations() {
    let desigs = await Designation.find({ isDeleted: false }).sort({ name: 1 }).lean();
    if (desigs.length === 0) {
      const defaults = [
        { name: 'Department Head', code: 'HOD', description: 'Head of Academic Department' },
        { name: 'Senior Teacher', code: 'ST', description: 'Lead Faculty Member' },
        { name: 'Assistant Teacher', code: 'AT', description: 'Junior Teaching Faculty' },
        { name: 'Lab Instructor', code: 'LI', description: 'Practical Laboratory Supervisor' }
      ];
      desigs = await Designation.insertMany(defaults);
    }
    return desigs;
  }

  async createDesignation(payload) {
    const existing = await Designation.findOne({
      $or: [{ name: payload.name }, { code: payload.code }]
    });
    if (existing) {
      throw new ApiError(400, 'Designation with this name or code already exists', 'DUPLICATE_DESIGNATION');
    }
    return await Designation.create(payload);
  }

  async updateDesignation(id, payload) {
    const desig = await Designation.findById(id);
    if (!desig || desig.isDeleted) {
      throw new ApiError(404, 'Designation not found', 'DESIGNATION_NOT_FOUND');
    }
    Object.assign(desig, payload);
    await desig.save();
    return desig;
  }

  async deleteDesignation(id) {
    const desig = await Designation.findById(id);
    if (!desig || desig.isDeleted) {
      throw new ApiError(404, 'Designation not found', 'DESIGNATION_NOT_FOUND');
    }
    desig.isDeleted = true;
    await desig.save();
    return { message: 'Designation deleted successfully.' };
  }

  // ─── QUALIFICATIONS & EXPERIENCE ─────────────────────────────────────────
  async addQualification(teacherId, payload) {
    await this.getTeacherById(teacherId);
    return await Qualification.create({ ...payload, teacherId });
  }

  async deleteQualification(id) {
    await Qualification.findByIdAndDelete(id);
    return { message: 'Qualification deleted successfully.' };
  }

  async addExperience(teacherId, payload) {
    await this.getTeacherById(teacherId);
    return await Experience.create({ ...payload, teacherId });
  }

  async deleteExperience(id) {
    await Experience.findByIdAndDelete(id);
    return { message: 'Experience record deleted successfully.' };
  }

  // ─── DOCUMENTS ───────────────────────────────────────────────────────────
  async uploadDocument(teacherId, file, body) {
    await this.getTeacherById(teacherId);
    const document = await TeacherDocument.create({
      teacherId,
      title: body.title || file.originalname,
      documentType: body.documentType || 'other',
      fileUrl: file.path || `/uploads/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size
    });
    return document;
  }

  async deleteDocument(id) {
    await TeacherDocument.findByIdAndDelete(id);
    return { message: 'Document deleted successfully.' };
  }

  // ─── ASSIGNMENTS ─────────────────────────────────────────────────────────
  async assignClasses(teacherId, assignedClasses = []) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || teacher.isDeleted) {
      throw new ApiError(404, 'Teacher not found', 'TEACHER_NOT_FOUND');
    }
    teacher.assignedClasses = assignedClasses;
    await teacher.save();
    return teacher;
  }

  async assignSubjects(teacherId, assignedSubjects = []) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || teacher.isDeleted) {
      throw new ApiError(404, 'Teacher not found', 'TEACHER_NOT_FOUND');
    }
    teacher.assignedSubjects = assignedSubjects;
    await teacher.save();
    return teacher;
  }

  // ─── ATTENDANCE & LEAVE ───────────────────────────────────────────────────
  async recordAttendance(teacherId, payload) {
    await this.getTeacherById(teacherId);
    const attendance = await TeacherAttendance.findOneAndUpdate(
      { teacherId, date: new Date(payload.date) },
      { ...payload, teacherId, date: new Date(payload.date) },
      { upsert: true, new: true }
    );
    return attendance;
  }

  async getAttendanceHistory(teacherId) {
    return await TeacherAttendance.find({ teacherId }).sort({ date: -1 }).lean();
  }

  async requestLeave(teacherId, payload) {
    await this.getTeacherById(teacherId);
    return await TeacherLeave.create({ ...payload, teacherId });
  }

  async getLeaveRequests(queryParams = {}) {
    const filter = {};
    if (queryParams.teacherId) filter.teacherId = queryParams.teacherId;
    if (queryParams.status) filter.status = queryParams.status;
    return await TeacherLeave.find(filter).populate('teacherId', 'firstName lastName employeeId department').sort({ createdAt: -1 }).lean();
  }

  async updateLeaveStatus(leaveId, status, remarks = '', approvedBy = 'Admin') {
    const leave = await TeacherLeave.findById(leaveId);
    if (!leave) {
      throw new ApiError(404, 'Leave request not found', 'LEAVE_NOT_FOUND');
    }
    leave.status = status;
    leave.remarks = remarks;
    leave.approvedBy = approvedBy;
    await leave.save();
    return leave;
  }
}

module.exports = new TeacherService();
