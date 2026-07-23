const express = require('express');
const subjectController = require('./subject.controller');
const {
  createSubjectRules,
  updateSubjectRules,
  subjectIdParamRule,
  getSubjectQueryRules,
  assignSubjectRules,
  toggleStatusRules
} = require('./subject.validator');
const { validate } = require('../../middlewares/validation.middleware');

const router = express.Router();

router
  .route('/')
  .get(getSubjectQueryRules, validate, subjectController.getSubjects)
  .post(createSubjectRules, validate, subjectController.createSubject);

router
  .route('/:id')
  .get(subjectIdParamRule, validate, subjectController.getSubjectById)
  .put(updateSubjectRules, validate, subjectController.updateSubject)
  .delete(subjectIdParamRule, validate, subjectController.deleteSubject);

router
  .route('/:id/status')
  .patch(toggleStatusRules, validate, subjectController.toggleSubjectStatus);

router
  .route('/:id/assign')
  .put(assignSubjectRules, validate, subjectController.assignSubjectDetails);

module.exports = router;
