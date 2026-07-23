const { body, param, query } = require('express-validator');

const createInstitutionRules = [
  body('name').trim().notEmpty().withMessage('School Name is required'),
  body('code').trim().notEmpty().withMessage('School Code is required'),
  body('affiliationNumber').trim().notEmpty().withMessage('Affiliation Number is required'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration Number is required'),
  body('establishedYear')
    .notEmpty()
    .withMessage('Established Year is required')
    .isInt({ min: 1000, max: 2026 })
    .withMessage('Established Year must be a 4-digit year between 1000 and 2026'),
  body('type')
    .optional()
    .isIn(['co-educational', 'boys', 'girls', 'other'])
    .withMessage('Invalid School Type'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('mobile').optional().trim(),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('website').trim().notEmpty().withMessage('Website URL is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('pinCode').trim().notEmpty().withMessage('PIN Code is required'),
  body('address').trim().notEmpty().withMessage('Full Address is required'),
  body('principalName').trim().notEmpty().withMessage('Principal Name is required'),
  body('principalContact').trim().notEmpty().withMessage('Principal Contact is required'),
  body('principalEmail')
    .trim()
    .notEmpty()
    .withMessage('Principal Email is required')
    .isEmail()
    .withMessage('Invalid principal email format')
];

const updateInstitutionRules = [
  param('id').isMongoId().withMessage('Invalid Institution ID'),
  body('name').optional().trim().notEmpty().withMessage('School Name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('School Code cannot be empty'),
  body('affiliationNumber').optional().trim().notEmpty(),
  body('registrationNumber').optional().trim().notEmpty(),
  body('establishedYear').optional().isInt({ min: 1000, max: 2026 }).withMessage('Invalid established year'),
  body('type').optional().isIn(['co-educational', 'boys', 'girls', 'other']),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().trim().isEmail().withMessage('Invalid email format'),
  body('website').optional().trim().notEmpty(),
  body('country').optional().trim().notEmpty(),
  body('state').optional().trim().notEmpty(),
  body('city').optional().trim().notEmpty(),
  body('pinCode').optional().trim().notEmpty(),
  body('address').optional().trim().notEmpty(),
  body('principalName').optional().trim().notEmpty(),
  body('principalContact').optional().trim().notEmpty(),
  body('principalEmail').optional().trim().isEmail().withMessage('Invalid principal email format')
];

const campusValidationRules = [
  body('name').trim().notEmpty().withMessage('Campus Name is required'),
  body('code').trim().notEmpty().withMessage('Campus Code is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('principal').trim().notEmpty().withMessage('Principal Name is required'),
  body('contactNumber').trim().notEmpty().withMessage('Contact Number is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
];

const updateCampusRules = [
  param('id').isMongoId().withMessage('Invalid Campus ID'),
  body('name').optional().trim().notEmpty().withMessage('Campus Name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Campus Code cannot be empty'),
  body('address').optional().trim().notEmpty(),
  body('principal').optional().trim().notEmpty(),
  body('contactNumber').optional().trim().notEmpty(),
  body('email').optional().trim().isEmail().withMessage('Invalid email format'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
];

module.exports = {
  createInstitutionRules,
  updateInstitutionRules,
  campusValidationRules,
  updateCampusRules
};
