// controllers/semesterController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { createCRUDController } = require('./baseController');

const semesterController = createCRUDController({
  tableName: 'Semester',
  idField: 'semesterID',
  selectFields: 'semesterID, year, semesterName, startDate, endDate',
  insertFields: ['year', 'semesterName', 'startDate', 'endDate'],
  allowedUpdateFields: ['year', 'semesterName', 'startDate', 'endDate'],
  resourceName: 'Semester'
});

exports.createSemester = semesterController.create;
exports.getSemester = semesterController.get;
exports.listSemesters = semesterController.list;
exports.updateSemester = semesterController.update;
exports.deleteSemester = semesterController.delete;

