/**
 * Build a MongoDB $or $regex search query across multiple fields.
 *
 * @param {string} searchTerm  - Incoming search string from query param
 * @param {string[]} fields    - Array of field names to search across
 * @returns {Object|null}      - Mongoose-compatible $or filter or null
 */
const buildSearchQuery = (searchTerm, fields = []) => {
  if (!searchTerm || !fields.length) return null;

  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedTerm, 'i');

  return {
    $or: fields.map((field) => ({ [field]: regex }))
  };
};

/**
 * Build a sort object from a sort query string.
 * Prefix field with '-' for descending order.
 * e.g., '-createdAt' → { createdAt: -1 }
 *
 * @param {string} sortStr - Sort query string, e.g. '-createdAt' or 'lastName'
 */
const buildSortQuery = (sortStr = '-createdAt') => {
  if (sortStr.startsWith('-')) {
    return { [sortStr.slice(1)]: -1 };
  }
  return { [sortStr]: 1 };
};

/**
 * Sanitize query params into a safe Mongoose filter object.
 * Strips keys starting with '$' to prevent operator injection.
 *
 * @param {Object} queryParams - Raw query parameters object
 * @param {string[]} allowedKeys - Whitelist of permitted filter keys
 */
const buildFilterQuery = (queryParams = {}, allowedKeys = []) => {
  const filter = {};
  allowedKeys.forEach((key) => {
    if (queryParams[key] !== undefined && queryParams[key] !== '') {
      filter[key] = queryParams[key];
    }
  });
  return filter;
};

module.exports = { buildSearchQuery, buildSortQuery, buildFilterQuery };
