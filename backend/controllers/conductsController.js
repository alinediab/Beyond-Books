// controllers/conductsController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.addConduct = asyncHandler(async (req, res) => {
  const { studentID, projectID } = req.body;

  // Validate required fields
  if (!studentID) {
    return res.status(400).json({ 
      success: false, 
      message: 'Student ID is required' 
    });
  }

  if (!projectID) {
    return res.status(400).json({ 
      success: false, 
      message: 'Project ID is required' 
    });
  }

  // Check if application already exists
  try {
    const [existing] = await db.query(
      'SELECT * FROM Conducts WHERE studentID = ? AND projectID = ?',
      [studentID, projectID]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this project' 
      });
    }
  } catch (error) {
    console.error('Error checking existing application:', error);
  }

  // Insert the application
  try {
    await db.query(
      'INSERT INTO Conducts (studentID, projectID, status, appliedDate) VALUES (?, ?, ?, CURDATE())',
      [studentID, projectID, 'pending']
    );
    
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error adding conduct:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });

    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this project' 
      });
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid student ID or project ID. Please ensure both exist in the database.' 
      });
    } else if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ 
        success: false, 
        message: 'Required field is missing or invalid' 
      });
    }

    // Generic error
    return res.status(500).json({ 
      success: false, 
      message: error.sqlMessage || 'Failed to submit application. Please try again.' 
    });
  }
});

exports.removeConduct = asyncHandler(async (req, res) => {
  const { studentID, projectID } = req.params;
  await db.query('DELETE FROM Conducts WHERE studentID = ? AND projectID = ?', [studentID, projectID]);
  res.json({ success: true, message: 'Removed' });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { studentID, projectID } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Status is required' 
    });
  }

  // Validate status value
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  // Check if application exists
  const [rows] = await db.query(
    'SELECT * FROM Conducts WHERE studentID = ? AND projectID = ?',
    [studentID, projectID]
  );

  if (rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Application not found' 
    });
  }

  // Update status in database
  await db.query(
    'UPDATE Conducts SET status = ? WHERE studentID = ? AND projectID = ?',
    [status, studentID, projectID]
  );

  res.json({ success: true, message: 'Status updated successfully' });
});

exports.list = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Conducts');
  res.json({ success: true, data: rows });
});
