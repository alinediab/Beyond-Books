// controllers/appliesController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.apply = asyncHandler(async (req, res) => {
  const { studentID, internshipID, status = 'pending' } = req.body;
  const [exists] = await db.query('SELECT * FROM Applies WHERE studentID = ? AND internshipID = ?', [studentID, internshipID]);
  if (exists.length) return res.status(400).json({ success: false, message: 'Already applied' });
  await db.query('INSERT INTO Applies (studentID, internshipID, applicationDate, status) VALUES (?, ?, CURDATE(), ?)', [studentID, internshipID, status]);
  res.json({ success: true, message: 'Applied' });
});

exports.withdraw = asyncHandler(async (req, res) => {
  const { studentID, internshipID } = req.params;
  await db.query('DELETE FROM Applies WHERE studentID = ? AND internshipID = ?', [studentID, internshipID]);
  res.json({ success: true, message: 'Withdrawn' });
});

exports.listByStudent = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT a.*, i.companyName FROM Applies a JOIN Internship i ON a.internshipID = i.internshipID WHERE a.studentID = ?', [req.params.studentID]);
  res.json({ success: true, data: rows });
});
