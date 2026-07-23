const Campus = require('./campus.model');
const ApiError = require('../../utils/apiError.util');
const { paginate } = require('../../utils/pagination.util');
const { buildSearchQuery, buildSortQuery, buildFilterQuery } = require('../../utils/search.util');

/**
 * Get paginated list of Campuses with search, filter, and sorting.
 *
 * @param {Object} queryParams - Express req.query object
 * @param {string} tenantId - Tenant identifier
 */
const getCampuses = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 10, search = '', sort = '-createdAt', status } = queryParams;

  // Base filter with multi-tenant scoping
  const filter = { tenantId };

  // Apply status filtering
  const statusFilter = buildFilterQuery({ status }, ['status']);
  Object.assign(filter, statusFilter);

  // Apply search query across name, code, principal, and email fields
  const searchQuery = buildSearchQuery(search, ['name', 'code', 'principal', 'email']);
  if (searchQuery) {
    Object.assign(filter, searchQuery);
  }

  // Calculate pagination offset and totals
  const total = await Campus.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  // Fetch record set
  const data = await Campus.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return {
    data,
    pagination: pagination.meta
  };
};

/**
 * Get single Campus by ID.
 *
 * @param {string} id - Campus ObjectId
 * @param {string} tenantId - Tenant identifier
 */
const getCampusById = async (id, tenantId = 'default_tenant') => {
  const campus = await Campus.findOne({ _id: id, tenantId });
  if (!campus) {
    throw ApiError.notFound('Campus record not found.');
  }
  return campus;
};

/**
 * Create a new Campus.
 *
 * @param {Object} data - Campus details
 * @param {string} tenantId - Tenant identifier
 */
const createCampus = async (data, tenantId = 'default_tenant') => {
  const existingCode = await Campus.findOne({ tenantId, code: data.code.toUpperCase() });
  if (existingCode) {
    throw ApiError.conflict(`Campus with code '${data.code}' already exists.`);
  }

  const campus = await Campus.create({
    ...data,
    tenantId,
    code: data.code.toUpperCase()
  });

  return campus;
};

/**
 * Update an existing Campus.
 *
 * @param {string} id - Campus ObjectId
 * @param {Object} data - Field updates
 * @param {string} tenantId - Tenant identifier
 */
const updateCampus = async (id, data, tenantId = 'default_tenant') => {
  const campus = await Campus.findOne({ _id: id, tenantId });
  if (!campus) {
    throw ApiError.notFound('Campus record not found.');
  }

  if (data.code && data.code.toUpperCase() !== campus.code) {
    const existingCode = await Campus.findOne({ tenantId, code: data.code.toUpperCase() });
    if (existingCode) {
      throw ApiError.conflict(`Campus with code '${data.code}' already exists.`);
    }
  }

  Object.assign(campus, data);
  if (data.code) campus.code = data.code.toUpperCase();
  await campus.save();

  return campus;
};

/**
 * Toggle Campus status between 'active' and 'inactive'.
 *
 * @param {string} id - Campus ObjectId
 * @param {string} status - New status ('active' | 'inactive')
 * @param {string} tenantId - Tenant identifier
 */
const toggleCampusStatus = async (id, status, tenantId = 'default_tenant') => {
  const campus = await Campus.findOne({ _id: id, tenantId });
  if (!campus) {
    throw ApiError.notFound('Campus record not found.');
  }

  const newStatus = status || (campus.status === 'active' ? 'inactive' : 'active');
  campus.status = newStatus;
  await campus.save();

  return campus;
};

/**
 * Delete a Campus.
 *
 * @param {string} id - Campus ObjectId
 * @param {string} tenantId - Tenant identifier
 */
const deleteCampus = async (id, tenantId = 'default_tenant') => {
  const campus = await Campus.findOne({ _id: id, tenantId });
  if (!campus) {
    throw ApiError.notFound('Campus record not found.');
  }

  await Campus.deleteOne({ _id: id, tenantId });
  return true;
};

module.exports = {
  getCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  toggleCampusStatus,
  deleteCampus
};
