const express = require('express');
const attendanceController = require('./attendance.controller');
const { createHolidaySchema } = require('./attendance.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

router.get('/', attendanceController.getHolidays);
router.post('/', createHolidaySchema, validate, attendanceController.createHoliday);

module.exports = router;
