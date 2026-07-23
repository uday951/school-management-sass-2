const express = require('express');
const classController = require('./class.controller');
const {
  createClassRules,
  updateClassRules,
  classIdParamRule,
  getClassQueryRules
} = require('./class.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

router
  .route('/')
  .get(getClassQueryRules, validate, classController.getClasses)
  .post(createClassRules, validate, classController.createClass);

router
  .route('/:id')
  .get(classIdParamRule, validate, classController.getClassById)
  .put(updateClassRules, validate, classController.updateClass)
  .delete(classIdParamRule, validate, classController.deleteClass);

module.exports = router;
