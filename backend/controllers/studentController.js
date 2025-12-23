// controllers/studentController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const Student = require('../models/studentModel');

exports.createStudent = asyncHandler(async (req, res) => {
  const { firstName, lastName, universityMail, phoneNumber = null, major = null, departmentName = null, password = null } = req.body;
  const [result] = await db.query(Student.insert, [firstName, lastName, universityMail, phoneNumber, major, departmentName, password]);
  const insertedId = result.insertId;
  const [rows] = await db.query(Student.selectById, [insertedId]);
  res.status(201).json({ success: true, data: rows[0] });
});

exports.getStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query(Student.selectById, [id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, data: rows[0] });
});

exports.listStudents = asyncHandler(async (req, res) => {
  const [rows] = await db.query(Student.selectAll, []);
  res.json({ success: true, data: rows });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  // allow only certain fields
  const updates = [];
  const params = [];
  for (const key of ['firstName','lastName','phoneNumber','major','departmentName']) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });
  params.push(id);
  const sql = `UPDATE Student SET ${updates.join(', ')} WHERE studentID = ?`;
  await db.query(sql, params);
  const [rows] = await db.query(Student.selectById, [id]);
  res.json({ success: true, data: rows[0] });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await db.query(Student.deleteById, [id]);
  res.json({ success: true, message: 'Student deleted' });
});

exports.joinClub = asyncHandler(async (req, res) => {
  const studentID = req.params.id;
  const { clubID, joinDate = null, role = null } = req.body;
  await db.query('INSERT INTO Joins (studentID, clubID, joinDate, role) VALUES (?, ?, ?, ?)', [studentID, clubID, joinDate, role]);
  res.json({ success: true, message: 'Joined club' });
});

exports.attendEvent = asyncHandler(async (req, res) => {
  const studentID = req.params.id;
  const { eventID } = req.body;
  await db.query('INSERT INTO Attends (studentID, eventID) VALUES (?, ?)', [studentID, eventID]);
  res.json({ success: true, message: 'Marked as attending' });
});

exports.listApplications = asyncHandler(async (req, res) => {
  const studentID = req.params.id;
  const [rows] = await db.query(Student.selectApplications, [studentID]);
  res.json({ success: true, data: rows });
});

exports.getJoinedClubs = asyncHandler(async (req, res) => {
  const studentID = req.params.id;
  const [rows] = await db.query(
    `SELECT j.clubID, j.joinDate, j.role, c.clubName, c.description, c.meetingLocation,
     (SELECT COUNT(*) FROM Joins WHERE clubID = c.clubID) as memberCount
     FROM Joins j
     JOIN Club c ON j.clubID = c.clubID
     WHERE j.studentID = ?`,
    [studentID]
  );
  res.json({ success: true, data: rows });
});

exports.getAttendedEvents = asyncHandler(async (req, res) => {
  const studentID = req.params.id;
  const [rows] = await db.query(
    `SELECT a.eventID, e.eventName, e.eventDescription, e.eventDate, e.location,
     (SELECT COUNT(*) FROM Attends WHERE eventID = e.eventID) as attendeeCount
     FROM Attends a
     JOIN Event e ON a.eventID = e.eventID
     WHERE a.studentID = ? AND e.eventDate >= CURDATE()
     ORDER BY e.eventDate ASC`,
    [studentID]
  );
  res.json({ success: true, data: rows });
});

exports.getResearchApplications = asyncHandler(async (req, res) => {
  const studentID = req.params.id;
  const [rows] = await db.query(
    `SELECT c.projectID, c.appliedDate, c.status,
     rp.title, rp.description, rp.professorID,
     p.firstName as professorFirstName, p.lastName as professorLastName, p.facultyName
     FROM Conducts c
     JOIN ResearchProject rp ON c.projectID = rp.projectID
     JOIN Professor p ON rp.professorID = p.professorID
     WHERE c.studentID = ?`,
    [studentID]
  );
  res.json({ success: true, data: rows });
});

// Get student statistics (active projects, clubs joined, achievements)
exports.getStudentStats = asyncHandler(async (req, res) => {
  const studentID = req.params.id;
  
  console.log('[getStudentStats] Fetching stats for studentID:', studentID);

  try {
    // Count active projects (approved research projects)
    const [activeProjectsRows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM Conducts 
       WHERE studentID = ? AND status = 'approved'`,
      [studentID]
    );
    const activeProjects = Number(activeProjectsRows[0]?.count) || 0;
    console.log('[getStudentStats] Active projects:', activeProjects);

    // Count clubs joined
    const [clubsRows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM Joins 
       WHERE studentID = ?`,
      [studentID]
    );
    const clubsJoined = Number(clubsRows[0]?.count) || 0;
    console.log('[getStudentStats] Clubs joined:', clubsJoined);

    // Count achievements (for now, using events attended as achievements)
    // You can change this to a proper achievements table if one exists
    const [achievementsRows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM Attends a
       JOIN Event e ON a.eventID = e.eventID
       WHERE a.studentID = ? AND e.eventDate < CURDATE()`,
      [studentID]
    );
    const achievements = Number(achievementsRows[0]?.count) || 0;
    console.log('[getStudentStats] Achievements:', achievements);

    const stats = {
      activeProjects,
      clubsJoined,
      achievements
    };

    console.log('[getStudentStats] Final stats:', stats);

    res.json({ 
      success: true, 
      data: stats
    });
  } catch (error) {
    console.error('[getStudentStats] Error:', error);
    throw error;
  }
});
