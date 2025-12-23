// controllers/attendsController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.attend = asyncHandler(async (req, res) => {
  const { studentID, eventID } = req.body;
  await db.query('INSERT INTO Attends (studentID, eventID) VALUES (?, ?)', [studentID, eventID]);
  res.json({ success: true, message: 'Attending' });
});

exports.removeAttend = asyncHandler(async (req, res) => {
  const { studentID, eventID } = req.params;
  await db.query('DELETE FROM Attends WHERE studentID = ? AND eventID = ?', [studentID, eventID]);
  res.json({ success: true, message: 'Removed' });
});

exports.getEventAttendees = asyncHandler(async (req, res) => {
  const { eventID } = req.params;
  const [attendees] = await db.query(
    `SELECT a.studentID, CONCAT(s.firstName, ' ', s.lastName) as name, s.universityMail as email
     FROM Attends a
     JOIN Student s ON a.studentID = s.studentID
     WHERE a.eventID = ?`,
    [eventID]
  );
  res.json({ success: true, data: attendees });
});