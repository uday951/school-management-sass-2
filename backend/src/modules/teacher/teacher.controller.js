const teacherService = require('./teacher.service');
const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');

class TeacherController {
  // GET /api/v1/teachers
  getTeachers = asyncHandler(async (req, res) => {
    const { teachers, pagination } = await teacherService.getTeachers(req.query);
    return sendPaginated(res, 'Teacher directory retrieved successfully.', teachers, pagination);
  });

  // GET /api/v1/teachers/:id
  getTeacherById = asyncHandler(async (req, res) => {
    const teacher = await teacherService.getTeacherById(req.params.id);
    return sendSuccess(res, 'Teacher details fetched successfully.', teacher);
  });

  // GET /api/v1/teachers/:id/profile
  getTeacherProfile = asyncHandler(async (req, res) => {
    const profile = await teacherService.getTeacherProfile(req.params.id);
    return sendSuccess(res, 'Teacher profile fetched successfully.', profile);
  });

  // POST /api/v1/teachers
  createTeacher = asyncHandler(async (req, res) => {
    const teacher = await teacherService.createTeacher(req.body);
    return sendCreated(res, 'Teacher record created successfully.', teacher);
  });

  // PUT /api/v1/teachers/:id
  updateTeacher = asyncHandler(async (req, res) => {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body);
    return sendSuccess(res, 'Teacher updated successfully.', teacher);
  });

  // DELETE /api/v1/teachers/:id
  deleteTeacher = asyncHandler(async (req, res) => {
    const result = await teacherService.deleteTeacher(req.params.id);
    return sendSuccess(res, result.message);
  });

  // PATCH /api/v1/teachers/:id/status
  toggleTeacherStatus = asyncHandler(async (req, res) => {
    const teacher = await teacherService.toggleTeacherStatus(req.params.id, req.body.status);
    return sendSuccess(res, 'Teacher status updated.', teacher);
  });

  // ─── DEPARTMENTS ────────────────────────────────────────────────────────
  getDepartments = asyncHandler(async (req, res) => {
    const departments = await teacherService.getDepartments();
    return sendSuccess(res, 'Departments fetched successfully.', departments);
  });

  createDepartment = asyncHandler(async (req, res) => {
    const department = await teacherService.createDepartment(req.body);
    return sendCreated(res, 'Department created successfully.', department);
  });

  updateDepartment = asyncHandler(async (req, res) => {
    const department = await teacherService.updateDepartment(req.params.id, req.body);
    return sendSuccess(res, 'Department updated successfully.', department);
  });

  deleteDepartment = asyncHandler(async (req, res) => {
    const result = await teacherService.deleteDepartment(req.params.id);
    return sendSuccess(res, result.message);
  });

  // ─── DESIGNATIONS ───────────────────────────────────────────────────────
  getDesignations = asyncHandler(async (req, res) => {
    const designations = await teacherService.getDesignations();
    return sendSuccess(res, 'Designations fetched successfully.', designations);
  });

  createDesignation = asyncHandler(async (req, res) => {
    const designation = await teacherService.createDesignation(req.body);
    return sendCreated(res, 'Designation created successfully.', designation);
  });

  updateDesignation = asyncHandler(async (req, res) => {
    const designation = await teacherService.updateDesignation(req.params.id, req.body);
    return sendSuccess(res, 'Designation updated successfully.', designation);
  });

  deleteDesignation = asyncHandler(async (req, res) => {
    const result = await teacherService.deleteDesignation(req.params.id);
    return sendSuccess(res, result.message);
  });

  // ─── QUALIFICATION & EXPERIENCE ─────────────────────────────────────────
  addQualification = asyncHandler(async (req, res) => {
    const qual = await teacherService.addQualification(req.params.id, req.body);
    return sendCreated(res, 'Qualification added successfully.', qual);
  });

  deleteQualification = asyncHandler(async (req, res) => {
    const result = await teacherService.deleteQualification(req.params.qualId);
    return sendSuccess(res, result.message);
  });

  addExperience = asyncHandler(async (req, res) => {
    const exp = await teacherService.addExperience(req.params.id, req.body);
    return sendCreated(res, 'Experience record added successfully.', exp);
  });

  deleteExperience = asyncHandler(async (req, res) => {
    const result = await teacherService.deleteExperience(req.params.expId);
    return sendSuccess(res, result.message);
  });

  // ─── DOCUMENTS ──────────────────────────────────────────────────────────
  uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
      return sendSuccess(res, 'Document meta created.', await teacherService.uploadDocument(req.params.id, { originalname: req.body.title || 'doc.pdf', path: req.body.fileUrl || '/uploads/doc.pdf', size: 1024 }, req.body));
    }
    const doc = await teacherService.uploadDocument(req.params.id, req.file, req.body);
    return sendCreated(res, 'Teacher document uploaded successfully.', doc);
  });

  deleteDocument = asyncHandler(async (req, res) => {
    const result = await teacherService.deleteDocument(req.params.docId);
    return sendSuccess(res, result.message);
  });

  // ─── ASSIGNMENTS ────────────────────────────────────────────────────────
  assignClasses = asyncHandler(async (req, res) => {
    const teacher = await teacherService.assignClasses(req.params.id, req.body.assignedClasses);
    return sendSuccess(res, 'Classes assigned to teacher successfully.', teacher);
  });

  assignSubjects = asyncHandler(async (req, res) => {
    const teacher = await teacherService.assignSubjects(req.params.id, req.body.assignedSubjects);
    return sendSuccess(res, 'Subjects assigned to teacher successfully.', teacher);
  });

  // ─── ATTENDANCE & LEAVES ─────────────────────────────────────────────────
  recordAttendance = asyncHandler(async (req, res) => {
    const attendance = await teacherService.recordAttendance(req.params.id, req.body);
    return sendCreated(res, 'Attendance recorded successfully.', attendance);
  });

  getAttendanceHistory = asyncHandler(async (req, res) => {
    const history = await teacherService.getAttendanceHistory(req.params.id);
    return sendSuccess(res, 'Attendance history fetched.', history);
  });

  requestLeave = asyncHandler(async (req, res) => {
    const leave = await teacherService.requestLeave(req.params.id, req.body);
    return sendCreated(res, 'Leave request submitted successfully.', leave);
  });

  getLeaveRequests = asyncHandler(async (req, res) => {
    const leaves = await teacherService.getLeaveRequests(req.query);
    return sendSuccess(res, 'Leave requests fetched successfully.', leaves);
  });

  updateLeaveStatus = asyncHandler(async (req, res) => {
    const leave = await teacherService.updateLeaveStatus(req.params.leaveId, req.body.status, req.body.remarks, req.body.approvedBy);
    return sendSuccess(res, 'Leave status updated successfully.', leave);
  });

  // ─── TEACHER PORTAL FEATURE ENDPOINTS ──────────────────────────────────────
  getDashboard = asyncHandler(async (req, res) => {
    const teacherId = req.user?._id || req.query.teacherId;
    const data = await teacherService.getDashboard(teacherId);
    return sendSuccess(res, 'Teacher dashboard data retrieved successfully.', data);
  });

  getClasses = asyncHandler(async (req, res) => {
    const teacherId = req.user?._id || req.query.teacherId;
    const classes = await teacherService.getClasses(teacherId);
    return sendSuccess(res, 'Teacher assigned classes retrieved successfully.', classes);
  });

  getStudents = asyncHandler(async (req, res) => {
    const { students, pagination } = await teacherService.getStudents(req.query);
    return sendPaginated(res, 'Teacher classroom student roster retrieved successfully.', students, pagination);
  });

  getSchedule = asyncHandler(async (req, res) => {
    const teacherId = req.user?._id || req.query.teacherId;
    const schedule = await teacherService.getSchedule(teacherId);
    return sendSuccess(res, 'Teacher class schedule retrieved successfully.', schedule);
  });

  getCalendar = asyncHandler(async (_req, res) => {
    const calendar = await teacherService.getCalendar();
    return sendSuccess(res, 'Teacher academic calendar retrieved successfully.', calendar);
  });
}

module.exports = new TeacherController();
