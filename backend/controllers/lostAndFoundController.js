// controllers/lostAndFoundController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { createCRUDController } = require('./baseController');
const { sendEmail } = require('../utils/email');

const lostAndFoundController = createCRUDController({
  tableName: 'LostAndFound',
  idField: 'recordID',
  selectFields: 'recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID, studentID',
  insertFields: ['itemName', 'itemDescription', 'category', 'dateReported', 'status', 'studentAffairsOfficerID', 'studentID'],
  allowedUpdateFields: ['itemName', 'itemDescription', 'category', 'dateReported', 'status', 'studentAffairsOfficerID', 'studentID'],
  resourceName: 'Lost and Found Item'
});

// Override create to generate recordID and handle studentID
exports.create = asyncHandler(async (req, res) => {
  const { itemName, itemDescription, category, dateReported, status, staffID, studentAffairsOfficerID, studentID } = req.body;
  
  // Use studentAffairsOfficerID if provided, otherwise staffID (for backward compatibility), otherwise null
  const officerID = studentAffairsOfficerID || staffID || null;
  
  // Generate a unique integer recordID
  let recordID;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 100) {
    // Generate a random integer between 10000000 and 99999999
    recordID = Math.floor(10000000 + Math.random() * 90000000);
    const [rows] = await db.query('SELECT recordID FROM LostAndFound WHERE recordID = ?', [recordID]);
    exists = rows.length > 0;
    attempts++;
  }
  
  if (exists) {
    return res.status(500).json({ success: false, message: 'Failed to generate unique record ID' });
  }
  
  try {
    // Check if studentID column exists, if not, it will be null
    await db.query(
      'INSERT INTO LostAndFound (recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID, studentID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        recordID,
        itemName,
        itemDescription && itemDescription.trim() !== '' ? itemDescription : null,
        category || null,
        dateReported || null,
        status || 'pending',
        officerID ? parseInt(officerID) : null,
        studentID ? parseInt(studentID) : null
      ]
    );
    
    const [rows] = await db.query(
      'SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID, studentID FROM LostAndFound WHERE recordID = ?',
      [recordID]
    );
    
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error creating lost and found item:', error);
    // If studentID column doesn't exist, try without it
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage?.includes('studentID')) {
      try {
        await db.query(
          'INSERT INTO LostAndFound (recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            recordID,
            itemName,
            itemDescription && itemDescription.trim() !== '' ? itemDescription : null,
            category || null,
            dateReported || null,
            status || 'pending',
            officerID ? parseInt(officerID) : null
          ]
        );
        const [rows] = await db.query(
          'SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID FROM LostAndFound WHERE recordID = ?',
          [recordID]
        );
        return res.status(201).json({ success: true, data: rows[0] });
      } catch (retryError) {
        return res.status(500).json({ 
          success: false, 
          message: retryError.sqlMessage || 'Failed to create lost and found item' 
        });
      }
    }
    return res.status(500).json({ 
      success: false, 
      message: error.sqlMessage || 'Failed to create lost and found item' 
    });
  }
});

exports.get = lostAndFoundController.get;
exports.list = lostAndFoundController.list;

