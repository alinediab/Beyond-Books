// controllers/managesController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.add = asyncHandler(async (req, res) => {
  const { studentAffairsOfficerID, recordID } = req.body;
  await db.query('INSERT INTO Manages (studentAffairsOfficerID, recordID) VALUES (?, ?)', [studentAffairsOfficerID, recordID]);
  res.json({ success: true, message: 'Added' });
});

exports.remove = asyncHandler(async (req, res) => {
  const { studentAffairsOfficerID, recordID } = req.params;
  await db.query('DELETE FROM Manages WHERE studentAffairsOfficerID = ? AND recordID = ?', [studentAffairsOfficerID, recordID]);
  res.json({ success: true, message: 'Removed' });
});
