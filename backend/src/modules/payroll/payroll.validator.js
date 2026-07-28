const { body } = require('express-validator');

const salaryStructureSchema = [
  body('name')
    .notEmpty()
    .withMessage('Salary Structure Name is required')
    .isString()
    .withMessage('Name must be a string'),
  body('basicSalary')
    .notEmpty()
    .withMessage('Basic Salary is required')
    .isNumeric()
    .withMessage('Basic Salary must be a number')
];

const salaryComponentSchema = [
  body('name')
    .notEmpty()
    .withMessage('Component Name is required'),
  body('type')
    .isIn(['earning', 'deduction'])
    .withMessage('Type must be earning or deduction'),
  body('calculationType')
    .isIn(['fixed', 'percentage'])
    .withMessage('Calculation Type must be fixed or percentage'),
  body('value')
    .isNumeric()
    .withMessage('Value must be a numeric value')
];

const employeeSalarySchema = [
  body('teacherId')
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isMongoId()
    .withMessage('Invalid Teacher ID format'),
  body('salaryStructureId')
    .notEmpty()
    .withMessage('Salary Structure ID is required')
    .isMongoId()
    .withMessage('Invalid Salary Structure ID format')
];

const generatePayrollSchema = [
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12'),
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be a valid calendar year')
];

const dynamicAdditionSchema = [
  body('teacherId')
    .isMongoId()
    .withMessage('Invalid Teacher ID format'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('type')
    .notEmpty()
    .withMessage('Type is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
];

module.exports = {
  salaryStructureSchema,
  salaryComponentSchema,
  employeeSalarySchema,
  generatePayrollSchema,
  dynamicAdditionSchema
};
