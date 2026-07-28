const { body } = require('express-validator');

const createUserSchema = [
  body('name')
    .notEmpty()
    .withMessage('User name is required')
    .isString(),
  body('email')
    .notEmpty()
    .withMessage('User email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
];

const roleSchema = [
  body('name')
    .notEmpty()
    .withMessage('Role name is required')
    .isString()
];

const departmentSchema = [
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .isString()
];

const designationSchema = [
  body('name')
    .notEmpty()
    .withMessage('Designation name is required')
    .isString()
];

const systemSettingsSchema = [
  body('schoolName')
    .notEmpty()
    .withMessage('School Name is required')
];

const restoreSchema = [
  body('fileName')
    .notEmpty()
    .withMessage('Backup file name is required to execute restore')
];

module.exports = {
  createUserSchema,
  roleSchema,
  departmentSchema,
  designationSchema,
  systemSettingsSchema,
  restoreSchema
};
