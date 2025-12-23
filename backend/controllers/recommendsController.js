// controllers/recommendsController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.recommend = asyncHandler(async (req, res) => {
  const { professorID, internshipID } = req.body;
  // Check if already recommended
  const [exists] = await db.query('SELECT * FROM Recommends WHERE professorID = ? AND internshipID = ?', [professorID, internshipID]);
  if (exists.length) {
    return res.status(400).json({ success: false, message: 'Already recommended' });
  }
  await db.query('INSERT INTO Recommends (professorID, internshipID) VALUES (?, ?)', [professorID, internshipID]);
  res.json({ success: true, message: 'Recommended' });
});

exports.remove = asyncHandler(async (req, res) => {
  const { professorID, internshipID } = req.params;
  await db.query('DELETE FROM Recommends WHERE professorID = ? AND internshipID = ?', [professorID, internshipID]);
  res.json({ success: true, message: 'Removed' });
});

// Get all recommendations (for studentAffair to see all recommendations)
exports.list = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.professorID, r.internshipID,
     p.firstName as professorFirstName, p.lastName as professorLastName,
     i.companyName, i.location, i.startDate, i.endDate, i.duration, i.duration_unit as durationUnit
     FROM Recommends r
     JOIN Professor p ON r.professorID = p.professorID
     JOIN Internship i ON r.internshipID = i.internshipID`
  );
  res.json({ success: true, data: rows });
});
