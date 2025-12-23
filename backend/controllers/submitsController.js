// controllers/submitsController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.submit = asyncHandler(async (req, res) => {
  const { studentID, professorID, submissionDate = null, submissionType = null } = req.body;
  await db.query('INSERT INTO Submits (studentID, professorID, submissionDate, submissionType) VALUES (?, ?, ?, ?)', [studentID, professorID, submissionDate, submissionType]);
  res.json({ success: true, message: 'Submitted' });
});

exports.remove = asyncHandler(async (req, res) => {
  const { studentID, professorID } = req.params;
  await db.query('DELETE FROM Submits WHERE studentID = ? AND professorID = ?', [studentID, professorID]);
  res.json({ success: true, message: 'Removed' });
});
