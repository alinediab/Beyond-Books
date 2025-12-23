// controllers/researchProjectController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { createCRUDController } = require('./baseController');

const researchController = createCRUDController({
  tableName: 'ResearchProject',
  idField: 'projectID',
  selectFields: 'projectID, title, description, professorID',
  insertFields: ['title', 'description', 'professorID'],
  allowedUpdateFields: ['title', 'description', 'professorID'],
  resourceName: 'Research Project'
});

// Override list to include professor information
exports.list = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT rp.projectID, rp.title, rp.description, rp.professorID,
     p.firstName as professorFirstName, p.lastName as professorLastName, p.facultyName
     FROM ResearchProject rp
     LEFT JOIN Professor p ON rp.professorID = p.professorID`
  );
  res.json({ success: true, data: rows });
});

// Get projects by professor
exports.getByProfessor = asyncHandler(async (req, res) => {
  const professorID = req.params.id;
  const [rows] = await db.query(
    `SELECT rp.projectID, rp.title, rp.description, rp.professorID,
     p.firstName as professorFirstName, p.lastName as professorLastName, p.facultyName,
     (SELECT COUNT(*) FROM Conducts WHERE projectID = rp.projectID) as applicantCount
     FROM ResearchProject rp
     LEFT JOIN Professor p ON rp.professorID = p.professorID
     WHERE rp.professorID = ?`,
    [professorID]
  );
  res.json({ success: true, data: rows });
});

// Override create to set professorID from authenticated user
exports.create = asyncHandler(async (req, res) => {
  const { title, description, professorID } = req.body;
  const finalProfessorID = parseInt(professorID || req.user?.id, 10);
  
  // Debug logging
  console.log('Creating research project:', {
    title,
    description: description ? description.substring(0, 50) + '...' : null,
    professorIDFromBody: professorID,
    userIDFromAuth: req.user?.id,
    finalProfessorID,
    userRole: req.user?.role
  });
  
  // Validate required fields
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Project title is required' });
  }
  
  if (!finalProfessorID || isNaN(finalProfessorID)) {
    return res.status(400).json({ success: false, message: 'Professor ID is required and must be a valid number' });
  }
  
  // Verify professor exists
  try {
    const [profRows] = await db.query('SELECT professorID FROM Professor WHERE professorID = ?', [finalProfessorID]);
    if (!profRows.length) {
      return res.status(400).json({ success: false, message: `Professor ID ${finalProfessorID} does not exist in database` });
    }
  } catch (err) {
    console.error('Error checking professor:', err);
    return res.status(500).json({ success: false, message: 'Error validating professor ID' });
  }
  
  // Generate a unique integer projectID
  let projectID;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 100) {
    projectID = Math.floor(10000000 + Math.random() * 90000000);
    const [rows] = await db.query('SELECT projectID FROM ResearchProject WHERE projectID = ?', [projectID]);
    exists = rows.length > 0;
    attempts++;
  }
  
  if (exists) {
    return res.status(500).json({ success: false, message: 'Failed to generate unique project ID' });
  }
  
  try {
    const trimmedTitle = title.trim();
    const trimmedDescription = description ? description.trim() : null;
    
    await db.query(
      'INSERT INTO ResearchProject (projectID, title, description, professorID) VALUES (?, ?, ?, ?)',
      [projectID, trimmedTitle, trimmedDescription, finalProfessorID]
    );
    
    const [rows] = await db.query(
      `SELECT rp.projectID, rp.title, rp.description, rp.professorID,
       p.firstName as professorFirstName, p.lastName as professorLastName, p.facultyName
       FROM ResearchProject rp
       LEFT JOIN Professor p ON rp.professorID = p.professorID
       WHERE rp.projectID = ?`,
      [projectID]
    );

    
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Database error creating research project:', err);
    console.error('Error details:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
    
    // Handle specific database errors
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ success: false, message: `Invalid professor ID ${finalProfessorID}: professor does not exist in database` });
    } else if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'A project with this title already exists' });
    } else if (err.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ success: false, message: 'Required field is missing or invalid' });
    } else if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ success: false, message: 'Invalid data type for one of the fields' });
    }
    // Re-throw to be handled by errorHandler with original error message
    throw err;
  }
});

exports.get = researchController.get;
exports.update = researchController.update;
exports.delete = researchController.delete;
