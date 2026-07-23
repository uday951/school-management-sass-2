const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError.util');

/**
 * Express-validator result checker middleware.
 * Must be placed after express-validator rule arrays in route chains.
 * If validation errors exist, throws a structured ApiError.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path || err.param,
      issue: err.msg
    }));
    return next(ApiError.validationFailed(details));
  }

  next();
};

module.exports = { validate };
