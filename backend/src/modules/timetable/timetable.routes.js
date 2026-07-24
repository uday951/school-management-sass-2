const express = require('express');

const { optionalAuthenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const ROLES = require('../../constants/roles');

const timetableController = require('./timetable.controller');

const {
  createPeriodRules,
  updatePeriodRules,
  createTimetableRules,
  updateTimetableRules,
  createRoomRules,
  updateRoomRules,
  createSubjectAllocationRules,
  updateSubjectAllocationRules,
  createSubstituteRules,
  updateSubstituteRules
} = require('./timetable.validator');

const router = express.Router();

// ─── PERIOD ROUTES ────────────────────────────────────────────────────────────

router.get(
  '/periods',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  timetableController.getPeriods
);

router.post(
  '/periods',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createPeriodRules,
  validate,
  timetableController.createPeriod
);

router.put(
  '/periods/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updatePeriodRules,
  validate,
  timetableController.updatePeriod
);

router.delete(
  '/periods/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  timetableController.deletePeriod
);

// ─── TIMETABLE ROUTES ─────────────────────────────────────────────────────────

router.get(
  '/timetables',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT),
  timetableController.getTimetables
);

router.post(
  '/timetables',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createTimetableRules,
  validate,
  timetableController.createTimetable
);

router.put(
  '/timetables/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateTimetableRules,
  validate,
  timetableController.updateTimetable
);

router.delete(
  '/timetables/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  timetableController.deleteTimetable
);

// ─── ROOM ROUTES ──────────────────────────────────────────────────────────────

router.get(
  '/rooms',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  timetableController.getRooms
);

router.post(
  '/rooms',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createRoomRules,
  validate,
  timetableController.createRoom
);

router.put(
  '/rooms/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateRoomRules,
  validate,
  timetableController.updateRoom
);

router.delete(
  '/rooms/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  timetableController.deleteRoom
);

// ─── SUBJECT ALLOCATION ROUTES ────────────────────────────────────────────────

router.get(
  '/subject-allocation',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  timetableController.getSubjectAllocations
);

router.post(
  '/subject-allocation',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createSubjectAllocationRules,
  validate,
  timetableController.createSubjectAllocation
);

router.put(
  '/subject-allocation/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateSubjectAllocationRules,
  validate,
  timetableController.updateSubjectAllocation
);

router.delete(
  '/subject-allocation/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  timetableController.deleteSubjectAllocation
);

// ─── SUBSTITUTE TEACHER ROUTES ────────────────────────────────────────────────

router.get(
  '/substitutes',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  timetableController.getSubstitutes
);

router.post(
  '/substitutes',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createSubstituteRules,
  validate,
  timetableController.createSubstitute
);

router.put(
  '/substitutes/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateSubstituteRules,
  validate,
  timetableController.updateSubstitute
);

router.delete(
  '/substitutes/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  timetableController.deleteSubstitute
);

module.exports = router;
