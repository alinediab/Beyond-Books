// controllers/registerInController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const { studentID, semesterID } = req.body;
  await db.query('INSERT INTO RegisterIn (studentID, semesterID) VALUES (?, ?)', [studentID, semesterID]);
  res.json({ success: true, message: 'Registered in semester' });
});

exports.unregister = asyncHandler(async (req, res) => {
  const { studentID, semesterID } = req.params;
  await db.query('DELETE FROM RegisterIn WHERE studentID = ? AND semesterID = ?', [studentID, semesterID]);
  res.json({ success: true, message: 'Unregistered' });
});
