// controllers/professorController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const Professor = require('../models/professorModel');

exports.createProfessor = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, officeHours = null, officeLocation = null, facultyName = null, password = null } = req.body;
  const [result] = await db.query(Professor.insert, [firstName, lastName, email, officeHours, officeLocation, facultyName, password]);
  const [rows] = await db.query(Professor.selectById, [result.insertId]);
  res.status(201).json({ success: true, data: rows[0] });
});

exports.getProfessor = asyncHandler(async (req, res) => {
  const [rows] = await db.query(Professor.selectById, [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Professor not found' });
  res.json({ success: true, data: rows[0] });
});

exports.listProfessors = asyncHandler(async (req, res) => {
  const [rows] = await db.query(Professor.selectAll);
  res.json({ success: true, data: rows });
});

exports.updateProfessor = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updates = [];
  const params = [];
  for (const key of ['firstName','lastName','phoneNumber','officeHours','officeLocation','facultyName']) {
    if (req.body[key] !== undefined) {
      // Convert empty strings to null, keep other values as-is
      let value = req.body[key];
      if (value === '' || value === null || value === undefined) {
        value = null;
      } else {
        // Ensure phoneNumber is always a string (not a number)
        if (key === 'phoneNumber') {
          value = String(value).trim();
        }
      }
      updates.push(`${key} = ?`);
      params.push(value);
    }
  }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });
  params.push(id);
  const sql = `UPDATE Professor SET ${updates.join(', ')} WHERE professorID = ?`;
  try {
    await db.query(sql, params);
    const [rows] = await db.query(Professor.selectById, [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Update professor error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    // Return a more helpful error message
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.code === 'ER_WRONG_VALUE_FOR_TYPE') {
      return res.status(400).json({ success: false, message: `Invalid value for one of the fields: ${err.message}` });
    }
    throw err;
  }
});

exports.deleteProfessor = asyncHandler(async (req, res) => {
  await db.query(Professor.deleteById, [req.params.id]);
  res.json({ success: true, message: 'Professor deleted' });
});

// Get applications for professor's projects
exports.getProjectApplications = asyncHandler(async (req, res) => {
  const professorID = req.params.id;
  const [rows] = await db.query(
    `SELECT c.studentID, c.projectID, c.appliedDate, c.status,
     s.firstName as studentFirstName, s.lastName as studentLastName, s.universityMail as studentEmail, s.major, s.departmentName,
     rp.title as projectTitle
     FROM Conducts c
     JOIN Student s ON c.studentID = s.studentID
     JOIN ResearchProject rp ON c.projectID = rp.projectID
     WHERE rp.professorID = ?`,
    [professorID]
  );
  res.json({ success: true, data: rows });
});

// Get professor statistics (active projects and total students)
exports.getProfessorStats = asyncHandler(async (req, res) => {
  const professorID = req.params.id;
  
  // Get count of active projects
  const [projectRows] = await db.query(
    'SELECT COUNT(*) as count FROM ResearchProject WHERE professorID = ?',
    [professorID]
  );
  const activeProjects = projectRows[0]?.count || 0;
  
  // Get count of students who have applied to professor's projects
  const [studentRows] = await db.query(
    `SELECT COUNT(DISTINCT c.studentID) as count 
     FROM Conducts c
     JOIN ResearchProject rp ON c.projectID = rp.projectID
     WHERE rp.professorID = ?`,
    [professorID]
  );
  const totalStudents = studentRows[0]?.count || 0;
  
  res.json({ success: true, data: { activeProjects, totalStudents } });
});