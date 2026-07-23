const express = require('express');

const { optionalAuthenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { uploadImage, handleMulterError } = require('../../middlewares/upload.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const ROLES = require('../../constants/roles');

const institutionController = require('./institution.controller');
const campusController = require('./campus.controller');

const {
  createInstitutionRules,
  updateInstitutionRules,
  campusValidationRules,
  updateCampusRules
} = require('./school.validation');

const router = express.Router();

// Multer upload config for branding image assets (Logo, Favicon, Banner)
const uploadBrandingAssets = uploadImage.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// ─── INSTITUTION ROUTES ───────────────────────────────────────────────────────

router.get(
  '/institution',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  institutionController.getInstitution
);

router.post(
  '/institution',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadBrandingAssets,
  handleMulterError,
  createInstitutionRules,
  validate,
  institutionController.createInstitution
);

router.put(
  '/institution/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadBrandingAssets,
  handleMulterError,
  updateInstitutionRules,
  validate,
  institutionController.updateInstitution
);

router.delete(
  '/institution/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN),
  institutionController.deleteInstitution
);

// ─── CAMPUS ROUTES ────────────────────────────────────────────────────────────

router.get(
  '/campuses',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  campusController.getCampuses
);

router.get(
  '/campuses/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  campusController.getCampusById
);

router.post(
  '/campuses',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  campusValidationRules,
  validate,
  campusController.createCampus
);

router.put(
  '/campuses/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateCampusRules,
  validate,
  campusController.updateCampus
);

router.patch(
  '/campuses/:id/status',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  campusController.toggleCampusStatus
);

router.delete(
  '/campuses/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  campusController.deleteCampus
);

module.exports = router;

