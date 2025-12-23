// controllers/clubController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { createCRUDController } = require('./baseController');

const clubController = createCRUDController({
  tableName: 'Club',
  idField: 'clubID',
  selectFields: 'clubID, clubName, description, meetingLocation, boardMemberID',
  insertFields: ['clubName', 'description', 'meetingLocation', 'boardMemberID'],
  allowedUpdateFields: ['clubName', 'description', 'meetingLocation', 'boardMemberID'],
  resourceName: 'Club'
});

// Override list to include member count
exports.listClubs = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.clubID, c.clubName, c.description, c.meetingLocation, c.boardMemberID,
     (SELECT COUNT(*) FROM Joins WHERE clubID = c.clubID) as memberCount
     FROM Club c`
  );
  res.json({ success: true, data: rows });
});

// Override create to generate clubID
exports.createClub = asyncHandler(async (req, res) => {
  const { clubName, description, meetingLocation, boardMemberID } = req.body;
  
  // Generate a unique integer clubID
  let clubID;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 100) {
    // Generate a random integer between 10000000 and 99999999
    clubID = Math.floor(10000000 + Math.random() * 90000000);
    const [rows] = await db.query('SELECT clubID FROM Club WHERE clubID = ?', [clubID]);
    exists = rows.length > 0;
    attempts++;
  }
  
  if (exists) {
    return res.status(500).json({ success: false, message: 'Failed to generate unique club ID' });
  }

  // Validate boardMemberID if provided - must exist in student table
  let finalBoardMemberID = null;
  if (boardMemberID) {
    const boardMemberIDNum = parseInt(boardMemberID);
    if (!isNaN(boardMemberIDNum)) {
      // Check if student exists
      const [studentRows] = await db.query('SELECT studentID FROM Student WHERE studentID = ?', [boardMemberIDNum]);
      if (studentRows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Student with ID ${boardMemberIDNum} does not exist. Please provide a valid student ID or leave it empty.` 
        });
      }
      finalBoardMemberID = boardMemberIDNum;
    }
  }
  
  await db.query(
    'INSERT INTO Club (clubID, clubName, description, meetingLocation, boardMemberID) VALUES (?, ?, ?, ?, ?)',
    [
      clubID, 
      clubName, 
      description && description.trim() !== '' ? description : null, 
      meetingLocation && meetingLocation.trim() !== '' ? meetingLocation : null, 
      finalBoardMemberID
    ]
  );
  
  const [rows] = await db.query(
    'SELECT clubID, clubName, description, meetingLocation, boardMemberID FROM Club WHERE clubID = ?',
    [clubID]
  );
  
  res.status(201).json({ success: true, data: rows[0] });
});

exports.getClub = clubController.get;

// Override update to handle boardMemberID validation
exports.updateClub = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { clubName, description, meetingLocation, boardMemberID } = req.body;

  // Validate boardMemberID if provided
  let finalBoardMemberID = null;
  if (boardMemberID !== undefined && boardMemberID !== null && boardMemberID !== '') {
    const boardMemberIDNum = parseInt(boardMemberID);
    if (!isNaN(boardMemberIDNum)) {
      // Check if student exists
      const [studentRows] = await db.query('SELECT studentID FROM Student WHERE studentID = ?', [boardMemberIDNum]);
      if (studentRows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Student with ID ${boardMemberIDNum} does not exist. Please provide a valid student ID or leave it empty.` 
        });
      }
      finalBoardMemberID = boardMemberIDNum;
    }
  }

  const updates = [];
  const params = [];

  if (clubName !== undefined) {
    updates.push('clubName = ?');
    params.push(clubName);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description && description.trim() !== '' ? description : null);
  }
  if (meetingLocation !== undefined) {
    updates.push('meetingLocation = ?');
    params.push(meetingLocation && meetingLocation.trim() !== '' ? meetingLocation : null);
  }
  if (boardMemberID !== undefined) {
    updates.push('boardMemberID = ?');
    params.push(finalBoardMemberID);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  params.push(id);

  await db.query(
    `UPDATE Club SET ${updates.join(', ')} WHERE clubID = ?`,
    params
  );

  const [rows] = await db.query(
    'SELECT clubID, clubName, description, meetingLocation, boardMemberID FROM Club WHERE clubID = ?',
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({ success: false, message: 'Club not found' });
  }

  res.json({ success: true, data: rows[0] });
});

exports.deleteClub = clubController.delete;
