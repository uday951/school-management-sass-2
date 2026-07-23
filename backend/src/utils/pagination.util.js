/**
 * Calculate pagination metadata and skip offset.
 *
 * @param {number} page  - Current page number (1-indexed)
 * @param {number} limit - Number of items per page
 * @param {number} total - Total count of matching documents
 */
const paginate = (page = 1, limit = 20, total = 0) => {
  const currentPage = Math.max(1, parseInt(page, 10));
  const perPage = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (currentPage - 1) * perPage;
  const totalPages = Math.ceil(total / perPage);

  return {
    skip,
    limit: perPage,
    meta: {
      currentPage,
      totalPages,
      totalCount: total,
      limit: perPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
};

module.exports = { paginate };
