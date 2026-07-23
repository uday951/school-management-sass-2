const Subject = require('./subject.model');

class SubjectRepository {
  /**
   * Find subjects with search, department filter, status filter, sorting, and pagination
   */
  async findWithPagination({ search, department, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = { isDeleted: false };

    // Search by subjectName or subjectCode
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      query.$or = [{ subjectName: regex }, { subjectCode: regex }];
    }

    // Filter by department
    if (department) {
      query.department = new RegExp(`^${department.trim()}$`, 'i');
    }

    // Filter by status
    if (status) {
      query.status = new RegExp(`^${status.trim()}$`, 'i');
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (currentPage - 1) * perPage;

    const sortField = sortBy === 'name' ? 'subjectName' : sortBy === 'code' ? 'subjectCode' : sortBy;
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const [data, total] = await Promise.all([
      Subject.find(query)
        .populate('teacher', 'name email department role')
        .populate('classes', 'className classCode roomNumber capacity status')
        .sort(sort)
        .skip(skip)
        .limit(perPage)
        .exec(),
      Subject.countDocuments(query)
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
   * Find single subject by ID
   */
  async findById(id) {
    return Subject.findOne({ _id: id, isDeleted: false })
      .populate('teacher', 'name email department role')
      .populate('classes', 'className classCode roomNumber capacity status')
      .exec();
  }

  /**
   * Find subject by subjectCode (for uniqueness check)
   */
  async findByCode(subjectCode, excludeId = null) {
    const query = {
      subjectCode: new RegExp(`^${subjectCode.trim()}$`, 'i'),
      isDeleted: false
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return Subject.findOne(query).exec();
  }

  /**
   * Create new subject
   */
  async create(subjectData) {
    const newSubject = new Subject(subjectData);
    return newSubject.save();
  }

  /**
   * Update existing subject by ID
   */
  async updateById(id, updateData) {
    return Subject.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, {
      new: true,
      runValidators: true
    })
      .populate('teacher', 'name email department role')
      .populate('classes', 'className classCode roomNumber capacity status');
  }

  /**
   * Update subject status (Enable / Disable)
   */
  async updateStatus(id, newStatus) {
    return Subject.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status: newStatus },
      { new: true, runValidators: true }
    )
      .populate('teacher', 'name email department role')
      .populate('classes', 'className classCode roomNumber capacity status');
  }

  /**
   * Update teacher and class assignments
   */
  async updateAssignments(id, teacher, classes) {
    const updateData = {};
    if (teacher !== undefined) updateData.teacher = teacher;
    if (classes !== undefined) updateData.classes = classes;

    return Subject.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, {
      new: true,
      runValidators: true
    })
      .populate('teacher', 'name email department role')
      .populate('classes', 'className classCode roomNumber capacity status');
  }

  /**
   * Soft delete subject by ID
   */
  async softDelete(id) {
    return Subject.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' },
      { new: true }
    );
  }
}

module.exports = new SubjectRepository();