// Override update to send email when status changes to "resolved" (found)
exports.update = asyncHandler(async (req, res) => {
  const recordID = req.params.id;
  const { status, itemName, itemDescription, category, dateReported, studentAffairsOfficerID, studentID } = req.body;
  
  // Get current item to check if status is changing to "resolved"
  // Try with studentID first, fallback if column doesn't exist
  let currentRows;
  let currentItem;
  try {
    [currentRows] = await db.query(
      'SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID, studentID FROM LostAndFound WHERE recordID = ?',
      [recordID]
    );
  } catch (error) {
    // If studentID column doesn't exist, query without it
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage?.includes('studentID')) {
      [currentRows] = await db.query(
        'SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID FROM LostAndFound WHERE recordID = ?',
        [recordID]
      );
    } else {
      throw error;
    }
  }
  
  if (!currentRows || !currentRows.length) {
    return res.status(404).json({ success: false, message: 'Lost and Found Item not found' });
  }
  
  currentItem = currentRows[0];
  const wasResolved = currentItem.status === 'resolved';
  const isNowResolved = status === 'resolved';
  const statusChangedToResolved = !wasResolved && isNowResolved;
  
  // Build update query
  const updates = [];
  const params = [];
  
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (itemName !== undefined) {
    updates.push('itemName = ?');
    params.push(itemName);
  }
  if (itemDescription !== undefined) {
    updates.push('itemDescription = ?');
    params.push(itemDescription && itemDescription.trim() !== '' ? itemDescription : null);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category || null);
  }
  if (dateReported !== undefined) {
    updates.push('dateReported = ?');
    params.push(dateReported || null);
  }
  if (studentAffairsOfficerID !== undefined) {
    updates.push('studentAffairsOfficerID = ?');
    params.push(studentAffairsOfficerID ? parseInt(studentAffairsOfficerID) : null);
  }
  if (studentID !== undefined) {
    updates.push('studentID = ?');
    params.push(studentID ? parseInt(studentID) : null);
  }
  
  if (!updates.length) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }
  
  params.push(recordID);
  
  try {
    // Try with studentID column first
    let sql = `UPDATE LostAndFound SET ${updates.join(', ')} WHERE recordID = ?`;
    await db.query(sql, params);
    
    // Get updated item
    const [updatedRows] = await db.query(
      'SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID, studentID FROM LostAndFound WHERE recordID = ?',
      [recordID]
    );
    
    const updatedItem = updatedRows[0] || currentItem;
    
    // Send email if status changed to "resolved" and we have a studentID
    // Use updatedItem.studentID if available, otherwise try to get it from the update
    const studentIDForEmail = updatedItem.studentID || (studentID ? parseInt(studentID) : null);
    if (statusChangedToResolved && studentIDForEmail) {
      try {
        // Get student email
        const [studentRows] = await db.query(
          'SELECT universityMail, firstName, lastName FROM Student WHERE studentID = ?',
          [studentIDForEmail]
        );
        
        if (studentRows.length > 0) {
          const student = studentRows[0];
          const studentEmail = student.universityMail;
          const studentName = `${student.firstName} ${student.lastName}`.trim() || 'Student';
          
          // Get officer name
          let officerName = 'Student Affairs Officer';
          if (updatedItem.studentAffairsOfficerID) {
            const [officerRows] = await db.query(
              'SELECT firstName, lastName FROM StudentAffairsOfficer WHERE studentAffairsOfficerID = ?',
              [updatedItem.studentAffairsOfficerID]
            );
            if (officerRows.length > 0) {
              officerName = `${officerRows[0].firstName} ${officerRows[0].lastName}`.trim();
            }
          }
          
          // Send email
          const emailSubject = 'Lost & Found Item Found - BeyondBooks';
          const itemDescription = updatedItem.itemDescription || updatedItem.itemName;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4A70A9;">Good News!</h2>
              <p>Dear ${studentName},</p>
              <p>Your missing item "<strong>${updatedItem.itemName}</strong>" has been found. Go to the Loss and Found to get it.</p>
              ${itemDescription ? `<p><strong>Item Details:</strong> ${itemDescription}</p>` : ''}
              <p>Stay Safe!</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">Best regards,<br>${officerName}<br>Student Affairs Officer</p>
            </div>
          `;
          
          await sendEmail(studentEmail, emailSubject, emailHtml);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the update if email fails
      }
    }
    
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating lost and found item:', error);
    // If studentID column doesn't exist, try without it
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage?.includes('studentID')) {
      // Remove studentID from updates
      const updatesWithoutStudentID = updates.filter((_, index) => {
        const fieldIndex = Math.floor(index);
        return !updates[fieldIndex]?.includes('studentID');
      });
      const paramsWithoutStudentID = params.filter((_, index) => {
        // Remove studentID value from params
        return index < params.length - 1; // Keep the recordID at the end
      });
      paramsWithoutStudentID.push(recordID);
      
      if (updatesWithoutStudentID.length > 0) {
        const sql = `UPDATE LostAndFound SET ${updatesWithoutStudentID.join(', ')} WHERE recordID = ?`;
        await db.query(sql, paramsWithoutStudentID);
        
        const [updatedRows] = await db.query(
          'SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID FROM LostAndFound WHERE recordID = ?',
          [recordID]
        );
        
        return res.json({ success: true, data: updatedRows[0] });
      }
    }
    return res.status(500).json({ 
      success: false, 
      message: error.sqlMessage || 'Failed to update lost and found item' 
    });
  }
});

exports.delete = lostAndFoundController.delete;