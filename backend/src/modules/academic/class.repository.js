const Class = require('./class.model');

class ClassRepository {
  /**
   * Find classes with search, filter, sorting, and pagination
   */
  async findWithPagination({ search, status, teacherId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = { isDeleted: false };

    // Search by className or classCode
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      query.$or = [{ className: regex }, { classCode: regex }];
    }

    // Filter by status
    if (status) {
      query.status = new RegExp(`^${status}$`, 'i');
    }

    // Filter by teacherId
    if (teacherId) {
      query.teacherId = teacherId;
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (currentPage - 1) * perPage;

    const sortField = sortBy === 'name' ? 'className' : sortBy === 'code' ? 'classCode' : sortBy;
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const [data, total] = await Promise.all([
      Class.find(query)
        .populate('teacherId', 'name email department role')
        .sort(sort)
        .skip(skip)
        .limit(perPage)
        .exec(),
      Class.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      pagination: {
        currentPage,
        totalPages,
        totalCount: total,
        limit: perPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    };
  }

  /**
   * Find single class by ID
   */
  async findById(id) {
    return Class.findOne({ _id: id, isDeleted: false })
      .populate('teacherId', 'name email department role')
      .exec();
  }

  /**
   * Find class by classCode (for uniqueness check)
   */
  async findByCode(classCode, excludeId = null) {
    const query = {
      classCode: new RegExp(`^${classCode.trim()}$`, 'i'),
      isDeleted: false
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return Class.findOne(query).exec();
  }

  /**
   * Create new class
   */
  async create(classData) {
    const newClass = new Class(classData);
    return newClass.save();
  }

  /**
   * Update existing class by ID
   */
  async updateById(id, updateData) {
    return Class.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, {
      new: true,
      runValidators: true
    }).populate('teacherId', 'name email department role');
  }

  /**
   * Soft delete class by ID
   */
  async softDelete(id) {
    return Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' },
      { new: true }
    );
  }
}

module.exports = new ClassRepository();
