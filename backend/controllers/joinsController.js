// controllers/joinsController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.joinClub = asyncHandler(async (req, res) => {
  const { studentID, clubID, joinDate = null, role = null } = req.body;
  await db.query('INSERT INTO Joins (studentID, clubID, joinDate, role) VALUES (?, ?, ?, ?)', [studentID, clubID, joinDate, role]);
  res.json({ success: true, message: 'Joined' });
});

exports.removeJoin = asyncHandler(async (req, res) => {
  const { studentID, clubID } = req.params;
  await db.query('DELETE FROM Joins WHERE studentID = ? AND clubID = ?', [studentID, clubID]);
  res.json({ success: true, message: 'Removed' });
});

exports.getClubMembers = asyncHandler(async (req, res) => {
  const { clubID } = req.params;
  const [members] = await db.query(
    `SELECT j.studentID, COALESCE(j.joinDate, CURDATE()) as joinDate, j.role, 
            CONCAT(s.firstName, ' ', s.lastName) as name, 
            s.universityMail as email 
     FROM Joins j 
     JOIN Student s ON j.studentID = s.studentID 
     WHERE j.clubID = ?`,
    [clubID]
  );
  res.json({ success: true, data: members });
});