const reportsRepository = require('./reports.repository');
const ApiError = require('../../utils/apiError.util');
const mongoose = require('mongoose');

class ReportsService {
  // ─── Dashboard Stats with caching ─────────────────────────────────────────
  async getDashboardSummary() {
    const cacheKey = 'reports-dashboard-stats';
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getDashboardAnalytics();
    await reportsRepository.setCache(cacheKey, data, 600); // cache for 10 minutes
    return data;
  }

  // ─── Student Reports ──────────────────────────────────────────────────────
  async getStudentSummary(queryParams) {
    const filter = {};
    if (queryParams.class) filter.class = queryParams.class;
    if (queryParams.status) filter.status = queryParams.status;

    const cacheKey = `reports-student-${JSON.stringify(filter)}`;
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getStudentAnalytics(filter);
    await reportsRepository.setCache(cacheKey, data, 300);
    return data;
  }

  // ─── Teacher Reports ──────────────────────────────────────────────────────
  async getTeacherSummary(queryParams) {
    const filter = {};
    if (queryParams.department) filter.department = queryParams.department;

    const cacheKey = `reports-teacher-${JSON.stringify(filter)}`;
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getTeacherAnalytics(filter);
    await reportsRepository.setCache(cacheKey, data, 300);
    return data;
  }

  // ─── Attendance Reports ───────────────────────────────────────────────────
  async getAttendanceSummary(queryParams) {
    const filter = {};
    if (queryParams.startDate && queryParams.endDate) {
      filter.startDate = queryParams.startDate;
      filter.endDate = queryParams.endDate;
    }

    const cacheKey = `reports-attendance-${JSON.stringify(filter)}`;
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getAttendanceAnalytics(filter);
    await reportsRepository.setCache(cacheKey, data, 300);
    return data;
  }

  // ─── Fee Reports ──────────────────────────────────────────────────────────
  async getFeeSummary(queryParams) {
    const filter = {};
    const cacheKey = 'reports-fees-summary';
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getFeeAnalytics(filter);
    await reportsRepository.setCache(cacheKey, data, 300);
    return data;
  }

  // ─── Exam Reports ─────────────────────────────────────────────────────────
  async getExamSummary(queryParams) {
    const filter = {};
    const cacheKey = 'reports-exams-summary';
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getExamAnalytics(filter);
    await reportsRepository.setCache(cacheKey, data, 300);
    return data;
  }

  // ─── Academic Reports ─────────────────────────────────────────────────────
  async getAcademicSummary(queryParams) {
    const filter = {};
    const cacheKey = 'reports-academic-summary';
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getAcademicAnalytics(filter);
    await reportsRepository.setCache(cacheKey, data, 300);
    return data;
  }

  // ─── Financial Reports ────────────────────────────────────────────────────
  async getFinancialSummary(queryParams) {
    const filter = {};
    const cacheKey = 'reports-financial-summary';
    const cached = await reportsRepository.getCache(cacheKey);
    if (cached) return cached;

    const data = await reportsRepository.getFinancialAnalytics(filter);
    await reportsRepository.setCache(cacheKey, data, 300);
    return data;
  }

  // ─── Custom Reports Templates ─────────────────────────────────────────────
  async getTemplates() {
    return reportsRepository.findTemplates();
  }

  async createTemplate(payload) {
    const { name, category, columns, filters = {} } = payload;
    if (!name || !category || !columns) {
      throw ApiError.badRequest('Missing required report template fields.');
    }
    return reportsRepository.createTemplate({ name, category, columns, filters });
  }

  async runCustomReport(payload) {
    const { category, columns, filters = {} } = payload;
    if (!category || !columns) {
      throw ApiError.badRequest('Missing required custom report schema.');
    }

    let records = [];
    const Student = mongoose.models.Student || mongoose.model('Student');
    const Teacher = mongoose.models.Teacher || mongoose.model('Teacher');
    const StudentFee = mongoose.models.StudentFee || mongoose.model('StudentFee');

    if (category === 'students') {
      records = await Student.find({ isDeleted: false, ...filters }).lean();
    } else if (category === 'teachers') {
      records = await Teacher.find({ isDeleted: false, ...filters }).lean();
    } else if (category === 'fees') {
      records = await StudentFee.find({ isDeleted: false, ...filters })
        .populate('studentId')
        .lean();
    } else {
      records = await Student.find({ isDeleted: false }).limit(20).lean();
    }

    return { columns, records };
  }

  // ─── Export Center Output Generator ───────────────────────────────────────
  async generateExport(queryParams) {
    const { format = 'csv', category = 'students' } = queryParams;
    let records = [];

    const Student = mongoose.models.Student || mongoose.model('Student');
    const Teacher = mongoose.models.Teacher || mongoose.model('Teacher');

    if (category === 'students') {
      records = await Student.find({ isDeleted: false }).limit(50).lean();
    } else if (category === 'teachers') {
      records = await Teacher.find({ isDeleted: false }).limit(50).lean();
    } else {
      records = await Student.find({ isDeleted: false }).limit(50).lean();
    }

    await reportsRepository.createExport({
      format,
      generatedBy: 'admin',
      url: `/api/v1/reports/export?format=${format}&category=${category}`
    });

    if (format === 'csv') {
      let csvContent = '';
      if (category === 'students') {
        csvContent += 'AdmissionNo,Name,Class,Section,Status\n';
        records.forEach(r => {
          csvContent += `"${r.admissionNo}","${r.firstName} ${r.lastName}","${r.class}","${r.section}","${r.status}"\n`;
        });
      } else {
        csvContent += 'Name,Department,Designation,Status\n';
        records.forEach(r => {
          csvContent += `"${r.firstName} ${r.lastName}","${r.department}","${r.designation}","${r.status}"\n`;
        });
      }
      return { format: 'csv', data: csvContent };
    }

    return { format, data: records };
  }
}

module.exports = new ReportsService();
