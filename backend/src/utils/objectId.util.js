const mongoose = require('mongoose');

/**
 * Check if a given string is a valid MongoDB ObjectId.
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert a string to a Mongoose ObjectId.
 * @param {string} id
 * @returns {mongoose.Types.ObjectId}
 */
const toObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

module.exports = { isValidObjectId, toObjectId };
