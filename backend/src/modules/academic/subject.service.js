const subjectRepository = require('./subject.repository');
const classRepository = require('./class.repository');
const ApiError = require('../../utils/apiError.util');
const User = require('../user/user.model');
const mongoose = require('mongoose');

class SubjectService {
  /**
   * Helper to normalize payload field names
   */
  normalizePayload(data) {
    const subjectName = data.subjectName || data.name;
    const subjectCode = data.subjectCode || data.code;
    const department = data.department;
    const credits = data.credits !== undefined ? Number(data.credits) : undefined;
    const description = data.description;
    let status = data.status || 'ACTIVE';

    if (typeof status === 'string') {
      status = status.toUpperCase();
    }

    let teacher = data.teacher !== undefined ? data.teacher : data.teacherId;
    let classes = data.classes !== undefined ? data.classes : data.assignedClasses;

    if (teacher && !mongoose.Types.ObjectId.isValid(teacher)) {
      teacher = null;
    }

    return {
      subjectName: subjectName ? String(subjectName).trim() : undefined,
      subjectCode: subjectCode ? String(subjectCode).trim().toUpperCase() : undefined,
      department: department ? String(department).trim() : undefined,
      credits,
      description: description !== undefined ? String(description).trim() : undefined,
      status,
      teacher: teacher || null,
      classes: Array.isArray(classes) ? classes : []
    };
  }

  /**
   * List subjects with pagination, search, department & status filtering
   */
  async getAllSubjects(queryParams) {
    const { search, department, status, page, limit, sortBy, sortOrder } = queryParams;
    return subjectRepository.findWithPagination({
      search,
      department,
      status,
      page,
      limit,
      sortBy,
      sortOrder
    });
  }

  /**
   * Get single subject details by ID
   */
  async getSubjectById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Subject ID format');
    }

    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }

    return subject;
  }

  /**
   * Create new subject configuration
   */
  async createSubject(payload) {
    const normalized = this.normalizePayload(payload);

    if (!normalized.subjectName) {
      throw ApiError.badRequest('Subject name (subjectName) is required');
    }
    if (!normalized.subjectCode) {
      throw ApiError.badRequest('Subject code (subjectCode) is required');
    }
    if (!normalized.department) {
      throw ApiError.badRequest('Department is required');
    }
    if (normalized.credits === undefined || isNaN(normalized.credits) || normalized.credits < 0) {
      throw ApiError.badRequest('Credits must be a valid non-negative number');
    }

    // Uniqueness check for subject code
    const existingCode = await subjectRepository.findByCode(normalized.subjectCode);
    if (existingCode) {
      throw ApiError.conflict(`Subject code '${normalized.subjectCode}' already exists`);
    }

    // Verify teacher reference if provided
    if (normalized.teacher && mongoose.Types.ObjectId.isValid(normalized.teacher)) {
      const teacherExists = await User.findById(normalized.teacher);
      if (!teacherExists) {
        normalized.teacher = null;
      }
    } else {
      normalized.teacher = null;
    }

    // Verify class references if provided
    if (normalized.classes && Array.isArray(normalized.classes)) {
      const validClassIds = [];
      for (const classId of normalized.classes) {
        if (mongoose.Types.ObjectId.isValid(classId)) {
          const classExists = await classRepository.findById(classId);
          if (classExists) {
            validClassIds.push(classId);
          }
        }
      }
      normalized.classes = validClassIds;
    }

    return subjectRepository.create(normalized);
  }

  /**
   * Update existing subject configuration
   */
  async updateSubject(id, payload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Subject ID format');
    }

    const existingSubject = await subjectRepository.findById(id);
    if (!existingSubject) {
      throw ApiError.notFound('Subject not found');
    }

    const normalized = this.normalizePayload(payload);

    // If subjectCode updated, verify uniqueness
    if (normalized.subjectCode && normalized.subjectCode !== existingSubject.subjectCode) {
      const duplicateCode = await subjectRepository.findByCode(normalized.subjectCode, id);
      if (duplicateCode) {
        throw ApiError.conflict(`Subject code '${normalized.subjectCode}' already exists on another subject`);
      }
    }

    // Verify teacher if provided
    if (normalized.teacher && mongoose.Types.ObjectId.isValid(normalized.teacher)) {
      const teacherExists = await User.findById(normalized.teacher);
      if (!teacherExists) {
        normalized.teacher = null;
      }
    } else {
      normalized.teacher = null;
    }

    // Verify classes if provided
    if (normalized.classes && Array.isArray(normalized.classes)) {
      const validClassIds = [];
      for (const classId of normalized.classes) {
        if (mongoose.Types.ObjectId.isValid(classId)) {
          const classExists = await classRepository.findById(classId);
          if (classExists) {
            validClassIds.push(classId);
          }
        }
      }
      normalized.classes = validClassIds;
    }

    const updateData = {};
    if (normalized.subjectName !== undefined) updateData.subjectName = normalized.subjectName;
    if (normalized.subjectCode !== undefined) updateData.subjectCode = normalized.subjectCode;
    if (normalized.department !== undefined) updateData.department = normalized.department;
    if (normalized.credits !== undefined) updateData.credits = normalized.credits;
    if (normalized.description !== undefined) updateData.description = normalized.description;
    if (normalized.status !== undefined) updateData.status = normalized.status;
    if (normalized.teacher !== undefined) updateData.teacher = normalized.teacher;
    if (normalized.classes !== undefined) updateData.classes = normalized.classes;

    return subjectRepository.updateById(id, updateData);
  }

  /**
   * Enable / Disable (toggle) subject status
   */
  async toggleSubjectStatus(id, targetStatus = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Subject ID format');
    }

    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }

    let nextStatus;
    if (targetStatus) {
      nextStatus = targetStatus.toUpperCase();
    } else {
      const currentUpper = (subject.status || 'ACTIVE').toUpperCase();
      nextStatus = currentUpper === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }

    return subjectRepository.updateStatus(id, nextStatus);
  }

  /**
   * Assign or update Teacher and Classes for a subject
   */
  async assignSubjectDetails(id, payload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Subject ID format');
    }

    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }

    const teacher = payload.teacher !== undefined ? payload.teacher : payload.teacherId;
    const classes = payload.classes !== undefined ? payload.classes : payload.assignedClasses;

    let validatedTeacher = null;
    if (teacher && mongoose.Types.ObjectId.isValid(teacher)) {
      const teacherExists = await User.findById(teacher);
      if (teacherExists) {
        validatedTeacher = teacher;
      }
    }

    let validatedClasses = [];
    if (Array.isArray(classes)) {
      for (const classId of classes) {
        if (mongoose.Types.ObjectId.isValid(classId)) {
          const classExists = await classRepository.findById(classId);
          if (classExists) {
            validatedClasses.push(classId);
          }
        }
      }
    }

    return subjectRepository.updateAssignments(id, validatedTeacher, validatedClasses);
  }

  /**
   * Soft delete subject configuration
   */
  async deleteSubject(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Subject ID format');
    }

    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw ApiError.notFound('Subject not found');
    }

    return subjectRepository.softDelete(id);
  }
}

module.exports = new SubjectService();
