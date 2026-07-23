const classRepository = require('./class.repository');
const ApiError = require('../../utils/apiError.util');
const User = require('../user/user.model');
const mongoose = require('mongoose');

class ClassService {
  /**
   * Helper to normalize incoming request payload fields
   */
  normalizePayload(data) {
    const className = data.className || data.name;
    const classCode = data.classCode || data.code;
    const capacity = data.capacity !== undefined ? Number(data.capacity) : undefined;
    const roomNumber = data.roomNumber;
    let teacherId = data.teacherId || null;
    let status = data.status || 'ACTIVE';

    if (typeof status === 'string') {
      status = status.toUpperCase();
    }

    if (teacherId && !mongoose.Types.ObjectId.isValid(teacherId)) {
      teacherId = null;
    }

    return {
      className: className ? String(className).trim() : undefined,
      classCode: classCode ? String(classCode).trim().toUpperCase() : undefined,
      capacity,
      roomNumber: roomNumber ? String(roomNumber).trim() : undefined,
      teacherId,
      status
    };
  }

  /**
   * List classes with pagination, search, sorting & filtering
   */
  async getAllClasses(queryParams) {
    const { search, status, teacherId, page, limit, sortBy, sortOrder } = queryParams;
    return classRepository.findWithPagination({
      search,
      status,
      teacherId,
      page,
      limit,
      sortBy,
      sortOrder
    });
  }

  /**
   * Get single class details by ID
   */
  async getClassById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Class ID format');
    }

    const classItem = await classRepository.findById(id);
    if (!classItem) {
      throw ApiError.notFound('Class not found');
    }

    return classItem;
  }

  /**
   * Create new class register
   */
  async createClass(payload) {
    const normalized = this.normalizePayload(payload);

    if (!normalized.className) {
      throw ApiError.badRequest('Class name (className) is required');
    }
    if (!normalized.classCode) {
      throw ApiError.badRequest('Class code (classCode) is required');
    }
    if (normalized.capacity === undefined || isNaN(normalized.capacity) || normalized.capacity <= 0) {
      throw ApiError.badRequest('Capacity must be a positive number');
    }
    if (!normalized.roomNumber) {
      throw ApiError.badRequest('Room number (roomNumber) is required');
    }

    // Check unique class code
    const existingCode = await classRepository.findByCode(normalized.classCode);
    if (existingCode) {
      throw ApiError.conflict(`Class code '${normalized.classCode}' already exists`);
    }

    // Verify teacher if teacherId provided
    if (normalized.teacherId && mongoose.Types.ObjectId.isValid(normalized.teacherId)) {
      const teacherExists = await User.findById(normalized.teacherId);
      if (!teacherExists) {
        normalized.teacherId = null;
      }
    } else {
      normalized.teacherId = null;
    }

    return classRepository.create(normalized);
  }

  /**
   * Update existing class register
   */
  async updateClass(id, payload) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Class ID format');
    }

    const existingClass = await classRepository.findById(id);
    if (!existingClass) {
      throw ApiError.notFound('Class not found');
    }

    const normalized = this.normalizePayload(payload);

    // If updating classCode, verify uniqueness
    if (normalized.classCode && normalized.classCode !== existingClass.classCode) {
      const duplicateCode = await classRepository.findByCode(normalized.classCode, id);
      if (duplicateCode) {
        throw ApiError.conflict(`Class code '${normalized.classCode}' already exists on another class`);
      }
    }

    // Verify teacher if teacherId provided
    if (normalized.teacherId && mongoose.Types.ObjectId.isValid(normalized.teacherId)) {
      const teacherExists = await User.findById(normalized.teacherId);
      if (!teacherExists) {
        normalized.teacherId = null;
      }
    } else {
      normalized.teacherId = null;
    }

    const updateData = {};
    if (normalized.className !== undefined) updateData.className = normalized.className;
    if (normalized.classCode !== undefined) updateData.classCode = normalized.classCode;
    if (normalized.capacity !== undefined) updateData.capacity = normalized.capacity;
    if (normalized.roomNumber !== undefined) updateData.roomNumber = normalized.roomNumber;
    if (normalized.teacherId !== undefined) updateData.teacherId = normalized.teacherId;
    if (normalized.status !== undefined) updateData.status = normalized.status;

    return classRepository.updateById(id, updateData);
  }

  /**
   * Soft delete class register
   */
  async deleteClass(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Class ID format');
    }

    const existingClass = await classRepository.findById(id);
    if (!existingClass) {
      throw ApiError.notFound('Class not found');
    }

    return classRepository.softDelete(id);
  }
}

module.exports = new ClassService();
